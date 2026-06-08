import { notFound, redirect } from "next/navigation";
import { ContributeForm } from "@/app/contribute/contribute-form";
import { getCategories, getPromptById } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Edit Prompt",
};

export default async function EditPromptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prompt = await getPromptById(id);

  if (!prompt) notFound();

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== prompt.user_id) redirect("/login");

  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Edit Prompt</h1>
        <p className="mt-4 text-lg text-zinc-400">Update your prompt's details below.</p>
        <p className="mt-2 text-sm text-yellow-500 bg-yellow-500/10 inline-block px-3 py-1 rounded-full border border-yellow-500/20">
          Note: Editing will return your prompt to "Pending" status for review.
        </p>
      </div>

      <ContributeForm categories={categories} initialData={prompt} />
    </div>
  );
}
