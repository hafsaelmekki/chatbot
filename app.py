import json
import math
import os
from typing import Dict, List, Tuple

import gradio as gr


# -----------------------------
# Quiz data loading
# -----------------------------


def load_quiz(path: str) -> List[Dict]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    # normalize
    quiz = []
    for i, q in enumerate(data):
        quiz.append(
            {
                "id": q.get("id", i + 1),
                "question": q["question"].strip(),
                "answers": [a.strip() for a in q.get("answers", [])],
                "choices": q.get("choices"),  # optional MCQ choices
                "explanation": q.get("explanation", ""),
                "topic": q.get("topic", None),
            }
        )
    return quiz


# -----------------------------
# Similarity / Answer checking
# -----------------------------


def try_build_embedder():
    """
    Attempt to build a semantic embedder using sentence-transformers.
    Fallback to transformers if available. Else None.
    Returns a callable: List[str] -> np.ndarray or None.
    """

    # Try sentence-transformers first
    try:
        from sentence_transformers import SentenceTransformer

        model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

        def _encode(texts: List[str]):
            return model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)

        return _encode
    except Exception:
        pass

    # Try raw transformers pooling as a fallback
    try:
        import numpy as np
        import torch
        from transformers import AutoModel, AutoTokenizer

        model_name = "sentence-transformers/all-MiniLM-L6-v2"
        tok = AutoTokenizer.from_pretrained(model_name)
        mod = AutoModel.from_pretrained(model_name)
        mod.eval()

        def mean_pool(last_hidden_state: "torch.Tensor", attention_mask: "torch.Tensor"):
            mask = attention_mask.unsqueeze(-1).expand(last_hidden_state.size()).float()
            masked = last_hidden_state * mask
            summed = masked.sum(dim=1)
            counts = mask.sum(dim=1).clamp(min=1e-9)
            emb = summed / counts
            # L2 normalize
            emb = emb / emb.norm(dim=1, keepdim=True).clamp(min=1e-9)
            return emb

        def _encode(texts: List[str]):
            with torch.no_grad():
                inputs = tok(texts, return_tensors="pt", padding=True, truncation=True)
                out = mod(**inputs)
                pooled = mean_pool(out.last_hidden_state, inputs["attention_mask"]).cpu().numpy()
            return pooled

        return _encode
    except Exception:
        pass

    # As a last resort, return None to use lexical fallback
    return None


def lexical_similarity(a: str, b: str) -> float:
    """Simple token Jaccard similarity as a lightweight fallback."""
    ta = {t for t in a.lower().split() if t}
    tb = {t for t in b.lower().split() if t}
    if not ta or not tb:
        return 0.0
    inter = len(ta & tb)
    union = len(ta | tb)
    return inter / union if union else 0.0


class AnswerChecker:
    def __init__(self):
        self._embed = try_build_embedder()

    def similarity(self, a: str, b: str) -> float:
        if self._embed is None:
            return lexical_similarity(a, b)
        try:
            import numpy as np

            embs = self._embed([a, b])
            v1, v2 = embs[0], embs[1]
            return float((v1 * v2).sum())
        except Exception:
            return lexical_similarity(a, b)

    def is_correct(self, user: str, golds: List[str], threshold: float = 0.62) -> Tuple[bool, float, str]:
        user = (user or "").strip()
        if not user:
            return False, 0.0, "Réponse vide."
        best_sim = -1.0
        best_gold = None
        for g in golds:
            s = self.similarity(user, g)
            if s > best_sim:
                best_sim = s
                best_gold = g
        ok = best_sim >= threshold
        return ok, best_sim, (best_gold or "")


# -----------------------------
# Chat / Quiz state + flow
# -----------------------------


def init_state(quiz: List[Dict]):
    return {
        "started": False,
        "index": 0,
        "score": 0,
        "total": len(quiz),
        "quiz": quiz,
        "checker": AnswerChecker(),
    }


def format_question(q: Dict, idx: int, total: int) -> str:
    base = f"Question {idx + 1}/{total}: {q['question']}"
    if q.get("choices"):
        choices = "\n".join([f"- {c}" for c in q["choices"]])
        base += f"\n\nChoix:\n{choices}"
    return base


def format_feedback(ok: bool, gold: str, sim: float, explanation: str) -> str:
    status = "✅ Correct" if ok else "❌ Incorrect"
    extra = f" (similarité: {sim:.2f})" if not math.isnan(sim) else ""
    base = f"{status}{extra}"
    if gold:
        base += f"\nRéponse attendue (exemple): {gold}"
    if explanation:
        base += f"\nInfo: {explanation}"
    return base


def respond(message: str, chat_history: List[Tuple[str, str]], state: Dict):
    quiz = state["quiz"]
    total = state["total"]

    # Not started yet
    if not state["started"]:
        if (message or "").strip().lower() in {"start", "go", "commencer", "démarrer", "demarrer"}:
            state["started"] = True
            state["index"] = 0
            state["score"] = 0
            bot = "Bienvenue dans le quiz !\n\n" + format_question(quiz[0], 0, total)
        else:
            bot = "Tape 'start' pour commencer le quiz."
        chat_history = chat_history + [(message, bot)]
        return "", chat_history, state

    # Started: evaluate current question, then advance
    i = state["index"]
    if i >= total:
        # Safety: already finished
        bot = f"Quiz terminé. Score: {state['score']}/{total}. Tape 'start' pour rejouer."
        chat_history = chat_history + [(message, bot)]
        state["started"] = False
        return "", chat_history, state

    q = quiz[i]
    ok, sim, gold = state["checker"].is_correct(message, q.get("answers", []))
    if ok:
        state["score"] += 1
    feedback = format_feedback(ok, gold, sim, q.get("explanation", ""))

    # Move to next
    state["index"] += 1
    if state["index"] >= total:
        bot = f"{feedback}\n\nTerminé ! Score: {state['score']}/{total}. Tape 'start' pour rejouer."
        state["started"] = False
    else:
        next_q = quiz[state["index"]]
        bot = f"{feedback}\n\n" + format_question(next_q, state["index"], total)

    chat_history = chat_history + [(message, bot)]
    return "", chat_history, state


def reset_chat():
    return [], {"started": False, "index": 0, "score": 0, "total": 0, "quiz": [], "checker": AnswerChecker()}


def build_demo(quiz_path: str = "quiz/quiz_data.json"):
    quiz = load_quiz(quiz_path)
    state = gr.State(init_state(quiz))

    with gr.Blocks(title="Chatbot Quiz - Gradio + Hugging Face") as demo:
        gr.Markdown(
            """
            # Chatbot Quiz
            - Tape `start` pour démarrer le quiz.
            - Réponds dans le chat; le score s'affiche à la fin.
            - Les réponses sont vérifiées par similarité sémantique (Hugging Face) si disponible, sinon par correspondance lexicale.
            """
        )

        chatbot = gr.Chatbot(height=420)
        msg = gr.Textbox(placeholder="Écris 'start' pour commencer, puis tes réponses...", scale=1)
        with gr.Row():
            submit = gr.Button("Envoyer", variant="primary")
            clear = gr.Button("Réinitialiser")

        # Wire interactions
        submit.click(respond, inputs=[msg, chatbot, state], outputs=[msg, chatbot, state])
        msg.submit(respond, inputs=[msg, chatbot, state], outputs=[msg, chatbot, state])
        clear.click(lambda: ([], init_state(quiz)), outputs=[chatbot, state])

    return demo


if __name__ == "__main__":
    qp = os.environ.get("QUIZ_PATH", "quiz/quiz_data.json")
    demo = build_demo(qp)
    demo.launch()

