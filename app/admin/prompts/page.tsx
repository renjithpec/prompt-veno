import { createPrompt } from "@/app/actions/admin";
import { AdminPromptManager } from "@/components/admin-prompt-manager";
import { ImageUploadField } from "@/components/image-upload-field";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { getCategories, getPrompts } from "@/lib/data";

export default async function AdminPromptsPage() {
  const [prompts, categories] = await Promise.all([getPrompts({ status: 'all' }), getCategories()]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <form action={createPrompt} className="glass grid gap-3 rounded-card p-5">
        <h2 className="text-xl font-bold">Add Prompt</h2>
        <Input name="title" placeholder="Prompt title" required />
        <Input name="description" placeholder="Description" required />
        <ImageUploadField />
        <select name="category_id" className="tap rounded-card border border-white/10 bg-white/5 px-4 text-sm text-white" required>
          {categories.map((category) => <option key={category.id} value={category.id} className="bg-black">{category.name}</option>)}
        </select>
        <textarea name="prompt_content" placeholder="Prompt content" className="min-h-40 rounded-card border border-white/10 bg-white/5 p-4 text-sm text-white outline-none focus:border-accent/60" required />
        <label className="flex items-center gap-2 text-sm text-zinc-300"><input name="featured" type="checkbox" className="h-4 w-4 accent-lime-300" /> Featured</label>
        <SubmitButton loadingText="Saving...">Save Prompt</SubmitButton>
      </form>
      <div className="glass rounded-card p-5">
        <h2 className="text-xl font-bold">Manage Prompts</h2>
        <AdminPromptManager prompts={prompts} categories={categories} />
      </div>
    </div>
  );
}
