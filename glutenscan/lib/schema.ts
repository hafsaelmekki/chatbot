import { z } from "zod";

export const analysisVerdictEnum = z.enum(["safe", "warning", "unsafe", "unknown"]);

export const analysisTermSchema = z.object({
  term: z.string(),
  matched: z.boolean(),
  rationale: z.string().optional()
});

export const analysisResultSchema = z.object({
  verdict: analysisVerdictEnum,
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  terms: z.array(analysisTermSchema)
});

export const analyzeTextRequestSchema = z.object({
  text: z.string().min(1, "Le texte a analyser est requis"),
  locale: z.string().default("fr-FR"),
  productName: z.string().optional()
});

export const analyzeTextResponseSchema = z.object({
  result: analysisResultSchema,
  source: z.literal("text"),
  rawText: z.string()
});

export const analyzePhotoResponseSchema = z.object({
  result: analysisResultSchema,
  source: z.literal("photo"),
  rawText: z.string(),
  ocrProvider: z.string(),
  durationMs: z.number().optional()
});

export const altProductsQuerySchema = z.object({
  barcode: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(25).default(5)
});

export const altProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string().optional(),
  imageUrl: z.string().url().optional(),
  url: z.string().url().optional()
});

export const altProductsResponseSchema = z.object({
  products: z.array(altProductSchema)
});

export type AnalysisVerdict = z.infer<typeof analysisVerdictEnum>;
export type AnalysisTerm = z.infer<typeof analysisTermSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type AnalyzeTextRequest = z.infer<typeof analyzeTextRequestSchema>;
export type AnalyzeTextResponse = z.infer<typeof analyzeTextResponseSchema>;
export type AnalyzePhotoResponse = z.infer<typeof analyzePhotoResponseSchema>;
export type AltProductsResponse = z.infer<typeof altProductsResponseSchema>;
