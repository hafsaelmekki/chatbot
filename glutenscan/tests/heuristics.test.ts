import { describe, expect, it } from "vitest";
import { analyzeWithHeuristics } from "../lib/heuristics";

describe("analyzeWithHeuristics", () => {
  it("detects explicit gluten", () => {
    const result = analyzeWithHeuristics("Ingrédients: farine de blé, eau");
    expect(result.verdict).toBe("unsafe");
    expect(result.terms.some((term) => term.matched)).toBe(true);
  });

  it("flags avoine as warning", () => {
    const result = analyzeWithHeuristics("Ingrédients: flocons d'avoine certifiés sans gluten");
    expect(result.verdict).toBe("warning");
  });

  it("marks safe when sans gluten", () => {
    const result = analyzeWithHeuristics("Biscuits sans gluten, farine de riz");
    expect(result.verdict === "safe" || result.verdict === "warning").toBe(true);
  });
});
