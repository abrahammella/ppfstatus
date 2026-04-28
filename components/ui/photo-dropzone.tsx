"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/*";

/** Drop area for a single image. Sets the chosen file on a hidden file input
 * so the surrounding `<form>` can submit it via FormData. */
export function PhotoDropzone({
  name,
  required = false,
  hint = "PNG, JPG, WEBP · máx 5MB",
}: {
  name: string;
  required?: boolean;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive object URL synchronously from file; useEffect only handles cleanup.
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function validate(f: File): string | null {
    if (!f.type.startsWith("image/")) return "El archivo debe ser una imagen.";
    if (f.size > MAX_BYTES) return "Foto demasiado grande (máx 5MB).";
    return null;
  }

  function adopt(f: File | null) {
    setError(null);
    if (!f) {
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    const err = validate(f);
    if (err) {
      setError(err);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    // Keep the underlying file input in sync so the surrounding form picks it up.
    if (inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(f);
      inputRef.current.files = dt.files;
    }
    setFile(f);
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept={ACCEPT}
        required={required}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => adopt(e.target.files?.[0] ?? null)}
      />

      <AnimatePresence mode="wait">
        {file && previewUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Vista previa" className="w-full max-h-56 object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 flex items-center justify-between">
              <div className="text-[11px] text-white truncate">
                {file.name}{" "}
                <span className="opacity-70">· {(file.size / 1024).toFixed(0)} KB</span>
              </div>
              <button
                type="button"
                onClick={() => adopt(null)}
                className="text-[11px] font-bold uppercase tracking-wide rounded-full bg-white/90 text-zinc-900 hover:bg-white px-2 py-0.5"
              >
                Quitar
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="drop"
            type="button"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25 }}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const f = e.dataTransfer.files?.[0] ?? null;
              if (f) adopt(f);
            }}
            className={clsx(
              "w-full flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition cursor-pointer",
              isDragging
                ? "border-brand-red-500 bg-brand-red-50/60 ring-4 ring-brand-red-100"
                : "border-zinc-300 bg-zinc-50/60 hover:border-zinc-400 hover:bg-zinc-50",
            )}
          >
            <span
              className={clsx(
                "size-9 rounded-xl flex items-center justify-center transition",
                isDragging ? "bg-brand-red-600 text-white" : "bg-white text-zinc-600 ring-1 ring-zinc-200",
              )}
              aria-hidden
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                <path d="M12 16V4M6 10l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="text-sm font-semibold text-zinc-700">
              {isDragging ? "Suelta la foto aquí" : "Arrastra una foto o haz clic"}
            </div>
            <div className="text-[11px] text-zinc-500">{hint}</div>
          </motion.button>
        )}
      </AnimatePresence>

      {error ? (
        <div className="text-xs font-medium text-brand-red-700 bg-brand-red-50 border border-brand-red-100 rounded-xl px-3 py-2">
          {error}
        </div>
      ) : null}
    </div>
  );
}
