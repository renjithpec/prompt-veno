"use client";

import type React from "react";
import { useState } from "react";
import { ImageUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function createUploadId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function ImageUploadField({
  defaultValue = "",
  name = "preview_image",
  placeholder = "Preview image URL",
  label = "Upload Preview Image"
}: {
  defaultValue?: string;
  name?: string;
  placeholder?: string;
  label?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [status, setStatus] = useState("");

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setStatus("Add Supabase environment variables to upload images.");
      return;
    }
    setStatus("Uploading image...");
    const extension = file.name.split(".").pop() || "jpg";
    const path = `${createUploadId()}.${extension}`;
    const { error } = await supabase.storage.from("prompt-images").upload(path, file, {
      cacheControl: "31536000",
      upsert: false
    });
    if (error) {
      setStatus(error.message);
      return;
    }
    const { data } = supabase.storage.from("prompt-images").getPublicUrl(path);
    setUrl(data.publicUrl);
    setStatus("Image uploaded.");
  }

  return (
    <div className="grid gap-2">
      <Input name={name} value={url} onChange={(event) => setUrl(event.target.value)} placeholder={placeholder} required />
      <label className="tap flex cursor-pointer items-center justify-center gap-2 rounded-card border border-dashed border-white/15 bg-white/5 px-4 text-sm text-zinc-300 hover:border-accent/50 hover:text-accent">
        <ImageUp className="h-4 w-4" />
        {label}
        <input type="file" accept="image/*" className="sr-only" onChange={onFileChange} />
      </label>
      {status && <p className="text-xs text-zinc-400">{status}</p>}
    </div>
  );
}
