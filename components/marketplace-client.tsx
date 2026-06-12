"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { Category, Prompt, Tag } from "@/lib/types";
import { PromptCard } from "@/components/prompt-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogoSpinner } from "@/components/logo-spinner";

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
  const router = useRouter();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return prompts
      .filter((prompt) => !needle || [prompt.title, prompt.description, prompt.prompt_content, ...(prompt.categories?.map(c => c.name) || []), ...prompt.tags.map((item) => item.name)].join(" ").toLowerCase().includes(needle))
      .filter((prompt) => category === "all" || prompt.categories?.some(c => c.slug === category) || prompt.category?.slug === category)
      .filter((prompt) => tag === "all" || prompt.tags.some((item) => item.slug === tag))
      .sort((a, b) => {
        if (sort === "newest") return +new Date(b.created_at) - +new Date(a.created_at);
        if (sort === "most-viewed") return b.views - a.views;
        if (sort === "most-copied") return b.copies - a.copies;
        return b.views + b.copies * 2 - (a.views + a.copies * 2);
      });
  }, [category, prompts, query, sort, tag]);

  const [isPending, startTransition] = React.useTransition();

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    startTransition(() => {
      if (val === "all") router.push("/prompts");
      else router.push(`/category/${val}`);
    });
  };

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const suggestions = query ? filtered.slice(0, 4) : [];

  return (
    <>
      {isPending && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-all">
          <LogoSpinner className="h-24 w-24" />
          <p className="mt-6 text-sm font-medium tracking-wide text-foreground animate-pulse">
            Loading...
          </p>
        </div>
      )}
      <div className="grid gap-6">
        <div className="sticky top-[64px] z-40 bg-background/80 backdrop-blur-xl border-y border-border py-4 -mx-4 px-4 sm:mx-0 sm:px-4 sm:rounded-card sm:border sm:bg-foreground/[0.02]">
          <div className="flex flex-col gap-3">
            {/* Search Input and Mobile Filter Toggle */}
            <div className="flex gap-2 w-full">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search viral prompts" className="pl-10" />
              </label>
              <Button 
                variant="secondary" 
                size="icon" 
                className="md:hidden shrink-0" 
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                aria-label="Toggle filters"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              </Button>
            </div>

            {/* Filters Row (Hidden on mobile unless expanded) */}
            <div className={`grid gap-3 md:grid-cols-3 ${isFiltersExpanded ? 'grid' : 'hidden md:grid'}`}>
              <Select value={category} onValueChange={handleCategoryChange}>
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
          </div>
        {suggestions.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {suggestions.map((prompt) => (
              <button key={prompt.id} onClick={() => setQuery(prompt.title)} className="tap shrink-0 rounded-full border border-border px-3 text-xs text-muted-foreground hover:border-accent/50 hover:text-accent">
                {prompt.title}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filtered.length} prompts found</span>
        <span>No horizontal scroll</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} />)}
      </div>
      </div>
    </>
  );
}
