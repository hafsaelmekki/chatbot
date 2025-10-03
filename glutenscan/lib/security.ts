import { NextRequest, NextResponse } from "next/server";
import { parseAllowedOrigins, parseNumberEnv } from "./utils";

const allowedOrigins = new Set(parseAllowedOrigins(process.env.ALLOWED_ORIGINS));
export const maxUploadSizeBytes = parseNumberEnv(process.env.MAX_UPLOAD_SIZE_MB, 10) * 1024 * 1024;

export const enforceCors = (request: NextRequest) => {
  if (allowedOrigins.size === 0) {
    return null;
  }

  const origin = request.headers.get("origin");
  if (!origin || allowedOrigins.has(origin)) {
    return null;
  }

  return NextResponse.json({ error: "Origine non autorisée" }, { status: 403 });
};

export const enforceJsonContentType = (request: NextRequest) => {
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return NextResponse.json({ error: "Le corps doit être en JSON" }, { status: 415 });
  }

  return null;
};

export const enforceMultipartContentType = (request: NextRequest) => {
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Le corps doit être en multipart/form-data" }, { status: 415 });
  }

  return null;
};
