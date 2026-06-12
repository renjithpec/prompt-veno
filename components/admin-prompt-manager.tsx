"use client";

import { useState } from "react";
import { deletePrompt, updatePrompt, moderatePrompt } from "@/app/actions/admin";
import { ImageUploadField } from "@/components/image-upload-field";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category, Prompt } from "@/lib/types";

export function AdminPromptManager({ prompts, categories }: { prompts: Prompt[]; categories: Category[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  const handleOpen = (prompt: Prompt) => {
    if (openId === prompt.id) {
      setOpenId(null);
    } else {
      setOpenId(prompt.id);
      setSelectedCats(prompt.categories?.map(c => c.id) || (prompt.category_id ? [prompt.category_id] : []));
    }
  };

  const toggleCat = (id: string) => {
    setSelectedCats(prev => {
      if (prev.includes(id)) return prev.filter(c => c !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="mt-4 grid gap-3">
      {prompts.map((prompt) => {
        const isOpen = openId === prompt.id;

        return (
          <div key={prompt.id} className={`rounded-card border p-3 ${isOpen ? "border-accent/35" : "border-white/10"}`}>
            <button
              type="button"
              onClick={() => handleOpen(prompt)}
              className="flex flex-col sm:flex-row w-full cursor-pointer items-start sm:items-center justify-between gap-3 text-left"
              aria-expanded={isOpen}
            >
              <div className="min-w-0 w-full sm:w-auto flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold">{prompt.title}</p>
                  {prompt.status === 'pending' && <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-500">Pending</span>}
                  {prompt.status === 'rejected' && <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-500">Rejected</span>}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-sm text-zinc-400 mt-1">
                  <span>{prompt.views.toLocaleString()} views</span>
                  <span className="hidden sm:inline">|</span>
                  <span>{prompt.copies.toLocaleString()} copies</span>
                  {prompt.profiles && (
                    <>
                      <span className="hidden sm:inline">|</span>
                      <span className="flex items-center gap-1 text-accent w-full sm:w-auto">
                        By {prompt.profiles.name || "Anonymous"}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 sm:py-2 text-xs font-semibold text-accent">{isOpen ? "Close" : "Edit"}</span>
            </button>

            {isOpen && (
              <div className="mt-4 border-t border-white/10 pt-4">
                {prompt.status === 'pending' && (
                  <div className="mb-4 flex gap-2 rounded-card bg-yellow-500/10 p-3">
                    <form action={moderatePrompt}>
                      <input type="hidden" name="id" value={prompt.id} />
                      <input type="hidden" name="status" value="approved" />
                      <SubmitButton className="h-8 text-xs bg-green-500 text-white hover:bg-green-600">Approve</SubmitButton>
                    </form>
                    <form action={moderatePrompt}>
                      <input type="hidden" name="id" value={prompt.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <SubmitButton className="h-8 text-xs bg-red-500 text-white hover:bg-red-600">Reject</SubmitButton>
                    </form>
                  </div>
                )}
                
                <form action={updatePrompt} className="grid gap-3">
                  <input type="hidden" name="id" value={prompt.id} />
                  <input type="hidden" name="current_slug" value={prompt.slug} />
                  <Input name="title" defaultValue={prompt.title} placeholder="Prompt title" required />
                  <Input name="description" defaultValue={prompt.description} placeholder="Description" required />
                  <ImageUploadField defaultValue={prompt.preview_image} />
                  <div className="grid gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex justify-between">
                        <span>Categories</span>
                        <span>{selectedCats.length}/3</span>
                      </label>
                      <input type="hidden" name="category_ids" value={selectedCats.join(",")} />
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => {
                          const isSelected = selectedCats.includes(category.id);
                          return (
                            <button
                              type="button"
                              key={category.id}
                              onClick={() => toggleCat(category.id)}
                              className={`rounded border px-3 py-1 text-xs transition-all ${
                                isSelected ? "border-accent bg-accent/20 text-accent" : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                              }`}
                            >
                              {category.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <select name="status" defaultValue={prompt.status || 'approved'} className="tap rounded-card border border-white/10 bg-white/5 px-4 h-10 text-sm text-white" required>
                      <option value="pending" className="bg-black">Pending</option>
                      <option value="approved" className="bg-black">Approved</option>
                      <option value="rejected" className="bg-black">Rejected</option>
                    </select>
                  </div>
                  <textarea name="prompt_content" defaultValue={prompt.prompt_content} placeholder="Prompt content" className="min-h-40 rounded-card border border-white/10 bg-white/5 p-4 text-sm text-white outline-none focus:border-accent/60" required />
                  <label className="flex items-center gap-2 text-sm text-zinc-300"><input name="featured" type="checkbox" defaultChecked={prompt.featured} className="h-4 w-4 accent-lime-300" /> Featured</label>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <SubmitButton loadingText="Saving...">Save Changes</SubmitButton>
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
