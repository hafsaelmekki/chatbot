import { runLocalOcr } from "./tesseract";
import { runCloudOcr } from "./cloud";

export type OcrResult = {
  text: string;
  confidence: number;
  provider: "local" | "cloud";
};

export const runOcr = async (file: Blob, locale = "fra"): Promise<OcrResult> => {
  const buffer = await file.arrayBuffer();
  const provider = (process.env.OCR_PROVIDER ?? "local").toLowerCase();

  if (provider === "cloud") {
    const cloud = await runCloudOcr({ image: buffer, locale });
    return { ...cloud, provider: "cloud" };
  }

  const local = await runLocalOcr(buffer, `${locale}+eng`);
  return { ...local, provider: "local" };
};
