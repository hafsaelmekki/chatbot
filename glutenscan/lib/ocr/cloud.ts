export type CloudOcrOptions = {
  image: ArrayBuffer;
  locale?: string;
};

export type CloudOcrResult = {
  text: string;
  confidence: number;
};

export const runCloudOcr = async (_options: CloudOcrOptions): Promise<CloudOcrResult> => {
  throw new Error("Cloud OCR non configuré. Définissez l''intégration dans lib/ocr/cloud.ts.");
};
