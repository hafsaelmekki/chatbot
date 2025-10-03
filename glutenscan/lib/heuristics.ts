import { type AnalysisResult, analysisResultSchema } from "./schema";

const GLUTEN_PATTERNS: Array<{ pattern: RegExp; rationale: string }> = [
  { pattern: /\bbl[e�]\b/i, rationale: "Bl� d�tect�" },
  { pattern: /\bgluten\b/i, rationale: "Mention explicite de gluten" },
  { pattern: /\borge\b/i, rationale: "Orge d�tect�e" },
  { pattern: /\bseigle\b/i, rationale: "Seigle d�tect�" },
  { pattern: /\btriticale\b/i, rationale: "Triticale d�tect�" },
  { pattern: /\b[e�]peautre\b/i, rationale: "�peautre d�tect�" }
];

const OAT_PATTERN = /\bavoine\b/i;
const GLUTEN_FREE_CLAIM = /sans\s+gluten/i;

const sanitizeText = (text: string) => text.toLowerCase().replace(/[\n\r]+/g, " ").trim();

export const analyzeWithHeuristics = (text: string): AnalysisResult => {
  const normalized = sanitizeText(text);

  const matchedTerms = GLUTEN_PATTERNS.filter(({ pattern }) => pattern.test(normalized));
  const hasAvoine = OAT_PATTERN.test(normalized);
  const claimsGlutenFree = GLUTEN_FREE_CLAIM.test(normalized);

  let verdict: AnalysisResult["verdict"] = "unknown";
  let confidence = 0.4;
  const rationaleParts: string[] = [];

  if (matchedTerms.length > 0) {
    verdict = "unsafe";
    confidence = 0.85;
    rationaleParts.push("Ingr�dients contenant du gluten d�tect�s.");
  }

  if (hasAvoine) {
    verdict = verdict === "unsafe" ? verdict : "warning";
    confidence = Math.max(confidence, 0.75);
    rationaleParts.push("Pr�sence d''avoine qui peut �tre contamin�e par du gluten.");
  }

  if (claimsGlutenFree && verdict !== "unsafe") {
    verdict = verdict === "warning" ? "warning" : "safe";
    confidence = Math.max(confidence, 0.6);
    rationaleParts.push("Mention sans gluten d�tect�e.");
  }

  if (rationaleParts.length === 0) {
    rationaleParts.push("Aucun ingr�dient probl�matique d�tect� par les heuristiques.");
  }

  const terms = [
    ...matchedTerms.map(({ pattern, rationale }) => ({
      term: pattern.source,
      matched: true,
      rationale
    })),
    ...(hasAvoine
      ? [{ term: "avoine", matched: true, rationale: "Avoine d�tect�e" }]
      : []),
    ...(claimsGlutenFree
      ? [{ term: "sans gluten", matched: false, rationale: "Mention sans gluten" }]
      : [])
  ];

  return analysisResultSchema.parse({
    verdict,
    confidence,
    reasoning: rationaleParts.join(" "),
    terms
  });
};

export const extractRelevantSentences = (text: string) => {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => {
      if (!sentence) {
        return false;
      }
      const normalized = sanitizeText(sentence);
      return (
        GLUTEN_PATTERNS.some(({ pattern }) => pattern.test(normalized)) ||
        OAT_PATTERN.test(normalized) ||
        GLUTEN_FREE_CLAIM.test(normalized)
      );
    });
};
