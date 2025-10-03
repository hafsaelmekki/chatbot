import { NextRequest, NextResponse } from "next/server";
import { analyzeWithLLM } from "@/lib/llm";
import { enforceCors, enforceMultipartContentType, maxUploadSizeBytes } from "@/lib/security";
import { rateLimit } from "@/lib/rateLimit";
import { runOcr } from "@/lib/ocr";
import { logger } from "@/lib/logger";
import { measure } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const cors = enforceCors(request);
  if (cors) {
    return cors;
  }

  const limited = rateLimit(request);
  if (limited) {
    return limited;
  }

  const contentTypeError = enforceMultipartContentType(request);
  if (contentTypeError) {
    return contentTypeError;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    if (file.size > maxUploadSizeBytes) {
      return NextResponse.json({ error: "Fichier trop volumineux" }, { status: 413 });
    }

    const { value: ocrPayload, duration } = await measure(() => runOcr(file));

    if (!ocrPayload.text) {
      return NextResponse.json({ error: "OCR non concluant" }, { status: 422 });
    }

    const result = await analyzeWithLLM(ocrPayload.text);

    return NextResponse.json({
      result,
      source: "photo",
      rawText: ocrPayload.text,
      ocrProvider: ocrPayload.provider,
      durationMs: duration
    });
  } catch (error) {
    logger.error({ error }, "Erreur analyse photo");
    return NextResponse.json({ error: "Analyse impossible" }, { status: 500 });
  }
}
