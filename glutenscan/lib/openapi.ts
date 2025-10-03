import type { OpenAPIV3_1 } from "openapi-types";

const analysisResultSchema: OpenAPIV3_1.SchemaObject = {
  type: "object",
  required: ["verdict", "confidence", "reasoning", "terms"],
  properties: {
    verdict: {
      type: "string",
      enum: ["safe", "warning", "unsafe", "unknown"],
      description: "Verdict principal"
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
      description: "Score de confiance"
    },
    reasoning: {
      type: "string",
      description: "Explication en français"
    },
    terms: {
      type: "array",
      items: {
        type: "object",
        required: ["term", "matched"],
        properties: {
          term: { type: "string" },
          matched: { type: "boolean" },
          rationale: { type: "string" }
        }
      }
    }
  }
};

export const buildOpenApiDocument = (): OpenAPIV3_1.Document => ({
  openapi: "3.0.3",
  info: {
    title: "GlutenScan API",
    version: "0.1.0",
    description: "API d''analyse de textes et images pour le gluten"
  },
  servers: [
    {
      url: "https://glutenscan.example.com",
      description: "Production"
    }
  ],
  paths: {
    "/api/analyze-text": {
      post: {
        tags: ["Analysis"],
        summary: "Analyse un texte d''ingrédients",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["text"],
                properties: {
                  text: { type: "string" },
                  locale: { type: "string" },
                  productName: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Analyse réussie",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["result", "source", "rawText"],
                  properties: {
                    result: analysisResultSchema,
                    source: { type: "string", enum: ["text"] },
                    rawText: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/analyze-photo": {
      post: {
        tags: ["Analysis"],
        summary: "Analyse une photo d''ingrédients",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: {
                    type: "string",
                    format: "binary"
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Analyse réussie",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["result", "source", "rawText", "ocrProvider"],
                  properties: {
                    result: analysisResultSchema,
                    source: { type: "string", enum: ["photo"] },
                    rawText: { type: "string" },
                    ocrProvider: { type: "string" },
                    durationMs: { type: "number" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/alt-products": {
      get: {
        tags: ["Alternatives"],
        summary: "Cherche des alternatives sans gluten",
        parameters: [
          {
            name: "barcode",
            in: "query",
            schema: { type: "string" }
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" }
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 25, default: 5 }
          }
        ],
        responses: {
          "200": {
            description: "Alternatives proposées",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["products"],
                  properties: {
                    products: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["id", "name"],
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          brand: { type: "string" },
                          imageUrl: { type: "string", format: "uri" },
                          url: { type: "string", format: "uri" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
});
