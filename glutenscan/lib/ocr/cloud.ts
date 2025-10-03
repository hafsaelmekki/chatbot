export type CloudOcrOptions = {
  image: ArrayBuffer;
  locale?: string;
};

export type CloudOcrResult = {
  text: string;
  confidence: number;
};

export const runCloudOcr = async (_options: CloudOcrOptions): Promise<CloudOcrResult> => {
  throw new Error("Cloud OCR non configur�. D�finissez l''int�gration dans lib/ocr/cloud.ts.");
};
