"use client";

import { useRef, useState } from "react";
import styles from "./FileUpload.module.css";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

interface FileUploadProps {
  onText: (text: string) => void;
}

export function FileUpload({ onText }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function readFile(file: File) {
    setError(null);
    if (!file.name.endsWith(".txt")) {
      setError("Only .txt files are supported.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError(
        `File is too large (max 5 MB). This file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`,
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") onText(result);
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  }

  return (
    <button
      type="button"
      className={`${styles.dropZone} ${dragging ? styles.dragging : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      aria-label="Upload a .txt file"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt"
        className={styles.hiddenInput}
        onChange={handleChange}
        tabIndex={-1}
      />
      <span className={styles.icon}>📄</span>
      <span className={styles.label}>Drop a .txt file or click to browse</span>
      <span className={styles.hint}>Max 5 MB</span>
      {error && <span className={styles.error}>{error}</span>}
    </button>
  );
}
