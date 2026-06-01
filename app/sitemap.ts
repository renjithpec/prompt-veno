import type { MetadataRoute } from "next";
import { getCategories, getPrompts } from "@/lib/data";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [prompts, categories] = await Promise.all([getPrompts(), getCategories()]);
  return [
    { url: absoluteUrl("/"), lastModified: new Date() },
    { url: absoluteUrl("/prompts"), lastModified: new Date() },
    ...prompts.map((prompt) => ({ url: absoluteUrl(`/prompt/${prompt.slug}`), lastModified: new Date(prompt.updated_at) })),
    ...categories.map((category) => ({ url: absoluteUrl(`/category/${category.slug}`), lastModified: new Date(category.created_at) }))
  ];
}
