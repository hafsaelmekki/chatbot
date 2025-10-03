import Tesseract from "tesseract.js";

export const runLocalOcr = async (buffer: ArrayBuffer, language = "fra+eng") => {
  const { data } = await Tesseract.recognize(buffer, language, {
    tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK
  });

  return {
    text: data.text.trim(),
    confidence: data.confidence / 100
  };
};
