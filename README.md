# Chatbot Quiz (Gradio + Hugging Face)

Une petite application de quiz sous forme de chatbot avec Gradio. Les réponses sont vérifiées via similarité sémantique (Hugging Face) quand possible, sinon par une correspondance lexicale simple.

## Fonctionnalités

- Chat en direct avec `gr.Chatbot` (tape `start` pour démarrer)
- Questions à choix (facultatif) ou ouvertes
- Vérification des réponses :
  - `sentence-transformers`/`transformers` pour embeddings et similarité cosinus
  - Fallback lexical (Jaccard) si aucun modèle n’est disponible
- Exemple de quiz dans `quiz/quiz_data.json`

## Installation

1. Créez et activez un environnement Python 3.9+.
2. Installez les dépendances :

   ```bash
   pip install -r requirements.txt
   ```

   Remarques :
   - La première exécution téléchargera les modèles depuis Hugging Face (connexion internet requise).
   - Sur certaines plateformes, l’installation de `torch` peut nécessiter des wheels spécifiques. Consultez https://pytorch.org/ si besoin.

## Lancer l’application

```bash
python app.py
```

Ensuite, ouvrez l’URL Gradio fournie (typiquement `http://127.0.0.1:7860`).

Dans le chat :

- Tapez `start` pour commencer le quiz
- Envoyez vos réponses question par question
- Le score s’affiche à la fin

## Personnaliser le quiz

Modifiez `quiz/quiz_data.json` et ajoutez vos questions :

```json
[
  {
    "id": 1,
    "topic": "Culture générale",
    "question": "Quelle est la capitale de la France ?",
    "answers": ["Paris"],
    "choices": ["Lyon", "Marseille", "Paris", "Bordeaux"],
    "explanation": "La capitale de la France est Paris."
  }
]
```

- `answers`: liste d’expressions acceptées (mettez plusieurs variantes)
- `choices`: optionnel, pour proposer des choix (QCM)
- `explanation`: message affiché après la correction

Vous pouvez aussi changer le fichier en passant une variable env :

```bash
QUIZ_PATH=mon_quiz.json python app.py
```

## Notes techniques

- Embedder prioritaire : `sentence-transformers/all-MiniLM-L6-v2`
- Fallback `transformers` : même modèle avec moyennage des sorties, normalisation L2
- Seuil de similarité par défaut : 0.62 (ajustez dans `AnswerChecker.is_correct` si nécessaire)

