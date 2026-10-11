"use client";

import React, { useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 8,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setErrorMessage(`You can upload a maximum of ${maxImages} images.`);
      return;
    }

    setErrorMessage("");
    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Client side validation
        if (!file.type.startsWith("image/")) {
          setErrorMessage("Only image files (JPG, PNG, WEBP) are supported.");
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          setErrorMessage("Each image file must be smaller than 5MB.");
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.url) {
            uploadedUrls.push(data.url);
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          setErrorMessage(errData.error || "Failed to upload one of the images.");
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMessage("Network error during image upload.");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Product Images ({images.length}/{maxImages})
        </label>
        <span className="text-xs text-slate-500">Max 5MB per file</span>
      </div>

      {/* Grid of uploaded images + upload button */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((url, idx) => (
          <div
            key={idx}
            className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800"
          >
            <Image
              src={url}
              alt={`Listing image ${idx + 1}`}
              fill
              className="object-cover"
              unoptimized
            />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1.5 right-1.5 rounded-full bg-slate-900/80 p-1 text-white shadow-xs backdrop-blur-xs transition hover:bg-rose-600"
              title="Remove photo"
            >
              <X className="h-4 w-4" />
            </button>
            {idx === 0 && (
              <span className="absolute bottom-1.5 left-1.5 rounded-md bg-emerald-600/90 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white">
                Cover
              </span>
            )}
          </div>
        ))}

        {images.length < maxImages && (
          <label className="relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-4 text-center transition hover:border-emerald-500 hover:bg-emerald-50/20 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-emerald-600">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={isUploading}
              className="sr-only"
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-1.5">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                <span className="text-xs text-slate-500">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <UploadCloud className="h-7 w-7 text-slate-400 group-hover:text-emerald-600" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Add Photos
                </span>
                <span className="text-[10px] text-slate-400">PNG, JPG, WEBP</span>
              </div>
            )}
          </label>
        )}
      </div>

      {errorMessage && (
        <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
