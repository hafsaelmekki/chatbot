import { type AnalysisResult, analysisResultSchema } from "./schema";

const GLUTEN_PATTERNS: Array<{ pattern: RegExp; rationale: string }> = [
  { pattern: /\bbl[e\u00E9]\b/i, rationale: "Ble detecte" },
  { pattern: /\bgluten\b/i, rationale: "Mention explicite de gluten" },
  { pattern: /\borge\b/i, rationale: "Orge detectee" },
  { pattern: /\bseigle\b/i, rationale: "Seigle detecte" },
  { pattern: /\btriticale\b/i, rationale: "Triticale detecte" },
  { pattern: /\b[e\u00E9]peautre\b/i, rationale: "Epeautre detecte" }
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
    rationaleParts.push("Ingredients contenant du gluten detectes.");
  }

  if (hasAvoine) {
    verdict = verdict === "unsafe" ? verdict : "warning";
    confidence = Math.max(confidence, 0.75);
    rationaleParts.push("Presence d''avoine qui peut etre contaminee par du gluten.");
  }

  if (claimsGlutenFree && verdict !== "unsafe") {
    verdict = verdict === "warning" ? "warning" : "safe";
    confidence = Math.max(confidence, 0.6);
    rationaleParts.push("Mention sans gluten detectee.");
  }

  if (rationaleParts.length === 0) {
    rationaleParts.push("Aucun ingredient problematique detecte par les heuristiques.");
  }

  const terms = [
    ...matchedTerms.map(({ pattern, rationale }) => ({
      term: pattern.source,
      matched: true,
      rationale
    })),
    ...(hasAvoine
      ? [{ term: "avoine", matched: true, rationale: "Avoine detectee" }]
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
