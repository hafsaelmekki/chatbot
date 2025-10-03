import { NextRequest, NextResponse } from "next/server";
import { parseNumberEnv } from "./utils";

const windowMs = parseNumberEnv(process.env.RATE_LIMIT_WINDOW_MS, 60000);
const maxRequests = parseNumberEnv(process.env.RATE_LIMIT_MAX_REQUESTS, 30);

const buckets = new Map<string, { expiresAt: number; count: number }>();

export const rateLimit = (request: NextRequest) => {
  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "anonymous";
  const key = String(ip);
  const now = Date.now();

  const bucket = buckets.get(key);
  if (!bucket || bucket.expiresAt < now) {
    buckets.set(key, { expiresAt: now + windowMs, count: 1 });
    return null;
  }

  if (bucket.count >= maxRequests) {
    const retryAfter = Math.ceil((bucket.expiresAt - now) / 1000);
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "retry-after": String(retryAfter)
      }
    });
  }

  bucket.count += 1;
  return null;
};
