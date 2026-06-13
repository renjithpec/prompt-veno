import { unstable_noStore as noStore } from "next/cache";
import type { Category, Prompt, Settings, Tag, Profile } from "@/lib/types";
import { categories as sampleCategories, prompts as samplePrompts, settings as sampleSettings, tags as sampleTags } from "@/lib/sample-data";
import { createSupabaseAdminClient, createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

type PromptRow = Omit<Prompt, "categories" | "category" | "tags" | "profiles"> & {
  prompt_categories?: Array<{ categories: Category | null }>;
  prompt_tags?: Array<{ tags: Tag | null }>;
  profiles?: { name: string | null; avatar: string | null; is_verified?: boolean; follower_count?: number; instagram_url?: string | null } | null;
};

function normalizePrompt(row: PromptRow, isLiked: boolean = false, isDisliked: boolean = false, isSaved: boolean = false): Prompt {
  const categoriesArray = row.prompt_categories?.map((item) => item.categories).filter(Boolean) as Category[] || [];
  return {
    ...row,
    likes_count: row.likes_count || 0,
    dislikes_count: row.dislikes_count || 0,
    saves_count: row.saves_count || 0,
    shares_count: row.shares_count || 0,
    is_liked: isLiked,
    is_disliked: isDisliked,
    is_saved: isSaved,
    category: categoriesArray[0],
    categories: categoriesArray,
    tags: row.prompt_tags?.map((item) => item.tags).filter(Boolean) as Tag[] || [],
    profiles: row.profiles || null
  };
}

function normalizeSettings(settings: Settings): Settings {
  const creatorName = settings.creator_name.toLowerCase();
  const instagramName = settings.instagram_username.toLowerCase();
  const instagramUrl = settings.instagram_url.toLowerCase();

  return {
    ...settings,
    site_title: settings.site_title.toLowerCase().includes("promptvault") ? "Prompt Veno" : settings.site_title,
    creator_name: creatorName.includes("promptvault") || creatorName.includes("studio") ? "Prompt Veno" : settings.creator_name,
    instagram_username: instagramName.includes("promptvault") || instagramName.startsWith("@promptveno") ? "Prompt Veno" : settings.instagram_username,
    instagram_url: instagramUrl.includes("promptvault") || instagramUrl.includes("promptveno.ai") ? "https://www.instagram.com/promptveno/" : settings.instagram_url
  };
}

function searchLocalPrompts(query?: string, category?: string, tag?: string, sort = "trending") {
  const needle = query?.trim().toLowerCase();
  const results = samplePrompts.filter((prompt) => {
    const matchesQuery = !needle || [prompt.title, prompt.description, prompt.prompt_content, ...(prompt.categories?.map(c => c.name) || []), ...prompt.tags.map((item) => item.name)].join(" ").toLowerCase().includes(needle);
    const matchesCategory = !category || prompt.categories?.some((c) => c.slug === category);
    const matchesTag = !tag || prompt.tags.some((item) => item.slug === tag);
    return matchesQuery && matchesCategory && matchesTag;
  });

  return sortPrompts(results, sort);
}

function sortPrompts(items: Prompt[], sort: string) {
  return [...items].sort((a, b) => {
    if (sort === "newest") return +new Date(b.created_at) - +new Date(a.created_at);
    if (sort === "most-viewed") return b.views - a.views;
    if (sort === "most-copied") return b.copies - a.copies;
    return b.views + b.copies * 2 - (a.views + a.copies * 2);
  });
}

export async function getSettings(): Promise<Settings> {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return normalizeSettings(sampleSettings);
  const { data } = await supabase.from("settings").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle();
  return normalizeSettings(data || sampleSettings);
}

export async function getCategories(): Promise<Category[]> {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return sampleCategories;
  const { data } = await supabase.from("categories").select("*").order("name");
  return data?.length ? data : sampleCategories;
}

export async function getTags(): Promise<Tag[]> {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return sampleTags;
  const { data } = await supabase.from("tags").select("*").order("name");
  return data?.length ? data : sampleTags;
}

export async function getPrompts(options: { query?: string; category?: string; tag?: string; sort?: string; featured?: boolean; limit?: number; status?: string; user_id?: string; savedOnly?: boolean } = {}): Promise<Prompt[]> {
  noStore();
  const sort = options.sort || "trending";
  const statusFilter = options.status || "approved";
  
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    const local = searchLocalPrompts(options.query, options.category, options.tag, sort);
    const featured = options.featured ? local.filter((prompt) => prompt.featured) : local;
    return options.limit ? featured.slice(0, options.limit) : featured;
  }

  let query = supabase
    .from("prompts")
    .select(options.category ? "*, prompt_categories!inner(categories!inner(*)), prompt_tags(tags(*)), profiles!prompts_user_id_fkey(name, avatar, is_verified)" : "*, prompt_categories(categories(*)), prompt_tags(tags(*)), profiles!prompts_user_id_fkey(name, avatar, is_verified)");

  if (statusFilter !== "all") query = query.eq("status", statusFilter);
  if (options.user_id) query = query.eq("user_id", options.user_id);
  if (options.query) query = query.textSearch("search_vector", options.query, { type: "websearch" });
  if (options.featured) query = query.eq("featured", true);
  if (options.category) query = query.eq("prompt_categories.categories.slug", options.category);

  if (options.savedOnly) {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (userId) {
      // Perform inner join effectively by checking if prompt id exists in prompts_saves for this user
      // Note: A more efficient approach is an inner join `prompts_saves!inner()`, but due to how we dynamically build,
      // an `in` filter is easier if we fetch saved prompt IDs first.
      const { data: savedData } = await supabase.from('prompts_saves').select('prompt_id').eq('user_id', userId);
      if (savedData && savedData.length > 0) {
        query = query.in("id", savedData.map(s => s.prompt_id));
      } else {
        // If no saved prompts, return empty
        return [];
      }
    } else {
      return [];
    }
  }

  if (sort === "newest") query = query.order("created_at", { ascending: false });
  else if (sort === "most-viewed") query = query.order("views", { ascending: false });
  else if (sort === "most-copied") query = query.order("copies", { ascending: false });
  else query = query.order("views", { ascending: false }).order("copies", { ascending: false });

  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) {
    console.error("Supabase error fetching prompts:", error);
  }
  
  // Fetch user interactions if applicable
  let likedPromptIds = new Set<string>();
  let dislikedPromptIds = new Set<string>();
  let savedPromptIds = new Set<string>();
  if (data && data.length > 0) {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (userId) {
      const promptIds = data.map(d => d.id);
      const [{ data: userLikes }, { data: userDislikes }, { data: userSaves }] = await Promise.all([
        supabase.from('prompts_likes').select('prompt_id').eq('user_id', userId).in('prompt_id', promptIds),
        supabase.from('prompts_dislikes').select('prompt_id').eq('user_id', userId).in('prompt_id', promptIds),
        supabase.from('prompts_saves').select('prompt_id').eq('user_id', userId).in('prompt_id', promptIds)
      ]);
      
      if (userLikes) userLikes.forEach(l => likedPromptIds.add(l.prompt_id));
      if (userDislikes) userDislikes.forEach(d => dislikedPromptIds.add(d.prompt_id));
      if (userSaves) userSaves.forEach(s => savedPromptIds.add(s.prompt_id));
    }
  }

  let rows = (data || []).map((row) => normalizePrompt(
    row as PromptRow, 
    likedPromptIds.has(row.id),
    dislikedPromptIds.has(row.id),
    savedPromptIds.has(row.id)
  ));
  if (options.tag) rows = rows.filter((prompt) => prompt.tags.some((item) => item.slug === options.tag));
  
  // Only fallback to local sample data if we didn't query a specific user/saved list and the DB is completely empty.
  // Otherwise, legitimately return 0 rows.
  if (rows.length === 0 && !options.user_id && !options.savedOnly && !options.query) {
    return searchLocalPrompts(options.query, options.category, options.tag, sort);
  }
  return rows;
}

