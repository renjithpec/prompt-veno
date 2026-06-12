"use client";

import type React from "react";
import { useState, useRef } from "react";
import { ImageUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ImageCropper } from "@/components/image-cropper";

function createUploadId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function ImageUploadField({
  defaultValue = "",
  name = "preview_image",
  placeholder = "Preview image URL",
  label = "Upload Preview Image",
  bucket = "prompt-images",
  cropAspectRatio
}: {
  defaultValue?: string;
  name?: string;
  placeholder?: string;
  label?: string;
  bucket?: string;
  cropAspectRatio?: number;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [status, setStatus] = useState("");
  
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [originalFileExtension, setOriginalFileExtension] = useState("jpg");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadBlob(blob: Blob, extension: string) {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setStatus("Add Supabase environment variables to upload images.");
      return;
    }
    setStatus("Uploading image...");
    const path = `${createUploadId()}.${extension}`;
    const { error } = await supabase.storage.from(bucket).upload(path, blob, {
      cacheControl: "31536000",
      upsert: false
    });
    if (error) {
      setStatus(error.message);
      return;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    setUrl(data.publicUrl);
    setStatus("Image uploaded.");
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop() || "jpg";
    
    if (cropAspectRatio) {
      // Open cropper instead of uploading immediately
      setOriginalFileExtension(extension);
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Upload directly without cropping
      uploadBlob(file, extension);
    }
    
    // Reset file input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropImageSrc(null);
    await uploadBlob(croppedBlob, originalFileExtension === "png" ? "png" : "jpg");
  };

  return (
    <div className="grid gap-2 w-full">
      <Input name={name} value={url} onChange={(event) => setUrl(event.target.value)} placeholder={placeholder} required />
      <label className="tap flex cursor-pointer items-center justify-center gap-2 rounded-card border border-dashed border-white/15 bg-white/5 px-4 text-sm text-zinc-300 hover:border-accent/50 hover:text-accent">
        <ImageUp className="h-4 w-4" />
        {label}
        <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={onFileChange} />
      </label>
      {status && <p className="text-xs text-zinc-400">{status}</p>}

      {cropImageSrc && cropAspectRatio && (
        <ImageCropper
          imageSrc={cropImageSrc}
          isOpen={!!cropImageSrc}
          onClose={() => setCropImageSrc(null)}
          onCropComplete={handleCropComplete}
          aspectRatio={cropAspectRatio}
        />
      )}
    </div>
  );
}
