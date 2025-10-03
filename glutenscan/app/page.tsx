"use client";

import { useState } from "react";
import ImagePicker from "../components/ImagePicker";
import ResultCard from "../components/ResultCard";
import { type AnalysisResult } from "../lib/schema";

type ResultState = {
  result: AnalysisResult;
  source: "photo" | "text";
  rawText: string;
};

export default function HomePage() {
  const [result, setResult] = useState<ResultState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoSubmit = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    await submitRequest("/api/analyze-photo", {
      body: formData
    });
  };

  const handleTextSubmit = async (text: string) => {
    await submitRequest("/api/analyze-text", {
      body: JSON.stringify({ text }),
      headers: {
        "Content-Type": "application/json"
      }
    });
  };

  const submitRequest = async (
    endpoint: string,
    options: { body: BodyInit; headers?: Record<string, string> }
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(endpoint, {
        method: "POST",
        body: options.body,
        headers: options.headers
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const payload = await response.json();
      setResult({
        result: payload.result,
        source: payload.source,
        rawText: payload.rawText
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container">
      <header className="hero">
        <h1>GlutenScan</h1>
        <p>Analysez vos produits alimentaires pour détecter la présence de gluten.</p>
      </header>

      <ImagePicker onPhotoSubmit={handlePhotoSubmit} onTextSubmit={handleTextSubmit} isLoading={isLoading} />

      {error ? <p className="error">{error}</p> : null}

      {result ? <ResultCard result={result.result} source={result.source} rawText={result.rawText} /> : null}
    </main>
  );
}
