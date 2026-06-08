import { notFound } from "next/navigation";
import Image from "next/image";
import { BadgeCheck, User as UserIcon } from "lucide-react";
import { getUserProfile, getPrompts, checkIsFollowing } from "@/lib/data";
import { PromptCard } from "@/components/prompt-card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FollowButton } from "./follow-button";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [profile, prompts] = await Promise.all([
    getUserProfile(id),
    getPrompts({ limit: 100, user_id: id })
  ]);

  if (!profile) notFound();

  const supabase = await createSupabaseServerClient();
  let isFollowing = false;
  let isSelf = false;

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      if (user.id === id) isSelf = true;
      else isFollowing = await checkIsFollowing(user.id, id);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-white/10 bg-white/5 sm:h-32 sm:w-32">
          {profile.avatar ? (
            <Image src={profile.avatar} alt={profile.name || "User"} fill className="object-cover" />
          ) : (
            <UserIcon className="h-full w-full p-6 text-zinc-500" />
          )}
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <h1 className="flex items-center gap-2 text-3xl font-bold text-white">
              {profile.name || "Anonymous"}
              {(profile.is_verified || profile.follower_count >= 1000) && (
                <BadgeCheck className="h-6 w-6 text-blue-400" />
              )}
            </h1>
            {!isSelf && (
              <FollowButton userId={id} initialIsFollowing={isFollowing} />
            )}
          </div>
          
          <div className="flex justify-center gap-6 sm:justify-start">
            <div className="text-center sm:text-left">
              <span className="text-xl font-bold text-white">{profile.follower_count}</span>
              <p className="text-sm text-zinc-400">followers</p>
            </div>
            <div className="text-center sm:text-left">
              <span className="text-xl font-bold text-white">{profile.following_count}</span>
              <p className="text-sm text-zinc-400">following</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-4">Prompts</h2>
        {prompts.length === 0 ? (
          <div className="rounded-card border border-dashed border-white/10 bg-white/5 p-12 text-center text-zinc-400">
            This user hasn't contributed any approved prompts yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prompts.map(prompt => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
