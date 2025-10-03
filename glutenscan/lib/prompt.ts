import { type AnalysisResult } from "./schema";

export type PromptContext = {
  productName?: string;
  locale?: string;
};

export const buildAnalysisPrompt = (text: string, heuristics: AnalysisResult, context: PromptContext = {}) => {
  const locale = context.locale ?? "fr-FR";

  return `Tu es un assistant de securite alimentaire specialise dans le regime sans gluten.
Analyse la liste d''ingredients suivante et produis une reponse JSON valide avec la cle "verdict" (safe|warning|unsafe|unknown),
"confidence" (nombre entre 0 et 1), "reasoning" (explication concise en ${locale}) et "terms" (tableau d''objets {"term","matched","rationale"}).
Respecte les heuristiques suivantes: ${JSON.stringify(heuristics.terms)}.
Texte a analyser: ${text}`;
};

export const systemPrompt = `Tu es un expert en reglementation alimentaire europeenne.
Reponds uniquement au format JSON valide sans texte additionnel.`;
