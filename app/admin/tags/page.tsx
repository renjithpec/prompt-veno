import { createTag, deleteTag } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTags } from "@/lib/data";

export default async function AdminTagsPage() {
  const tags = await getTags();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <form action={createTag} className="glass grid gap-3 rounded-card p-5">
        <h2 className="text-xl font-bold">Add Tag</h2>
        <Input name="name" placeholder="Tag name" required />
        <SubmitButton loadingText="Saving...">Save Tag</SubmitButton>
      </form>
      <div className="glass rounded-card p-5">
        <h2 className="text-xl font-bold">Manage Tags</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <form key={tag.id} action={deleteTag} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2">
              <input type="hidden" name="id" value={tag.id} />
              <span className="text-sm text-zinc-200">{tag.name}</span>
              <button type="submit" className="text-xs text-red-200 hover:text-red-100">Delete</button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
