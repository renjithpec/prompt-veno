import Image from "next/image";
import Link from "next/link";
import { Copy, Eye, ExternalLink } from "lucide-react";
import type { Prompt } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CopyPromptButton } from "@/components/copy-prompt-button";

export function PromptCard({ prompt }: { prompt: Prompt }) {
  return (
    <article className="group glass overflow-hidden rounded-card transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow">
      <Link href={`/prompt/${prompt.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image src={prompt.preview_image} alt={prompt.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/55 px-3 py-1 text-xs text-accent backdrop-blur">{prompt.category?.name}</div>
        </div>
      </Link>
      <div className="grid gap-4 p-4">
        <div>
          <Link href={`/prompt/${prompt.slug}`} className="line-clamp-2 text-lg font-semibold text-white hover:text-accent">{prompt.title}</Link>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">{prompt.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {prompt.tags.slice(0, 4).map((tag) => (
            <Link key={tag.id} href={`/prompts?tag=${tag.slug}`} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-300 hover:border-accent/50 hover:text-accent">{tag.name}</Link>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{prompt.views.toLocaleString()}</span>
          <span className="inline-flex items-center gap-1"><Copy className="h-3.5 w-3.5" />{prompt.copies.toLocaleString()}</span>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <CopyPromptButton prompt={prompt} compact />
          <Button asChild variant="secondary" size="icon" aria-label={`Open ${prompt.title}`}>
            <Link href={`/prompt/${prompt.slug}`}><ExternalLink className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