export async function getPromptBySlug(slug: string): Promise<Prompt | null> {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return samplePrompts.find((prompt) => prompt.slug === slug) || null;

  const { data } = await supabase
    .from("prompts")
    .select("*, prompt_categories(categories(*)), prompt_tags(tags(*)), profiles!prompts_user_id_fkey(name, avatar, is_verified, follower_count, instagram_url)")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  let isLiked = false;
  let isDisliked = false;
  let isSaved = false;
  if (data) {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (userId) {
      const [{ data: like }, { data: dislike }, { data: save }] = await Promise.all([
        supabase.from('prompts_likes').select('prompt_id').eq('user_id', userId).eq('prompt_id', data.id).maybeSingle(),
        supabase.from('prompts_dislikes').select('prompt_id').eq('user_id', userId).eq('prompt_id', data.id).maybeSingle(),
        supabase.from('prompts_saves').select('prompt_id').eq('user_id', userId).eq('prompt_id', data.id).maybeSingle()
      ]);
      if (like) isLiked = true;
      if (dislike) isDisliked = true;
      if (save) isSaved = true;
    }
  }

  return data ? normalizePrompt(data as PromptRow, isLiked, isDisliked, isSaved) : samplePrompts.find((prompt) => prompt.slug === slug) || null;
}

