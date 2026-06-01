import type { Category, Prompt, Settings, Tag } from "@/lib/types";

export const settings: Settings = {
  id: "settings",
  instagram_url: "https://www.instagram.com/promptveno/",
  instagram_username: "Prompt Veno",
  creator_name: "Prompt Veno",
  creator_avatar: "https://i.pravatar.cc/240?img=12",
  site_title: "Prompt Veno",
  site_description: "Premium AI prompts for viral creator workflows.",
  updated_at: new Date("2026-01-01").toISOString()
};

export const categories: Category[] = [
  { id: "cat-veo3", name: "Veo 3", slug: "veo3", description: "Cinematic video prompts for viral short-form ads and reels.", icon: "Clapperboard", created_at: "2026-01-01T00:00:00Z" },
  { id: "cat-chatgpt", name: "ChatGPT", slug: "chatgpt", description: "Research, writing, scripts, hooks, and creator operating systems.", icon: "MessageSquareText", created_at: "2026-01-01T00:00:00Z" },
  { id: "cat-flux", name: "Flux", slug: "flux", description: "High-end image prompts for product, fashion, and editorial content.", icon: "Image", created_at: "2026-01-01T00:00:00Z" },
  { id: "cat-midjourney", name: "Midjourney", slug: "midjourney", description: "Premium visuals, thumbnails, posters, and brand concepts.", icon: "Sparkles", created_at: "2026-01-01T00:00:00Z" },
  { id: "cat-kling", name: "Kling", slug: "kling", description: "Motion-first prompts built for expressive AI video generation.", icon: "Film", created_at: "2026-01-01T00:00:00Z" },
  { id: "cat-instagram", name: "Instagram", slug: "instagram", description: "Hooks, captions, reel ideas, carousels, and growth systems.", icon: "Instagram", created_at: "2026-01-01T00:00:00Z" }
];

export const tags: Tag[] = [
  { id: "tag-viral", name: "Viral", slug: "viral" },
  { id: "tag-reels", name: "Reels", slug: "reels" },
  { id: "tag-product", name: "Product", slug: "product" },
  { id: "tag-cinematic", name: "Cinematic", slug: "cinematic" },
  { id: "tag-hooks", name: "Hooks", slug: "hooks" },
  { id: "tag-growth", name: "Growth", slug: "growth" }
];

const bySlug = (slug: string) => categories.find((category) => category.slug === slug)!;
const tagList = (...slugs: string[]) => slugs.map((slug) => tags.find((tag) => tag.slug === slug)!);

