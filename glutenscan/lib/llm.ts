import OpenAI from "openai";
import { analyzeWithHeuristics } from "./heuristics";
import { type AnalysisResult, analysisResultSchema } from "./schema";
import { buildAnalysisPrompt, systemPrompt, type PromptContext } from "./prompt";
import { logger } from "./logger";

let openaiClient: OpenAI | null = null;

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  return openaiClient;
};

export const analyzeWithLLM = async (text: string, context: PromptContext = {}): Promise<AnalysisResult> => {
  const heuristics = analyzeWithHeuristics(text);

  const client = getOpenAIClient();
  if (!client) {
    logger.warn("OPENAI_API_KEY absent, usage des heuristiques seulement");
    return heuristics;
  }

  try {
    const response = await client.responses.create({
      model: process.env.LLM_MODEL ?? "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: buildAnalysisPrompt(text, heuristics, context)
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "gluten_analysis",
          schema: {
            type: "object",
            properties: {
              verdict: { type: "string", enum: ["safe", "warning", "unsafe", "unknown"] },
              confidence: { type: "number" },
              reasoning: { type: "string" },
              terms: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    term: { type: "string" },
                    matched: { type: "boolean" },
                    rationale: { type: "string" }
                  },
                  required: ["term", "matched"],
                  additionalProperties: false
                }
              }
            },
            required: ["verdict", "confidence", "reasoning", "terms"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.output_text;
    if (!content) {
      throw new Error("Réponse vide de l''assistant");
    }

    const parsed = JSON.parse(content);
    return analysisResultSchema.parse(parsed);
  } catch (error) {
    logger.error({ error }, "Échec de l'appel LLM, retour aux heuristiques");
    return heuristics;
  }
};
