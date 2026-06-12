import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Copy, Eye, Instagram, BadgeCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { CopyPromptButton } from "@/components/copy-prompt-button";
import { PromptCard } from "@/components/prompt-card";
import { LikeButton } from "@/components/like-button";
import { DislikeButton } from "@/components/dislike-button";
import { ShareButton } from "@/components/share-button";
import { SaveButton } from "@/components/save-button";
import { Button } from "@/components/ui/button";
import { getPromptBySlug, getPrompts, getSettings, trackPromptEvent, checkIsFollowing } from "@/lib/data";
import { absoluteUrl } from "@/lib/utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FollowButton } from "@/app/user/[id]/follow-button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const prompt = await getPromptBySlug(slug);
  if (!prompt) return { title: "Prompt" };
  return {
    title: prompt.title,
    description: prompt.description,
    alternates: { canonical: `/prompt/${prompt.slug}` },
    openGraph: {
      title: prompt.title,
      description: prompt.description,
      url: absoluteUrl(`/prompt/${prompt.slug}`),
      images: [{ url: prompt.preview_image }],
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title: prompt.title,
      description: prompt.description,
      images: [prompt.preview_image]
    }
  };
}

export default async function PromptDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [prompt, settings] = await Promise.all([getPromptBySlug(slug), getSettings()]);
  if (!prompt) notFound();
  await trackPromptEvent(prompt.slug, "view");
  const related = (await getPrompts({ category: prompt.category?.slug, limit: 3 })).filter((item) => item.id !== prompt.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: prompt.title,
    description: prompt.description,
    image: prompt.preview_image,
    url: absoluteUrl(`/prompt/${prompt.slug}`),
    datePublished: prompt.created_at,
    author: { "@type": "Person", name: settings.creator_name, sameAs: settings.instagram_url }
  };

  let isFollowing = false;
  let isSelf = false;
  
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && prompt.user_id) {
      if (user.id === prompt.user_id) isSelf = true;
      else isFollowing = await checkIsFollowing(user.id, prompt.user_id);
    }
  }

  const authorName = prompt.profiles?.name || settings.creator_name;
  const authorAvatar = prompt.profiles?.avatar || "/logo-icon.svg";
  const authorUsername = prompt.profiles?.name ? `@${prompt.profiles.name.toLowerCase().replace(/[^a-z0-9]/g, "")}` : settings.instagram_username;
  const authorInstagram = prompt.profiles?.instagram_url || settings.instagram_url;

  return (
    <article className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="grid gap-8 lg:grid-cols-[1fr_390px]">
        <div className="min-w-0">
          <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-border sm:aspect-[16/9]">
            <Image src={prompt.preview_image} alt={prompt.title} fill priority sizes="(max-width: 1024px) 100vw, 760px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/75 via-transparent to-transparent" />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={`/category/${prompt.category?.slug}`} className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">{prompt.category?.name}</Link>
            {prompt.tags.map((tag) => <Link key={tag.id} href={`/prompts?tag=${tag.slug}`} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-accent hover:border-accent">{tag.name}</Link>)}
          </div>
          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">{prompt.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-foreground">{prompt.description}</p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground items-center">
            <span className="inline-flex items-center gap-2"><Eye className="h-4 w-4 text-accent" />{prompt.views.toLocaleString()} views</span>
            <span className="inline-flex items-center gap-2"><Copy className="h-4 w-4 text-accent" />{prompt.copies.toLocaleString()} copies</span>
            <span className="inline-flex items-center gap-2 border-l border-border pl-4">
              <LikeButton 
                promptId={prompt.id} 
                initialLikes={prompt.likes_count || 0} 
                initialIsLiked={!!prompt.is_liked}
                showText 
              />
              <DislikeButton 
                promptId={prompt.id} 
                initialDislikes={prompt.dislikes_count || 0} 
                initialIsDisliked={!!prompt.is_disliked}
                showText 
              />
            </span>
            <span className="inline-flex items-center gap-2 border-l border-border pl-4">
              <ShareButton 
                promptId={prompt.id} 
                promptSlug={prompt.slug}
                initialShares={prompt.shares_count || 0}
                showText 
              />
              <SaveButton 
                promptId={prompt.id} 
                initialSaves={prompt.saves_count || 0} 
                initialIsSaved={!!prompt.is_saved}
                showText 
              />
            </span>
            <span className="inline-flex items-center gap-2 border-l border-border pl-4"><Calendar className="h-4 w-4 text-accent" />{new Date(prompt.created_at).toLocaleDateString()}</span>
          </div>
          <section className="glass mt-8 rounded-card p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Prompt Content</h2>
              <div className="hidden sm:block"><CopyPromptButton prompt={prompt} compact /></div>
            </div>
            <pre className="max-h-[460px] overflow-auto whitespace-pre-wrap rounded-card border border-border bg-panel p-4 text-sm leading-7 text-foreground">{prompt.prompt_content}</pre>
            <div className="mt-4 sm:hidden"><CopyPromptButton prompt={prompt} /></div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <section className="glass rounded-card p-5">
            <div className="flex items-center gap-4">
              <Link href={prompt.user_id ? `/user/${prompt.user_id}` : "#"} className="shrink-0">
                <Image src={authorAvatar} alt={authorName} width={64} height={64} className="h-16 w-16 rounded-full object-cover ring-2 ring-accent/50" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={prompt.user_id ? `/user/${prompt.user_id}` : "#"} className="flex items-center gap-1 hover:text-accent">
                  <h2 className="truncate text-lg font-bold">{authorName}</h2>
                  {(prompt.profiles?.is_verified) && <BadgeCheck className="h-4 w-4 shrink-0 text-blue-400" />}
                </Link>
                <p className="truncate text-sm text-accent">{authorUsername}</p>
              </div>
              <Button asChild variant="outline" size="sm" className="shrink-0 h-8 px-3 text-xs rounded-full border-accent/20 hover:bg-accent/10">
                <Link href={prompt.user_id ? `/user/${prompt.user_id}` : "#"}>
                  View Profile
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">Follow me on Instagram for more premium prompts and daily AI content.</p>
            <div className="mt-5 grid gap-3">
              {!isSelf && prompt.user_id && (
                <FollowButton userId={prompt.user_id} initialIsFollowing={isFollowing} />
              )}
              {authorInstagram && (
                <Button asChild size="lg" className="bg-gradient-to-r from-accent to-accent-deep text-black">
                  <a href={authorInstagram} target="_blank" rel="noreferrer"><Instagram className="h-5 w-5 mr-2" />Follow on Instagram</a>
                </Button>
              )}
              <CopyPromptButton prompt={prompt} />
            </div>
          </section>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold">Related Prompts</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => <PromptCard key={item.id} prompt={item} />)}
          </div>
        </section>
      )}
    </article>
  );
}
