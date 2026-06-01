"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Category, Prompt, Tag } from "@/lib/types";
import { PromptCard } from "@/components/prompt-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function MarketplaceClient({ prompts, categories, tags, initialQuery = "", initialCategory = "all", initialTag = "all", initialSort = "trending" }: {
  prompts: Prompt[];
  categories: Category[];
  tags: Tag[];
  initialQuery?: string;
  initialCategory?: string;
  initialTag?: string;
  initialSort?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [tag, setTag] = useState(initialTag);
  const [sort, setSort] = useState(initialSort);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return prompts
      .filter((prompt) => !needle || [prompt.title, prompt.description, prompt.prompt_content, prompt.category?.name, ...prompt.tags.map((item) => item.name)].join(" ").toLowerCase().includes(needle))
      .filter((prompt) => category === "all" || prompt.category?.slug === category)
      .filter((prompt) => tag === "all" || prompt.tags.some((item) => item.slug === tag))
      .sort((a, b) => {
        if (sort === "newest") return +new Date(b.created_at) - +new Date(a.created_at);
        if (sort === "most-viewed") return b.views - a.views;
        if (sort === "most-copied") return b.copies - a.copies;
        return b.views + b.copies * 2 - (a.views + a.copies * 2);
      });
  }, [category, prompts, query, sort, tag]);

  const suggestions = query ? filtered.slice(0, 4) : [];

  return (
    <div className="grid gap-6">
      <div className="glass rounded-card p-3 sm:p-4">
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search viral prompts" className="pl-10" />
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((item) => <SelectItem key={item.id} value={item.slug}>{item.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={tag} onValueChange={setTag}>
            <SelectTrigger><SelectValue placeholder="Tag" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {tags.map((item) => <SelectItem key={item.id} value={item.slug}>{item.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="most-viewed">Most Viewed</SelectItem>
              <SelectItem value="most-copied">Most Copied</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {suggestions.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {suggestions.map((prompt) => (
              <button key={prompt.id} onClick={() => setQuery(prompt.title)} className="tap shrink-0 rounded-full border border-white/10 px-3 text-xs text-zinc-300 hover:border-accent/50 hover:text-accent">
                {prompt.title}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>{filtered.length} prompts found</span>
        <span>No horizontal scroll</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} />)}
      </div>
    </div>
  );
}
