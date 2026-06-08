"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { sanitizeError } from "@/lib/safe-action";

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
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(1000),
  prompt_content: z.string().trim().min(10).max(10000),
  preview_image: z.string().url(),
  category_id: z.string().uuid("Invalid category"),
  featured: z.coerce.boolean().default(false)
});

export async function createPrompt(formData: FormData) {
  try {
    const supabase = await assertAdmin();
    const parsed = promptSchema.parse({
      title: formData.get("title"),
      description: formData.get("description"),
      prompt_content: formData.get("prompt_content"),
      preview_image: formData.get("preview_image"),
      category_id: formData.get("category_id"),
      featured: formData.get("featured") === "on"
    });
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("prompts").insert({ 
      ...parsed, 
      slug: slugify(parsed.title),
      status: 'approved',
      user_id: user?.id 
    });
    revalidatePath("/");
    revalidatePath("/prompts");
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    throw new Error(sanitizeError(error, "createPrompt"));
  }
}

export async function updatePrompt(formData: FormData) {
  try {
    const supabase = await assertAdmin();
    const id = String(formData.get("id") || "");
    const currentSlug = String(formData.get("current_slug") || "");

    // Validate UUID format for id
    z.string().uuid().parse(id);

    const parsed = promptSchema.parse({
      title: formData.get("title"),
      description: formData.get("description"),
      prompt_content: formData.get("prompt_content"),
      preview_image: formData.get("preview_image"),
      category_id: formData.get("category_id"),
      featured: formData.get("featured") === "on"
    });
    
    const status = String(formData.get("status") || "approved");
    const nextSlug = slugify(parsed.title);

    await supabase
      .from("prompts")
      .update({ ...parsed, slug: nextSlug, status })
      .eq("id", id);

    revalidatePath("/");
    revalidatePath("/prompts");
    revalidatePath(`/prompt/${currentSlug}`);
    revalidatePath(`/prompt/${nextSlug}`);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    throw new Error(sanitizeError(error, "updatePrompt"));
  }
}

export async function moderatePrompt(formData: FormData) {
  try {
    const supabase = await assertAdmin();
    const id = String(formData.get("id"));
    const status = String(formData.get("status"));
    
    if (!id || !["pending", "approved", "rejected"].includes(status)) {
      throw new Error("Invalid status or ID");
    }

    await supabase
      .from("prompts")
      .update({ status })
      .eq("id", id);

    revalidatePath("/admin");
    revalidatePath("/prompts");
    revalidatePath("/");
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    throw new Error(sanitizeError(error, "moderatePrompt"));
  }
}

export async function deletePrompt(formData: FormData) {
  try {
    const supabase = await assertAdmin();
    const id = String(formData.get("id"));
    z.string().uuid().parse(id);
    await supabase.from("prompts").delete().eq("id", id);
    revalidatePath("/");
    revalidatePath("/prompts");
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    throw new Error(sanitizeError(error, "deletePrompt"));
  }
}

export async function toggleUserVerification(formData: FormData) {
  try {
    const supabase = await assertAdmin();
    const id = String(formData.get("id"));
    const isVerified = formData.get("is_verified") === "true";
    
    z.string().uuid().parse(id);

    await supabase.from("profiles").update({ is_verified: isVerified }).eq("id", id);
    
    revalidatePath("/admin/users");
    revalidatePath(`/user/${id}`);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    throw new Error(sanitizeError(error, "toggleUserVerification"));
  }
}

const settingsSchema = z.object({
  instagram_url: z.string().url(),
  instagram_username: z.string().trim().min(2).max(100),
  creator_name: z.string().trim().min(2).max(100),
  creator_avatar: z.string().url(),
  site_title: z.string().trim().min(2).max(100),
  site_description: z.string().trim().min(10).max(500)
});

export async function updateSettings(formData: FormData) {
  try {
    const supabase = await assertAdmin();
    const parsed = settingsSchema.parse(Object.fromEntries(formData));
    await supabase.from("settings").upsert({ id: "settings", ...parsed, updated_at: new Date().toISOString() });
    revalidatePath("/");
    revalidatePath("/prompt/[slug]", "page");
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    throw new Error(sanitizeError(error, "updateSettings"));
  }
}

const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(8).max(500),
  icon: z.string().trim().min(2).max(50)
});

export async function createCategory(formData: FormData) {
  try {
    const supabase = await assertAdmin();
    const parsed = categorySchema.parse(Object.fromEntries(formData));
    await supabase.from("categories").insert({ ...parsed, slug: slugify(parsed.name) });
    revalidatePath("/");
    revalidatePath("/prompts");
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    throw new Error(sanitizeError(error, "createCategory"));
  }
}

export async function deleteCategory(formData: FormData) {
  try {
    const supabase = await assertAdmin();
    const id = String(formData.get("id"));
    z.string().uuid().parse(id);
    await supabase.from("categories").delete().eq("id", id);
    revalidatePath("/");
    revalidatePath("/prompts");
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    throw new Error(sanitizeError(error, "deleteCategory"));
  }
}

const tagSchema = z.object({
  name: z.string().trim().min(2).max(50)
});

export async function createTag(formData: FormData) {
  try {
    const supabase = await assertAdmin();
    const parsed = tagSchema.parse(Object.fromEntries(formData));
    await supabase.from("tags").insert({ ...parsed, slug: slugify(parsed.name) });
    revalidatePath("/prompts");
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    throw new Error(sanitizeError(error, "createTag"));
  }
}

export async function deleteTag(formData: FormData) {
  try {
    const supabase = await assertAdmin();
    const id = String(formData.get("id"));
    z.string().uuid().parse(id);
    await supabase.from("tags").delete().eq("id", id);
    revalidatePath("/prompts");
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    throw new Error(sanitizeError(error, "deleteTag"));
  }
}
