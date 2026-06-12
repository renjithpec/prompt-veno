import Image from "next/image";
import Link from "next/link";
import { Copy, Eye, ExternalLink, BadgeCheck } from "lucide-react";
import type { Prompt } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CopyPromptButton } from "@/components/copy-prompt-button";
import { LikeButton } from "@/components/like-button";
import { DislikeButton } from "@/components/dislike-button";
import { ShareButton } from "@/components/share-button";
import { SaveButton } from "@/components/save-button";

export function PromptCard({ prompt }: { prompt: Prompt }) {
  return (
    <article className="group relative overflow-hidden rounded-card border-2 border-border bg-panel2 p-2 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_0_30px_rgba(214,255,127,0.3)]">
      <Link href={`/prompt/${prompt.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
          <Image src={prompt.preview_image} alt={prompt.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 pr-3">
            {(prompt.categories?.length ? prompt.categories : prompt.category ? [prompt.category] : []).slice(0, 3).map((cat) => (
              <div key={cat.id} className="rounded-full border border-border bg-black/55 px-3 py-1 text-[10px] sm:text-xs text-accent backdrop-blur">{cat.name}</div>
            ))}
          </div>
        </div>
      </Link>
      <div className="grid gap-4 p-4">
        <div>
          {prompt.profiles && (
            <Link href={`/user/${prompt.user_id}`} className="mb-3 flex items-center gap-2 group/author">
              <div className="relative h-6 w-6 overflow-hidden rounded-full bg-foreground/10 ring-1 ring-border group-hover/author:ring-accent">
                {prompt.profiles.avatar ? (
                  <Image src={prompt.profiles.avatar} alt={prompt.profiles.name || "User"} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-accent text-[10px] font-bold text-black">
                    {(prompt.profiles.name || "U")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover/author:text-foreground">
                {prompt.profiles.name || "Anonymous"}
                {(prompt.profiles.is_verified) && <BadgeCheck className="h-3.5 w-3.5 text-blue-400" />}
              </div>
            </Link>
          )}
          <Link href={`/prompt/${prompt.slug}`} className="line-clamp-2 font-display text-2xl font-black leading-tight text-foreground transition-colors group-hover:text-accent">{prompt.title}</Link>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{prompt.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {prompt.tags.slice(0, 4).map((tag) => (
            <Link key={tag.id} href={`/prompts?tag=${tag.slug}`} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-accent/50 hover:text-accent">{tag.name}</Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{prompt.views.toLocaleString()}</span>
            <span className="inline-flex items-center gap-1"><Copy className="h-3.5 w-3.5" />{prompt.copies.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-3">
            <LikeButton 
              promptId={prompt.id} 
              initialLikes={prompt.likes_count || 0} 
              initialIsLiked={!!prompt.is_liked} 
            />
            <DislikeButton 
              promptId={prompt.id} 
              initialDislikes={prompt.dislikes_count || 0} 
              initialIsDisliked={!!prompt.is_disliked} 
            />
          </div>
          <div className="flex items-center gap-3">
            <ShareButton 
              promptId={prompt.id} 
              promptSlug={prompt.slug}
              initialShares={prompt.shares_count || 0} 
            />
            <SaveButton 
              promptId={prompt.id} 
              initialSaves={prompt.saves_count || 0} 
              initialIsSaved={!!prompt.is_saved} 
            />
          </div>
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
