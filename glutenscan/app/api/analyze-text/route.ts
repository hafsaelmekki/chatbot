import { NextRequest, NextResponse } from "next/server";
import { analyzeWithLLM } from "@/lib/llm";
import { analyzeTextRequestSchema } from "@/lib/schema";
import { enforceCors, enforceJsonContentType } from "@/lib/security";
import { rateLimit } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const cors = enforceCors(request);
  if (cors) {
    return cors;
  }

  const limited = rateLimit(request);
  if (limited) {
    return limited;
  }

  const contentTypeError = enforceJsonContentType(request);
  if (contentTypeError) {
    return contentTypeError;
  }

  try {
    const body = await request.json();
    const payload = analyzeTextRequestSchema.parse(body);

    const result = await analyzeWithLLM(payload.text, {
      locale: payload.locale,
      productName: payload.productName
    });

    return NextResponse.json({
      result,
      source: "text",
      rawText: payload.text
    });
  } catch (error) {
    logger.error({ error }, "Erreur analyse texte");
    return NextResponse.json({ error: "Analyse impossible" }, { status: 400 });
  }
}
