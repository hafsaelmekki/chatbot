import { type AnalysisResult } from "./schema";

export type PromptContext = {
  productName?: string;
  locale?: string;
};

export const buildAnalysisPrompt = (text: string, heuristics: AnalysisResult, context: PromptContext = {}) => {
  const locale = context.locale ?? "fr-FR";

  return `Tu es un assistant de sécurité alimentaire spécialisé dans le régime sans gluten.
Analyse la liste d''ingrédients suivante et produis une réponse JSON valide avec la clé "verdict" (safe|warning|unsafe|unknown),
"confidence" (nombre entre 0 et 1), "reasoning" (explication concise en ${locale}) et "terms" (tableau d''objets {"term","matched","rationale"}).
Respecte les heuristiques suivantes: ${JSON.stringify(heuristics.terms)}.
Texte à analyser: ${text}`;
};

export const systemPrompt = `Tu es un expert en réglementation alimentaire européenne.
Réponds uniquement au format JSON valide sans texte additionnel.`;
