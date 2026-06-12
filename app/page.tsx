import Link from "next/link";
import { ArrowRight, Copy, Eye, Search, Sparkles, Users } from "lucide-react";
import { AnimatedShell } from "@/components/animated-shell";
import { AnimatedLink } from "@/components/animated-link";
import { Button } from "@/components/ui/button";
import { PromptCard } from "@/components/prompt-card";
import { getCategories, getPrompts, getPublicStats } from "@/lib/data";

export default async function HomePage() {
  const [featured, categories, trending, publicStats] = await Promise.all([
    getPrompts({ featured: true, limit: 3 }),
    getCategories(),
    getPrompts({ sort: "trending", limit: 6 }),
    getPublicStats()
  ]);

  return (
    <>
      <section className="relative overflow-hidden pt-6 lg:pt-12 pb-16">
        <div className="absolute right-[10%] top-[10%] hidden md:block opacity-80 rotate-12">
          <svg width="120" height="120" viewBox="0 0 100 100" className="drawn-stroke text-accent">
            <path d="M 30,40 Q 35,30 40,40" />
            <path d="M 60,40 Q 65,30 70,40" />
            <path d="M 20,60 Q 50,90 80,50" />
          </svg>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
          
          <Link href="/contribute" className="mb-6 group relative inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-black uppercase tracking-wider text-black transition-transform hover:scale-105 hover:shadow-[0_0_30px_rgba(214,255,127,0.5)]">
            Contribute Prompt
            <ArrowRight className="h-4 w-4 rotate-45" />
          </Link>

          <AnimatedShell className="relative max-w-5xl">
            <div className="absolute -top-4 -left-16 hidden md:block rotate-[-15deg]">
              <svg width="80" height="80" viewBox="0 0 100 100" className="drawn-stroke text-accent">
                <path d="M 10,90 Q 50,50 90,20" />
                <path d="M 70,15 L 90,20 L 95,40" />
              </svg>
            </div>

            <h1 className="font-display text-balance text-6xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl">
              CREATE VIRAL<br />
              <span className="relative inline-block text-accent">
                AI CONTENT
                <svg className="absolute -bottom-4 left-0 w-full drawn-stroke" viewBox="0 0 200 20" preserveAspectRatio="none">
                  <path d="M 0,10 Q 50,20 100,5 T 200,10" />
                </svg>
              </span><br />
              FASTER
            </h1>
            
            <div className="mt-10 flex justify-center">
              <div className="pill-badge">
                UNLEASH YOUR CREATIVE POTENTIAL
              </div>
            </div>

            <p className="mx-auto mt-8 max-w-2xl text-pretty text-lg font-medium text-muted-foreground">
              Discover premium AI prompts for Veo 3, ChatGPT, Flux, Midjourney, Kling, and Instagram creators.
            </p>

            <div className="mt-10 flex justify-center gap-4">
              <Button asChild size="lg" className="rounded-full font-bold h-14 px-8 text-lg"><AnimatedLink href="/prompts">Browse Prompts <ArrowRight className="ml-2 h-5 w-5" /></AnimatedLink></Button>
            </div>
          </AnimatedShell>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <div className="neon-container p-4 sm:p-8 lg:p-12">
          
          <div className="mb-12 text-center">
            <h2 className="font-display text-4xl font-black uppercase tracking-tight text-accent">Trending Prompts</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} />)}
          </div>

          <div className="mt-16 mb-8 flex items-end justify-between gap-4 border-t border-border pt-16">
            <div>
              <h2 className="font-display text-3xl font-black uppercase">Categories</h2>
            </div>
            <Button asChild variant="secondary" className="hidden sm:inline-flex rounded-full"><Link href="/categories">View all</Link></Button>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`} className="group relative overflow-hidden rounded-card border-2 border-border bg-panel2 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_0_30px_rgba(214,255,127,0.2)]">
                <div className="font-display text-2xl font-black uppercase text-foreground group-hover:text-accent">{category.name}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{category.description}</p>
              </Link>
            ))}
          </div>

        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 sm:grid-cols-3">
        {[
          { label: "Prompts Available", value: publicStats.promptCount.toLocaleString(), icon: Search },
          { label: "Copies Made", value: publicStats.copies.toLocaleString(), icon: Copy },
          { label: "Total Views", value: publicStats.views.toLocaleString(), icon: Eye }
        ].map((stat) => (
          <AnimatedShell key={stat.label} className="glass rounded-card p-6 flex flex-col items-center text-center">
            <stat.icon className="h-8 w-8 text-accent mb-4" />
            <div className="font-display text-4xl font-black">{stat.value}</div>
            <div className="mt-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</div>
          </AnimatedShell>
        ))}
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-[32px] bg-accent p-8 text-center text-black sm:p-16">
          <h2 className="font-display text-4xl font-black uppercase sm:text-6xl">Start creating now.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-black/70">Open the marketplace, search your niche, and copy a premium prompt in seconds.</p>
          <Button asChild size="lg" className="mt-8 rounded-full bg-black text-white hover:bg-black/80 h-14 px-8 text-lg"><AnimatedLink href="/prompts" loadingText="Loading prompts...">Browse Prompts</AnimatedLink></Button>
        </div>
      </section>
    </>
  );
}
