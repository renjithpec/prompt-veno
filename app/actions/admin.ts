"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

async function assertAdmin() {
  const authClient = await createSupabaseServerClient();
  const adminClient = createSupabaseAdminClient();
  if (!authClient || !adminClient) throw new Error("Supabase admin environment is not configured.");
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) throw new Error("Authentication required.");
  const { data } = await adminClient.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (data?.role !== "admin") throw new Error("Admin access required.");
  return adminClient;
}

const promptSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  prompt_content: z.string().min(10),
  preview_image: z.string().url(),
  category_id: z.string().min(1),
  featured: z.coerce.boolean().default(false)
});

export async function createPrompt(formData: FormData) {
  const supabase = await assertAdmin();
  const parsed = promptSchema.parse({
    title: formData.get("title"),
    description: formData.get("description"),
    prompt_content: formData.get("prompt_content"),
    preview_image: formData.get("preview_image"),
    category_id: formData.get("category_id"),
    featured: formData.get("featured") === "on"
  });
  await supabase.from("prompts").insert({ ...parsed, slug: slugify(parsed.title) });
  revalidatePath("/");
  revalidatePath("/prompts");
}

export async function updatePrompt(formData: FormData) {
  const supabase = await assertAdmin();
  const id = String(formData.get("id") || "");
  const currentSlug = String(formData.get("current_slug") || "");
  const parsed = promptSchema.parse({
    title: formData.get("title"),
    description: formData.get("description"),
    prompt_content: formData.get("prompt_content"),
    preview_image: formData.get("preview_image"),
    category_id: formData.get("category_id"),
    featured: formData.get("featured") === "on"
  });
  const nextSlug = slugify(parsed.title);

  await supabase
    .from("prompts")
    .update({ ...parsed, slug: nextSlug })
    .eq("id", id);

  revalidatePath("/");
  revalidatePath("/prompts");
  revalidatePath(`/prompt/${currentSlug}`);
  revalidatePath(`/prompt/${nextSlug}`);
}

export async function deletePrompt(formData: FormData) {
  const supabase = await assertAdmin();
  const id = String(formData.get("id"));
  await supabase.from("prompts").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/prompts");
}

const settingsSchema = z.object({
  instagram_url: z.string().url(),
  instagram_username: z.string().min(2),
  creator_name: z.string().min(2),
  creator_avatar: z.string().url(),
  site_title: z.string().min(2),
  site_description: z.string().min(10)
});

export async function updateSettings(formData: FormData) {
  const supabase = await assertAdmin();
  const parsed = settingsSchema.parse(Object.fromEntries(formData));
  await supabase.from("settings").upsert({ id: "settings", ...parsed, updated_at: new Date().toISOString() });
  revalidatePath("/");
  revalidatePath("/prompt/[slug]", "page");
}

const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().min(8),
  icon: z.string().min(2)
});

export async function createCategory(formData: FormData) {
  const supabase = await assertAdmin();
  const parsed = categorySchema.parse(Object.fromEntries(formData));
  await supabase.from("categories").insert({ ...parsed, slug: slugify(parsed.name) });
  revalidatePath("/");
  revalidatePath("/prompts");
}

export async function deleteCategory(formData: FormData) {
  const supabase = await assertAdmin();
  await supabase.from("categories").delete().eq("id", String(formData.get("id")));
  revalidatePath("/");
  revalidatePath("/prompts");
}

const tagSchema = z.object({
  name: z.string().min(2)
});

export async function createTag(formData: FormData) {
  const supabase = await assertAdmin();
  const parsed = tagSchema.parse(Object.fromEntries(formData));
  await supabase.from("tags").insert({ ...parsed, slug: slugify(parsed.name) });
  revalidatePath("/prompts");
}

export async function deleteTag(formData: FormData) {
  const supabase = await assertAdmin();
  await supabase.from("tags").delete().eq("id", String(formData.get("id")));
  revalidatePath("/prompts");
}
