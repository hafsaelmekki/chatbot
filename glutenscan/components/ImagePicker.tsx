"use client";

import { type ChangeEvent, type FormEvent, useRef, useState } from "react";

type ImagePickerProps = {
  onPhotoSubmit: (file: File) => Promise<void>;
  onTextSubmit: (text: string) => Promise<void>;
  isLoading: boolean;
};

export default function ImagePicker({ onPhotoSubmit, onTextSubmit, isLoading }: ImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [textValue, setTextValue] = useState("");

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await onPhotoSubmit(file);
    event.target.value = "";
  };

  const handleTextSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = textValue.trim();
    if (!trimmed) {
      return;
    }

    await onTextSubmit(trimmed);
    setTextValue("");
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="picker">
      <div className="picker-upload">
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} hidden />
        <button type="button" onClick={triggerFileInput} disabled={isLoading}>
          {isLoading ? "Analyse en cours..." : "Importer / Prendre une photo"}
        </button>
      </div>

      <form className="picker-text" onSubmit={handleTextSubmit}>
        <textarea
          placeholder="Ou collez la liste d'ingredients ici"
          value={textValue}
          onChange={(event) => setTextValue(event.target.value)}
          rows={4}
        />
        <button type="submit" disabled={isLoading || textValue.trim().length === 0}>
          Analyser le texte
        </button>
      </form>
    </section>
  );
}
