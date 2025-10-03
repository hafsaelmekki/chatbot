import crypto from "node:crypto";

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

export const measure = async <T>(callback: () => Promise<T>) => {
  const start = now();
  const value = await callback();
  const duration = now() - start;
  return { value, duration };
};

export const hashText = (text: string) => {
  return crypto.createHash("sha256").update(text).digest("hex");
};

export const parseNumberEnv = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const parseAllowedOrigins = (value: string | undefined) => {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};
