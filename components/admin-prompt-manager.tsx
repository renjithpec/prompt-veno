"use client";

import { useState } from "react";
import { deletePrompt, updatePrompt } from "@/app/actions/admin";
import { ImageUploadField } from "@/components/image-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category, Prompt } from "@/lib/types";

export function AdminPromptManager({ prompts, categories }: { prompts: Prompt[]; categories: Category[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="mt-4 grid gap-3">
      {prompts.map((prompt) => {
        const isOpen = openId === prompt.id;

        return (
          <div key={prompt.id} className={`rounded-card border p-3 ${isOpen ? "border-accent/35" : "border-white/10"}`}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : prompt.id)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 text-left"
              aria-expanded={isOpen}
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{prompt.title}</p>
                <p className="text-sm text-zinc-400">{prompt.views.toLocaleString()} views | {prompt.copies.toLocaleString()} copies</p>
              </div>
              <span className="shrink-0 rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-accent">{isOpen ? "Close" : "Edit"}</span>
            </button>

            {isOpen && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <form action={updatePrompt} className="grid gap-3">
                  <input type="hidden" name="id" value={prompt.id} />
                  <input type="hidden" name="current_slug" value={prompt.slug} />
                  <Input name="title" defaultValue={prompt.title} placeholder="Prompt title" required />
                  <Input name="description" defaultValue={prompt.description} placeholder="Description" required />
                  <ImageUploadField defaultValue={prompt.preview_image} />
                  <select name="category_id" defaultValue={prompt.category_id} className="tap rounded-card border border-white/10 bg-white/5 px-4 text-sm text-white" required>
                    {categories.map((category) => <option key={category.id} value={category.id} className="bg-black">{category.name}</option>)}
                  </select>
                  <textarea name="prompt_content" defaultValue={prompt.prompt_content} placeholder="Prompt content" className="min-h-40 rounded-card border border-white/10 bg-white/5 p-4 text-sm text-white outline-none focus:border-accent/60" required />
                  <label className="flex items-center gap-2 text-sm text-zinc-300"><input name="featured" type="checkbox" defaultChecked={prompt.featured} className="h-4 w-4 accent-lime-300" /> Featured</label>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <Button type="submit">Save Changes</Button>
                    <Button asChild variant="secondary">
                      <a href={`/prompt/${prompt.slug}`} target="_blank" rel="noreferrer">View Prompt</a>
                    </Button>
                  </div>
                </form>

                <form action={deletePrompt} className="mt-3">
                  <input type="hidden" name="id" value={prompt.id} />
                  <Button type="submit" variant="danger" size="sm">Delete Prompt</Button>
                </form>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
