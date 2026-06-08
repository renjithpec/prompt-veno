import Link from "next/link";
import { ArrowRight, Copy, Eye, Search, Sparkles, Users } from "lucide-react";
import { AnimatedShell } from "@/components/animated-shell";
import { AnimatedLink } from "@/components/animated-link";
import { Button } from "@/components/ui/button";
import { PromptCard } from "@/components/prompt-card";
import { getCategories, getPrompts } from "@/lib/data";

export default async function HomePage() {
  const [featured, categories, trending] = await Promise.all([
    getPrompts({ featured: true, limit: 3 }),
    getCategories(),
    getPrompts({ sort: "trending", limit: 6 })
  ]);

  const copies = trending.reduce((total, prompt) => total + prompt.copies, 0);
  const views = trending.reduce((total, prompt) => total + prompt.views, 0);

  return (
    <>
      <section className="mesh relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(214,255,127,0.12),transparent_36%,rgba(255,255,255,0.04)_64%,transparent)] motion-safe:animate-pulse" />
        <div className="relative mx-auto grid min-h-[calc(100svh-64px)] max-w-7xl content-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
          <AnimatedShell className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.08] px-3 py-2 text-sm text-accent">
              <Sparkles className="h-4 w-4" />
              Built for creators arriving from Instagram Reels
            </div>
            <h1 className="text-balance text-5xl font-black leading-[0.94] tracking-normal sm:text-6xl lg:text-7xl">Create Viral AI Content Faster</h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-zinc-300">Discover premium AI prompts for Veo 3, ChatGPT, Flux, Midjourney, Kling, and Instagram creators.</p>
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <Button asChild size="lg"><AnimatedLink href="/prompts" loadingText="Loading prompts...">Browse Prompts <ArrowRight className="h-4 w-4" /></AnimatedLink></Button>
              <Button asChild size="lg" variant="secondary"><Link href="/category/veo3">Explore Categories</Link></Button>
              <Link 
                href="/contribute" 
                className="group relative inline-flex h-11 items-center justify-center overflow-hidden rounded-lg bg-accent/10 px-8 text-sm font-semibold text-accent ring-1 ring-accent/40 transition-all hover:bg-accent/20 hover:ring-accent hover:shadow-[0_0_20px_rgba(214,255,127,0.4)] hover:-translate-y-0.5 active:translate-y-0"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent/20 to-transparent group-hover:animate-shimmer" />
                <span className="relative flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Contribute Prompt
                </span>
              </Link>
            </div>
          </AnimatedShell>
          <AnimatedShell className="grid gap-3">
            {featured.map((prompt, index) => (
              <Link key={prompt.id} href={`/prompt/${prompt.slug}`} className="glass group grid grid-cols-[72px_1fr] gap-3 rounded-card p-3 transition hover:border-accent/40">
                <div className="grid h-[72px] place-items-center rounded-card bg-accent/10 text-xl font-black text-accent">0{index + 1}</div>
                <div className="min-w-0">
                  <p className="truncate font-semibold group-hover:text-accent">{prompt.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-zinc-400">{prompt.description}</p>
                </div>
              </Link>
            ))}
          </AnimatedShell>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 sm:grid-cols-3">
        {[
          { label: "Prompts Available", value: `${trending.length * 100}+`, icon: Search },
          { label: "Copies Made", value: copies.toLocaleString(), icon: Copy },
          { label: "Active Users", value: Math.max(4200, Math.round(views / 10)).toLocaleString(), icon: Users }
        ].map((stat) => (
          <AnimatedShell key={stat.label} className="glass rounded-card p-5">
            <stat.icon className="h-5 w-5 text-accent" />
            <div className="mt-4 text-3xl font-black">{stat.value}</div>
            <div className="mt-1 text-sm text-zinc-400">{stat.label}</div>
          </AnimatedShell>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Trending Prompts</h2>
            <p className="mt-2 text-zinc-400">Fast-copy prompts tuned for mobile creators.</p>
          </div>
          <Button asChild variant="secondary" className="hidden sm:inline-flex"><Link href="/prompts">View all</Link></Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trending.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h2 className="text-3xl font-bold">Categories</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`} className="glass rounded-card p-5 transition hover:border-accent/40 hover:shadow-glow">
              <div className="text-lg font-semibold">{category.name}</div>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3">
        {["The prompts feel expensive and save me hours every week.", "My Reels workflow is finally fast enough to post daily.", "The Instagram follow block turns prompt traffic into real audience growth."].map((quote, index) => (
          <AnimatedShell key={quote} className="glass rounded-card p-5">
            <p className="text-sm leading-6 text-zinc-300">
              &quot;{quote}&quot;
            </p>
            <p className="mt-4 text-sm font-semibold text-accent">Creator {index + 1}</p>
          </AnimatedShell>
        ))}
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h2 className="text-3xl font-bold">FAQ</h2>
        <div className="mt-6 grid gap-3">
          {[
            ["Can I copy long prompts on mobile?", "Yes. Every copy button uses the Clipboard API and copies the complete prompt content."],
            ["Does Prompt Veno support SEO pages?", "Yes. Prompt, category, sitemap, OpenGraph, Twitter, canonical, and structured data metadata are included."],
            ["Can the creator Instagram profile be updated?", "Yes. Admin settings power the creator block across all prompt pages."]
          ].map(([question, answer]) => (
            <div key={question} className="glass rounded-card p-5">
              <h3 className="font-semibold">{question}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6">
        <div className="glass mx-auto max-w-5xl rounded-card p-6 text-center sm:p-10">
          <h2 className="text-3xl font-black sm:text-4xl">Start with the prompts creators copy most.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-zinc-400">Open the marketplace, search your niche, and copy a premium prompt in seconds.</p>
          <Button asChild size="lg" className="mt-6"><AnimatedLink href="/prompts" loadingText="Loading prompts...">Browse Prompts</AnimatedLink></Button>
        </div>
      </section>
    </>
  );
}
