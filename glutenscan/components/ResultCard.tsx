import Badge from "./Badge";
import { type AnalysisResult } from "../lib/schema";

const verdictLabel: Record<AnalysisResult["verdict"], string> = {
  safe: "Sans gluten",
  warning: "Attention",
  unsafe: "Contient du gluten",
  unknown: "Inconnu"
};

type ResultCardProps = {
  result: AnalysisResult;
  source: "photo" | "text";
  rawText: string;
};

export default function ResultCard({ result, source, rawText }: ResultCardProps) {
  return (
    <section className="result-card">
      <header>
        <h2>Resultat</h2>
        <Badge variant={result.verdict}>{verdictLabel[result.verdict]}</Badge>
        <span className="confidence">{Math.round(result.confidence * 100)}% confiance</span>
      </header>

      <p className="reasoning">{result.reasoning}</p>

      <div className="terms">
        <h3>Termes cles detectes</h3>
        <ul>
          {result.terms.map((term) => (
            <li key={term.term} className={term.matched ? "term-match" : "term-ok"}>
              <strong>{term.term}</strong>
              {term.rationale ? <span>{term.rationale}</span> : null}
            </li>
          ))}
        </ul>
      </div>

      <footer>
        <p className="source">Source: {source === "photo" ? "Analyse photo" : "Analyse texte"}</p>
        <details>
          <summary>Texte extrait</summary>
          <pre>{rawText}</pre>
        </details>
      </footer>
    </section>
  );
}