export async function getPromptById(id: string): Promise<Prompt | null> {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return samplePrompts.find((prompt) => prompt.id === id) || null;

  const { data } = await supabase
    .from("prompts")
    .select("*, prompt_categories(categories(*)), prompt_tags(tags(*)), profiles!prompts_user_id_fkey(name, avatar, is_verified, follower_count, instagram_url)")
    .eq("id", id)
    .maybeSingle();

  let isLiked = false;
  let isDisliked = false;
  let isSaved = false;
  if (data) {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (userId) {
      const [{ data: like }, { data: dislike }, { data: save }] = await Promise.all([
        supabase.from('prompts_likes').select('prompt_id').eq('user_id', userId).eq('prompt_id', data.id).maybeSingle(),
        supabase.from('prompts_dislikes').select('prompt_id').eq('user_id', userId).eq('prompt_id', data.id).maybeSingle(),
        supabase.from('prompts_saves').select('prompt_id').eq('user_id', userId).eq('prompt_id', data.id).maybeSingle()
      ]);
      if (like) isLiked = true;
      if (dislike) isDisliked = true;
      if (save) isSaved = true;
    }
  }

  return data ? normalizePrompt(data as PromptRow, isLiked, isDisliked, isSaved) : samplePrompts.find((prompt) => prompt.id === id) || null;
}

export async function getCategoryBySlug(slug: string) {
  const all = await getCategories();
  return all.find((category) => category.slug === slug) || null;
}

export async function trackPromptEvent(slug: string, event: "view" | "copy") {
  if (!hasSupabaseEnv()) return;
  const supabaseAdmin = createSupabaseAdminClient();
  if (!supabaseAdmin) return;
  const field = event === "view" ? "views" : "copies";
  await supabaseAdmin.rpc("increment_prompt_metric", { prompt_slug: slug, metric_name: field });

  if (event === "copy") {
    // Notify prompt owner
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabaseUser = await createSupabaseServerClient();
    
    const { data: prompt } = await supabaseAdmin.from('prompts').select('id, user_id').eq('slug', slug).single();
    if (prompt) {
      let actorId = null;
      if (supabaseUser) {
        const { data: { user } } = await supabaseUser.auth.getUser();
        actorId = user?.id || null;
      }
      
      if (prompt.user_id !== actorId) {
        await supabaseAdmin.from('notifications').insert({
          user_id: prompt.user_id,
          actor_id: actorId,
          type: 'copy',
          prompt_id: prompt.id
        });
      }
    }
  }
}

export async function getPublicStats() {
  const promptList = await getPrompts({ status: "approved" });
  const rawCopies = promptList.reduce((total, prompt) => total + prompt.copies, 0);
  const rawViews = promptList.reduce((total, prompt) => total + prompt.views, 0);
  
  return {
    promptCount: promptList.length,
    copies: rawCopies,
    // Ensure views always mathematically makes sense compared to copies
    views: Math.max(rawViews, rawCopies + Math.floor(rawCopies * 1.5))
  };
}

export async function getAdminStats() {
  const promptList = await getPrompts({ sort: "trending", status: "all" });
  return {
    promptCount: promptList.length,
    copies: promptList.reduce((total, prompt) => total + prompt.copies, 0),
    views: promptList.reduce((total, prompt) => total + prompt.views, 0),
    categories: new Set(promptList.map((prompt) => prompt.category?.slug)).size,
    topPrompts: sortPrompts(promptList, "trending").slice(0, 5)
  };
}

export async function getUserProfile(id: string): Promise<Profile | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function checkIsFollowing(followerId: string, followingId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;
  const { data } = await supabase
    .from("user_follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();
  return !!data;
}

export async function getFollowers(userId: string): Promise<{ id: string; name: string | null; avatar: string | null; instagram_url: string | null }[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];
  
  const { data } = await supabase
    .from("user_follows")
    .select(`
      profiles!user_follows_follower_id_fkey (
        id,
        name,
        avatar,
        instagram_url
      )
    `)
    .eq("following_id", userId);
    
  return (data || []).map((row: any) => row.profiles as any);
}

export async function getFollowing(userId: string): Promise<{ id: string; name: string | null; avatar: string | null; instagram_url: string | null }[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];
  
  const { data } = await supabase
    .from("user_follows")
    .select(`
      profiles!user_follows_following_id_fkey (
        id,
        name,
        avatar,
        instagram_url
      )
    `)
    .eq("follower_id", userId);
    
  return (data || []).map((row: any) => row.profiles as any);
}

export async function getNotifications(): Promise<Notification[]> {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("notifications")
    .select(`
      *,
      actor:profiles!notifications_actor_id_fkey(name, avatar),
      prompt:prompts(title, slug),
      message:public_messages(content)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return data || [];
}

