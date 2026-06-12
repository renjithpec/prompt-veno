"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import type { Prompt } from "@/lib/types";
import { Button } from "@/components/ui/button";

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function CopyPromptButton({ prompt, compact = false }: { prompt: Prompt; compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await copyText(prompt.prompt_content);
    setCopied(true);
    fetch(`/api/prompts/${prompt.slug}/copy`, { method: "POST" }).catch(() => undefined);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="relative">
      <Button type="button" onClick={onCopy} className="w-full" size={compact ? "md" : "lg"}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy Prompt"}
      </Button>
      <AnimatePresence>
        {copied && (
          <motion.div
            className="pointer-events-none absolute -top-12 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-panel px-3 py-2 text-xs font-semibold text-foreground shadow-glow"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
          >
            Copied Successfully
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
