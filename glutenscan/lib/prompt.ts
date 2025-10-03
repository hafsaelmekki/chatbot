import { type AnalysisResult } from "./schema";

export type PromptContext = {
  productName?: string;
  locale?: string;
};

export const buildAnalysisPrompt = (text: string, heuristics: AnalysisResult, context: PromptContext = {}) => {
  const locale = context.locale ?? "fr-FR";

  return `Tu es un assistant de s�curit� alimentaire sp�cialis� dans le r�gime sans gluten.
Analyse la liste d''ingr�dients suivante et produis une r�ponse JSON valide avec la cl� "verdict" (safe|warning|unsafe|unknown),
"confidence" (nombre entre 0 et 1), "reasoning" (explication concise en ${locale}) et "terms" (tableau d''objets {"term","matched","rationale"}).
Respecte les heuristiques suivantes: ${JSON.stringify(heuristics.terms)}.
Texte � analyser: ${text}`;
};

export const systemPrompt = `Tu es un expert en r�glementation alimentaire europ�enne.
R�ponds uniquement au format JSON valide sans texte additionnel.`;
