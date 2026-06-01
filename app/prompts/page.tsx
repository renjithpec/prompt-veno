import type { Metadata } from "next";
import { MarketplaceClient } from "@/components/marketplace-client";
import { getCategories, getPrompts, getTags } from "@/lib/data";

export const metadata: Metadata = {
  title: "Prompt Marketplace",
  description: "Search premium AI prompts by category, tag, trend, views, and copies."
};

export default async function PromptsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const [prompts, categories, tags] = await Promise.all([getPrompts(), getCategories(), getTags()]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black sm:text-5xl">Prompt Marketplace</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">Live search, category filters, tag filters, sorting, and mobile-first prompt cards built for fast copying.</p>
      </div>
      <MarketplaceClient
        prompts={prompts}
        categories={categories}
        tags={tags}
        initialQuery={params.q || ""}
        initialCategory={params.category || "all"}
        initialTag={params.tag || "all"}
        initialSort={params.sort || "trending"}
      />
    </section>
  );
}
