import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketplaceClient } from "@/components/marketplace-client";
import { getCategories, getCategoryBySlug, getPrompts, getTags } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category" };
  return {
    title: `${category.name} Prompts`,
    description: category.description,
    alternates: { canonical: `/category/${category.slug}` }
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const [prompts, categories, tags] = await Promise.all([getPrompts({ category: slug }), getCategories(), getTags()]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold text-accent">Category</p>
        <h1 className="mt-2 text-4xl font-black sm:text-5xl">{category.name} Prompts</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">{category.description}</p>
      </div>
      <MarketplaceClient prompts={prompts} categories={categories} tags={tags} initialCategory={slug} />
    </section>
  );
}
