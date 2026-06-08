import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/data";
import { submitPrompt } from "@/app/actions/user";
import { ContributeForm } from "./contribute-form";

export const metadata = {
  title: "Contribute Prompt",
  description: "Submit a new prompt to the community."
};

export default async function ContributePage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">Contribute a Prompt</h1>
        <p className="mt-2 text-zinc-400">Share your best AI prompts with the community. All submissions are reviewed by our team before going live.</p>
      </div>

      <ContributeForm categories={categories} />
    </div>
  );
}
