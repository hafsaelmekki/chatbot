import { NextRequest, NextResponse } from "next/server";
import { fetchAlternativeProducts } from "@/lib/off";
import { enforceCors } from "@/lib/security";
import { rateLimit } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const cors = enforceCors(request);
  if (cors) {
    return cors;
  }

  const limited = rateLimit(request);
  if (limited) {
    return limited;
  }

  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const payload = await fetchAlternativeProducts(params);

    return NextResponse.json(payload);
  } catch (error) {
    logger.error({ error }, "Erreur récupération alternatives");
    return NextResponse.json({ error: "Impossible de récupérer les alternatives" }, { status: 400 });
  }
}
