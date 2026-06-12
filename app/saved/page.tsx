import type { Metadata } from "next";
import { getPrompts } from "@/lib/data";
import { PromptCard } from "@/components/prompt-card";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Saved Prompts",
  description: "Your personally saved prompts collection.",
};

export default async function SavedPromptsPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const savedPrompts = await getPrompts({ savedOnly: true, sort: "newest" });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-10 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Bookmark className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
            Saved Prompts
          </h1>
          <p className="mt-2 text-muted-foreground">Your personal collection of bookmarked prompts.</p>
        </div>
      </header>

      {savedPrompts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {savedPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-card border-2 border-dashed border-border bg-panel2/50 py-24 text-center">
          <Bookmark className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-bold text-foreground">No saved prompts yet</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            When you find a prompt you like, click the bookmark icon to save it here for quick access later.
          </p>
          <Link href="/prompts" className="mt-6 rounded-full bg-foreground px-6 py-3 font-display text-sm font-bold uppercase text-background transition hover:bg-foreground/90">
            Explore Prompts
          </Link>
        </div>
      )}
    </div>
  );
}
