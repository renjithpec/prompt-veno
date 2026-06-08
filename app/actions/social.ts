"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizeError } from "@/lib/safe-action";

export async function toggleFollow(followingId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Database not configured");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    if (user.id === followingId) throw new Error("Cannot follow yourself");

    // Check if currently following
    const { data: existingFollow } = await supabase
      .from("user_follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", followingId)
      .maybeSingle();

    if (existingFollow) {
      // Unfollow
      const { error } = await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", followingId);
      if (error) throw error;
    } else {
      // Follow
      const { error } = await supabase
        .from("user_follows")
        .insert({
          follower_id: user.id,
          following_id: followingId
        });
      if (error) throw error;
    }

    revalidatePath(`/user/${followingId}`);
    return { success: true, isFollowing: !existingFollow };
  } catch (error) {
    return { error: sanitizeError(error, "toggleFollow") };
  }
}
