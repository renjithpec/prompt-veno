"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function searchGlobal(query: string) {
  if (!query || query.trim().length < 2) return { profiles: [], prompts: [] };

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) return { profiles: [], prompts: [] };

  const searchTerm = `%${query.trim()}%`;

  try {
    // 1. Search profiles (by name)
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('id, name, avatar')
      .ilike('name', searchTerm)
      .limit(5);

    // 2. Search published prompts (by title)
    const { data: prompts } = await adminClient
      .from('prompts')
      .select('id, title, slug, status')
      .eq('status', 'approved')
      .ilike('title', searchTerm)
      .limit(5);

    return {
      profiles: profiles || [],
      prompts: prompts || []
    };
  } catch (error) {
    console.error("Search Error:", error);
    return { profiles: [], prompts: [] };
  }
}

export async function getDefaultSearchSuggestions() {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) return { profiles: [], prompts: [] };

  try {
    // Top 3 creators by coins
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('id, name, avatar')
      .order('coins', { ascending: false })
      .limit(3);

    // 3 trending prompts
    const { data: prompts } = await adminClient
      .from('prompts')
      .select('id, title, slug, status')
      .eq('status', 'approved')
      .order('views', { ascending: false })
      .limit(3);

    return {
      profiles: profiles || [],
      prompts: prompts || []
    };
  } catch (error) {
    console.error("Default Suggestions Error:", error);
    return { profiles: [], prompts: [] };
  }
}
