import Link from "next/link";
import { getCategories } from "@/lib/data";

export const revalidate = 3600;

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-widest text-foreground">
            All Categories
          </h1>
          <p className="text-muted-foreground mt-4 font-medium max-w-2xl mx-auto">
            Browse our entire collection of prompt categories to find exactly what you&apos;re looking for.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`} 
              className="group relative overflow-hidden rounded-card border-2 border-border bg-panel2 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_0_30px_rgba(214,255,127,0.2)]"
            >
              <div className="font-display text-2xl font-black uppercase text-foreground group-hover:text-accent">
                {category.name}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
