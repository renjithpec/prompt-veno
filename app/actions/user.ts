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
  category_ids: z.string().min(1, "At least one category is required"),
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
      category_ids: formData.get("category_ids"),
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

    // 5. Handle categories
    const catIds = result.data.category_ids.split(",").filter(Boolean).slice(0, 3);
    if (catIds.length > 0) {
      const promptCategories = catIds.map(catId => ({
        prompt_id: prompt.id,
        category_id: catId
      }));
      const { error: catError } = await supabase
        .from("prompt_categories")
        .insert(promptCategories);
      
      if (catError) console.error("Failed to insert categories:", catError);
    }

    // 6. Notify Admins
    const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
    if (admins && admins.length > 0) {
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        actor_id: user.id,
        type: 'pending_approval',
        prompt_id: prompt.id
      }));
      await supabase.from('notifications').insert(notifications);
    }

    revalidatePath("/settings");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: sanitizeError(error, "submitPrompt") };
  }
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
      category_ids: formData.get("category_ids"),
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

    // Handle categories (delete existing and insert new)
    const { error: deleteCatsError } = await supabase
      .from("prompt_categories")
      .delete()
      .eq("prompt_id", promptId);
    
    if (deleteCatsError) throw deleteCatsError;

    const catIds = result.data.category_ids.split(",").filter(Boolean).slice(0, 3);
    if (catIds.length > 0) {
      const promptCategories = catIds.map(catId => ({
        prompt_id: promptId,
        category_id: catId
      }));
      const { error: catError } = await supabase
        .from("prompt_categories")
        .insert(promptCategories);
      
      if (catError) console.error("Failed to insert categories on edit:", catError);
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

export async function toggleLike(promptId: string) {
  try {
    const reqHeaders = await headers();
    const ip = getClientIp(reqHeaders);
    const rl = rateLimit(`toggle-like:${ip}`, 30, 60000); // 30 likes per minute max
    if (!rl.allowed) throw new Error("Too many requests.");

    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Database not configured");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Check if liked
    const { data: existingLike } = await supabase
      .from("prompts_likes")
      .select("*")
      .eq("user_id", user.id)
      .eq("prompt_id", promptId)
      .maybeSingle();

    if (existingLike) {
      await supabase
        .from("prompts_likes")
        .delete()
        .eq("user_id", user.id)
        .eq("prompt_id", promptId);
      return { success: true, liked: false };
    } else {
      await supabase
        .from("prompts_likes")
        .insert({ user_id: user.id, prompt_id: promptId });

      // If they like, we should remove their dislike if it exists
      await supabase.from("prompts_dislikes").delete().eq("user_id", user.id).eq("prompt_id", promptId);

      return { success: true, liked: true };
    }
  } catch (error) {
    return { error: sanitizeError(error, "toggleLike") };
  }
}

export async function toggleDislike(promptId: string) {
  try {
    const reqHeaders = await headers();
    const ip = getClientIp(reqHeaders);
    const rl = rateLimit(`toggle-dislike:${ip}`, 30, 60000);
    if (!rl.allowed) throw new Error("Too many requests.");

    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Database not configured");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Check if disliked
    const { data: existingDislike } = await supabase
      .from("prompts_dislikes")
      .select("*")
      .eq("user_id", user.id)
      .eq("prompt_id", promptId)
      .maybeSingle();

    if (existingDislike) {
      await supabase
        .from("prompts_dislikes")
        .delete()
        .eq("user_id", user.id)
        .eq("prompt_id", promptId);
      return { success: true, disliked: false };
    } else {
      await supabase
        .from("prompts_dislikes")
        .insert({ user_id: user.id, prompt_id: promptId });
      
      // If they dislike, we should remove their like if it exists
      await supabase.from("prompts_likes").delete().eq("user_id", user.id).eq("prompt_id", promptId);

      return { success: true, disliked: true };
    }
  } catch (error) {
    return { error: sanitizeError(error, "toggleDislike") };
  }
}

export async function toggleSave(promptId: string) {
  try {
    const reqHeaders = await headers();
    const ip = getClientIp(reqHeaders);
    const rl = rateLimit(`toggle-save:${ip}`, 30, 60000);
    if (!rl.allowed) throw new Error("Too many requests.");

    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Database not configured");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Check if saved
    const { data: existingSave } = await supabase
      .from("prompts_saves")
      .select("*")
      .eq("user_id", user.id)
      .eq("prompt_id", promptId)
      .maybeSingle();

    if (existingSave) {
      await supabase
        .from("prompts_saves")
        .delete()
        .eq("user_id", user.id)
        .eq("prompt_id", promptId);
      return { success: true, saved: false };
    } else {
      await supabase
        .from("prompts_saves")
        .insert({ user_id: user.id, prompt_id: promptId });
      return { success: true, saved: true };
    }
  } catch (error) {
    return { error: sanitizeError(error, "toggleSave") };
  }
}

export async function trackShare(promptId: string) {
  try {
    const reqHeaders = await headers();
    const ip = getClientIp(reqHeaders);
    const rl = rateLimit(`track-share:${ip}`, 30, 60000);
    if (!rl.allowed) return { success: false };

    const supabase = await createSupabaseServerClient();
    if (!supabase) return { success: false };

    await supabase.rpc('increment_prompt_shares', { prompt_id: promptId });
    
    const { data: { user } } = await supabase.auth.getUser();
    const { data: prompt } = await supabase.from('prompts').select('user_id').eq('id', promptId).single();
    
    if (prompt && prompt.user_id !== user?.id) {
       await supabase.from('notifications').insert({
         user_id: prompt.user_id,
         actor_id: user?.id || null,
         type: 'share',
         prompt_id: promptId
       });
    }

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function markNotificationsAsRead() {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { success: false };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    return { success: true };
  } catch (error) {
    return { error: sanitizeError(error, "markNotificationsAsRead") };
  }
}

