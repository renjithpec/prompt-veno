import { createCategory, deleteCategory } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCategories } from "@/lib/data";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <form action={createCategory} className="glass grid gap-3 rounded-card p-5">
        <h2 className="text-xl font-bold">Add Category</h2>
        <Input name="name" placeholder="Category name" required />
        <Input name="icon" placeholder="Lucide icon name" defaultValue="Sparkles" required />
        <textarea name="description" placeholder="Description" className="min-h-28 rounded-card border border-white/10 bg-white/5 p-4 text-sm text-white outline-none focus:border-accent/60" required />
        <SubmitButton loadingText="Saving...">Save Category</SubmitButton>
      </form>
      <div className="glass rounded-card p-5">
        <h2 className="text-xl font-bold">Manage Categories</h2>
        <div className="mt-4 grid gap-3">
          {categories.map((category) => (
            <div key={category.id} className="grid gap-3 rounded-card border border-white/10 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="min-w-0">
                <p className="truncate font-semibold">{category.name}</p>
                <p className="line-clamp-2 text-sm text-zinc-400">{category.description}</p>
              </div>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={category.id} />
                <Button type="submit" variant="danger" size="sm">Delete</Button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
