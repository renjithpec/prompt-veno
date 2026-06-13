"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { sanitizeError } from "@/lib/safe-action";

export async function rewardUser(userId: string, amount: number, reason: string) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Database not configured");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Check if the current user is admin, since only admins should be able to reward others,
    // OR if the system is rewarding the user directly, we might need a service role key.
    // For now, assuming this action is called securely or by an admin.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Unauthorized: Only admins can issue rewards directly.");
    }

    // Insert transaction
    const { error: txError } = await supabase
      .from("coin_transactions")
      .insert({
        user_id: userId,
        amount,
        reason
      });

    if (txError) throw txError;

    // Increment user's coins
    // Using RPC would be safer, but doing a select and update since we might not have increment_coins rpc
    const { data: targetProfile, error: profileError } = await supabase
      .from("profiles")
      .select("coins")
      .eq("id", userId)
      .single();

    if (profileError) throw profileError;

    const currentCoins = targetProfile?.coins || 0;
    
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ coins: currentCoins + amount })
      .eq("id", userId);

    if (updateError) throw updateError;

    revalidatePath("/rewards");
    revalidatePath(`/user/${userId}`);
    return { success: true };
  } catch (error) {
    return { error: sanitizeError(error, "rewardUser") };
  }
}

export async function claimDailyReward() {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Database not configured");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const adminClient = createSupabaseAdminClient();
    if (!adminClient) throw new Error("Database admin not configured");

    // Check if user already claimed today
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const { data: existingClaims, error: claimError } = await adminClient
      .from("coin_transactions")
      .select("id")
      .eq("user_id", user.id)
      .eq("reason", "Daily Check-in")
      .gte("created_at", today.toISOString())
      .limit(1);

    if (claimError) throw claimError;

    if (existingClaims && existingClaims.length > 0) {
      throw new Error("Already claimed today");
    }

    // Insert transaction
    const { error: txError } = await adminClient
      .from("coin_transactions")
      .insert({
        user_id: user.id,
        amount: 10,
        reason: "Daily Check-in"
      });

    if (txError) throw txError;

    // Increment user's coins
    const { data: targetProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("coins")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    const currentCoins = targetProfile?.coins || 0;
    
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({ coins: currentCoins + 10 })
      .eq("id", user.id);

    if (updateError) throw updateError;

    revalidatePath("/");
    revalidatePath("/rewards");
    return { success: true };
  } catch (error) {
    return { error: sanitizeError(error, "claimDailyReward") };
  }
}

export async function rewardForChat() {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Database not configured");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const adminClient = createSupabaseAdminClient();
    if (!adminClient) throw new Error("Database admin not configured");

    const { data: targetProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("coins")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    const currentCoins = targetProfile?.coins || 0;
    
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({ coins: currentCoins + 1 })
      .eq("id", user.id);

    if (updateError) throw updateError;

    await adminClient
      .from("coin_transactions")
      .insert({
        user_id: user.id,
        amount: 1,
        reason: "Chat Message Sent"
      });

    return { success: true };
  } catch (error) {
    return { error: sanitizeError(error, "rewardForChat") };
  }
}

export async function deductForDeletedChat() {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Database not configured");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const adminClient = createSupabaseAdminClient();
    if (!adminClient) throw new Error("Database admin not configured");

    const { data: targetProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("coins")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    const currentCoins = targetProfile?.coins || 0;
    const newCoins = Math.max(0, currentCoins - 1);
    
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({ coins: newCoins })
      .eq("id", user.id);

    if (updateError) throw updateError;

    await adminClient
      .from("coin_transactions")
      .insert({
        user_id: user.id,
        amount: -1,
        reason: "Message Deleted"
      });

    return { success: true };
  } catch (error) {
    return { error: sanitizeError(error, "deductForDeletedChat") };
  }
}
