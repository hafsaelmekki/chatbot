import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/analyze-text/route";

const toNextRequest = (body: unknown) => {
  const request = new Request("http://localhost/api/analyze-text", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "127.0.0.1"
    },
    body: JSON.stringify(body)
  });

  return NextRequest.from(request);
};

describe("POST /api/analyze-text", () => {
  it("returns a structured analysis", async () => {
    const response = await POST(toNextRequest({ text: "Ingrédients: farine de blé" }));
    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload.source).toBe("text");
    expect(payload.result).toHaveProperty("verdict");
  });

  it("fails on missing text", async () => {
    const response = await POST(toNextRequest({}));
    expect(response.status).toBe(400);
  });
});
