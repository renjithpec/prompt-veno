import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SettingsClient } from "./settings-client";

export const metadata = {
  title: "Account Settings",
  description: "Manage your profile, security, and account preferences."
};

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/");

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const { data: userPrompts } = await supabase
    .from("prompts")
    .select("*, category:categories(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <SettingsClient user={user} profile={profile} userPrompts={userPrompts || []} />;
}