export const prompts: Prompt[] = [
  {
    id: "prompt-veo-car",
    title: "Cinematic Veo 3 Car Commercial",
    slug: "cinematic-veo3-car-commercial",
    description: "A polished luxury car ad prompt with premium lighting, camera moves, and product drama.",
    prompt_content: "Create a 9:16 cinematic Veo 3 video of a midnight-black electric sports car moving through a rain-slick city at blue hour. Use low tracking shots, reflective asphalt, soft volumetric light, macro details of wheels and headlights, tasteful lens flares, luxury commercial pacing, and a final hero frame with space for a short Instagram Reel caption. Keep the edit under 8 seconds, premium, realistic, and brand-safe.",
    preview_image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
    category_id: "cat-veo3",
    category: bySlug("veo3"),
    tags: tagList("viral", "reels", "cinematic", "product"),
    featured: true,
    views: 18420,
    copies: 6721,
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-02-12T00:00:00Z"
  },
  {
    id: "prompt-chatgpt-hooks",
    title: "30 Reel Hooks For Any Niche",
    slug: "30-reel-hooks-for-any-niche",
    description: "Generate scroll-stopping hooks for creators, founders, coaches, and students.",
    prompt_content: "Act as an Instagram growth strategist. Ask me for my niche, audience, offer, and tone. Then produce 30 short Reel hooks sorted by curiosity, contradiction, transformation, proof, and urgency. Each hook must fit in the first 2 seconds of a Reel, avoid clickbait, and include a one-line content angle plus a suggested visual opening.",
    preview_image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80",
    category_id: "cat-chatgpt",
    category: bySlug("chatgpt"),
    tags: tagList("viral", "reels", "hooks", "growth"),
    featured: true,
    views: 22630,
    copies: 9234,
    created_at: "2026-02-03T00:00:00Z",
    updated_at: "2026-02-15T00:00:00Z"
  },
  {
    id: "prompt-flux-product",
    title: "Luxury Product Shoot In Flux",
    slug: "luxury-product-shoot-in-flux",
    description: "Create polished product imagery with controlled reflections and high-end campaign polish.",
    prompt_content: "Generate a premium product photo of [PRODUCT] on a black glass surface with subtle lime accent reflections, precise studio lighting, crisp edges, shallow depth of field, editorial luxury campaign styling, soft shadow grounding, and realistic material texture. Composition: 4:5 vertical, clean negative space, no text, no watermark.",
    preview_image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
    category_id: "cat-flux",
    category: bySlug("flux"),
    tags: tagList("product", "cinematic"),
    featured: true,
    views: 13005,
    copies: 3912,
    created_at: "2026-02-06T00:00:00Z",
    updated_at: "2026-02-16T00:00:00Z"
  },
  {
    id: "prompt-kling-fashion",
    title: "Kling Fashion Reel Motion",
    slug: "kling-fashion-reel-motion",
    description: "A crisp motion prompt for fashion creators and boutique brands.",
    prompt_content: "Create a vertical Kling video of a model walking through a minimal concrete studio wearing [OUTFIT]. Camera begins with a close fabric detail, pulls back into a smooth runway tracking shot, then ends on a confident still pose. Lighting is soft but dramatic, motion is natural, fabric physics are realistic, and the final frame is clean for Instagram text overlay.",
    preview_image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    category_id: "cat-kling",
    category: bySlug("kling"),
    tags: tagList("reels", "cinematic"),
    featured: false,
    views: 9101,
    copies: 2466,
    created_at: "2026-02-09T00:00:00Z",
    updated_at: "2026-02-18T00:00:00Z"
  },
  {
    id: "prompt-midjourney-thumbnail",
    title: "Premium Thumbnail Concept",
    slug: "premium-thumbnail-concept",
    description: "Generate high-contrast creator thumbnails with strong visual hierarchy.",
    prompt_content: "Design a premium YouTube and Instagram thumbnail concept for [TOPIC]. Use bold subject placement, cinematic lighting, clean background separation, high contrast, tasteful neon lime accent, emotional facial expression if relevant, and strong negative space for 3-5 words of text. Photorealistic, editorial, no embedded text.",
    preview_image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    category_id: "cat-midjourney",
    category: bySlug("midjourney"),
    tags: tagList("viral", "cinematic"),
    featured: false,
    views: 11888,
    copies: 3270,
    created_at: "2026-02-11T00:00:00Z",
    updated_at: "2026-02-20T00:00:00Z"
  },
  {
    id: "prompt-instagram-carousel",
    title: "Instagram Carousel Growth System",
    slug: "instagram-carousel-growth-system",
    description: "Turn one idea into a polished carousel with hook, structure, caption, and CTA.",
    prompt_content: "Act as a senior Instagram content strategist. Turn this idea into a 7-slide carousel for [AUDIENCE]. Slide 1 must be a high-curiosity hook. Slides 2-6 must teach one practical idea per slide with short copy. Slide 7 must include a save/share CTA. Then write a caption, 10 niche hashtags, and one Reel adaptation of the same idea.",
    preview_image: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=1200&q=80",
    category_id: "cat-instagram",
    category: bySlug("instagram"),
    tags: tagList("growth", "hooks", "reels"),
    featured: true,
    views: 20043,
    copies: 8125,
    created_at: "2026-02-14T00:00:00Z",
    updated_at: "2026-02-22T00:00:00Z"
  }
];
