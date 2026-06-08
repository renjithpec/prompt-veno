"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizeError, isRedirectError } from "@/lib/safe-action";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  instagram_url: z.string().url("Must be a valid URL").optional().or(z.literal(''))
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
});

const submitPromptSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  prompt_content: z.string().min(10).max(5000),
  category_id: z.string().uuid(),
  tags: z.string()
});

export async function submitPrompt(formData: FormData) {
  try {
    const reqHeaders = await headers();
    const ip = getClientIp(reqHeaders);
    const rl = rateLimit(`prompt-submit:${ip}`, 3, 60000); // 3 submits per minute
    if (!rl.allowed) throw new Error("Too many requests. Please wait a minute before submitting again.");

    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Database not configured");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const result = submitPromptSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      prompt_content: formData.get("prompt_content"),
      category_id: formData.get("category_id"),
      tags: formData.get("tags")
    });
    
    if (!result.success) {
      return { error: "Validation failed", details: result.error.flatten().fieldErrors };
    }

    const previewImage = formData.get("preview_image");
    if (!previewImage || typeof previewImage !== "string") {
      return { error: "Preview image is required" };
    }

    // 1. Generate slug
    let slug = result.data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // 2. Create prompt (defaults to 'pending' via DB trigger/default)
    const { data: prompt, error: promptError } = await supabase
      .from("prompts")
      .insert({
        title: result.data.title,
        slug,
        description: result.data.description,
        prompt_content: result.data.prompt_content,
        preview_image: previewImage,
        category_id: result.data.category_id,
        user_id: user.id
      })
      .select("id")
      .single();

    if (promptError) throw promptError;

    // 4. Handle tags
    const tagIds = result.data.tags.split(",").filter(Boolean);
    if (tagIds.length > 0) {
      const promptTags = tagIds.map(tagId => ({
        prompt_id: prompt.id,
        tag_id: tagId
      }));
      const { error: tagError } = await supabase
        .from("prompt_tags")
        .insert(promptTags);
      
      if (tagError) console.error("Failed to insert tags:", tagError);
    }

    revalidatePath("/settings");
    revalidatePath("/admin");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: sanitizeError(error, "submitPrompt") };
  }
  
  redirect("/settings");
}

export async function editPrompt(promptId: string, formData: FormData) {
  try {
    const reqHeaders = await headers();
    const ip = getClientIp(reqHeaders);
    const rl = rateLimit(`prompt-edit:${ip}`, 5, 60000); // 5 edits per minute
    if (!rl.allowed) throw new Error("Too many requests. Please wait a minute before editing again.");

    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Database not configured");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const result = submitPromptSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      prompt_content: formData.get("prompt_content"),
      category_id: formData.get("category_id"),
      tags: formData.get("tags")
    });
    
    if (!result.success) {
      return { error: "Validation failed", details: result.error.flatten().fieldErrors };
    }

    const previewImage = formData.get("preview_image");
    if (!previewImage || typeof previewImage !== "string") {
      return { error: "Preview image is required" };
    }

    // Update the prompt and revert status to pending
    const { error: promptError } = await supabase
      .from("prompts")
      .update({
        title: result.data.title,
        description: result.data.description,
        prompt_content: result.data.prompt_content,
        preview_image: previewImage,
        category_id: result.data.category_id,
        status: "pending" // Always revert to pending on edit
      })
      .eq("id", promptId)
      .eq("user_id", user.id);

    if (promptError) throw promptError;

    // Handle tags (delete existing and insert new)
    const { error: deleteTagsError } = await supabase
      .from("prompt_tags")
      .delete()
      .eq("prompt_id", promptId);
    
    if (deleteTagsError) throw deleteTagsError;

    const tagIds = result.data.tags.split(",").filter(Boolean);
    if (tagIds.length > 0) {
      const promptTags = tagIds.map(tagId => ({
        prompt_id: promptId,
        tag_id: tagId
      }));
      const { error: tagError } = await supabase
        .from("prompt_tags")
        .insert(promptTags);
      
      if (tagError) console.error("Failed to insert tags on edit:", tagError);
    }

    revalidatePath("/settings");
    revalidatePath("/admin");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: sanitizeError(error, "editPrompt") };
  }
  
  redirect("/settings");
}

export async function deletePrompt(id: string) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Database not configured");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Supabase RLS ensures they can only delete their own
    const { error } = await supabase
      .from("prompts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { error: sanitizeError(error, "deletePrompt") };
  }
}

export async function updateProfile(formData: FormData) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Database not configured");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const result = profileSchema.safeParse({
      name: formData.get("name"),
      instagram_url: formData.get("instagram_url")
    });
    
    if (!result.success) return { error: "Invalid name or URL" };

    const avatar = formData.get("avatar");
    const updateData: any = { 
      name: result.data.name,
      instagram_url: result.data.instagram_url || null
    };
    if (avatar && typeof avatar === "string") updateData.avatar = avatar;

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);

    if (error) throw error;
    
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { error: sanitizeError(error, "updateProfile") };
  }
}

export async function updatePassword(formData: FormData) {
  try {
    const reqHeaders = await headers();
    const ip = getClientIp(reqHeaders);
    const rl = rateLimit(`password-change:${ip}`, 5, 60000); // Max 5 attempts per minute
    if (!rl.allowed) throw new Error("Too many requests. Please try again later.");

    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Database not configured");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Only allow password change if they use email/password provider
    if (user.app_metadata.provider !== "email" && !user.app_metadata.providers?.includes("email")) {
      return { error: "You are logged in with Google. You cannot change your password here." };
    }

    const result = passwordSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword")
    });
    if (!result.success) {
      return { error: "Validation failed", details: result.error.flatten().fieldErrors };
    }

    // Verify current password first by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: result.data.currentPassword
    });

    if (signInError) {
      return { error: "Incorrect current password" };
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: result.data.newPassword
    });

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    return { error: sanitizeError(error, "updatePassword") };
  }
}

export async function deleteAccount() {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Database not configured");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const adminSupabase = createSupabaseAdminClient();
    if (!adminSupabase) throw new Error("Admin database not configured");

    // Delete user from auth.users (this triggers cascades to delete profile, favorites, etc.)
    const { error } = await adminSupabase.auth.admin.deleteUser(user.id);
    if (error) throw error;

    // Sign them out locally
    await supabase.auth.signOut();

    return { success: true };
  } catch (error) {
    return { error: sanitizeError(error, "deleteAccount") };
  }
}
