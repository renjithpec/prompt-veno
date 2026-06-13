import { notFound } from "next/navigation";
import Image from "next/image";
import { BadgeCheck, User as UserIcon } from "lucide-react";
import { getUserProfile, getPrompts, checkIsFollowing, getFollowers, getFollowing } from "@/lib/data";
import { PromptCard } from "@/components/prompt-card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FollowButton } from "./follow-button";
import { UserListModal } from "@/components/user-list-modal";
import { VerifiedBadge } from "@/components/verified-badge";
import { Prompt } from "@/lib/types";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [profile, prompts, followers, following] = await Promise.all([
    getUserProfile(id),
    getPrompts({ limit: 100, user_id: id }),
    getFollowers(id),
    getFollowing(id)
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="mb-12 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
        
        {/* Avatar */}
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border bg-foreground/5 sm:h-36 sm:w-36">
          {profile.avatar ? (
            <Image src={profile.avatar} alt={profile.name || "User"} fill className="object-cover" />
          ) : (
            <UserIcon className="h-full w-full p-6 text-muted-foreground sm:p-8" />
          )}
        </div>
        
        {/* User Info & Stats */}
        <div className="flex w-full flex-col items-center sm:items-start sm:flex-1">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 mb-4">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
              {profile.name || "Anonymous"}
              {(profile.is_verified || profile.follower_count >= 1000) && (
                <VerifiedBadge className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
              )}
            </h1>
            
            {/* Desktop Follow Button (Hidden on Mobile) */}
            <div className="hidden sm:block">
              {!isSelf && (
                <FollowButton userId={id} initialIsFollowing={isFollowing} />
              )}
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="flex justify-center gap-8 sm:justify-start mb-6">
            <div className="text-center sm:text-left">
              <span className="text-xl font-bold text-foreground">{prompts.length}</span>
              <p className="text-sm text-muted-foreground">prompts</p>
            </div>
            <UserListModal 
              title="Followers" 
              count={profile.follower_count} 
              label="followers" 
              users={followers} 
            />
            <UserListModal 
              title="Following" 
              count={profile.following_count} 
              label="following" 
              users={following} 
            />
          </div>

          {/* Mobile Follow Button (Hidden on Desktop) */}
          <div className="w-full sm:hidden">
            {!isSelf && (
              <FollowButton userId={id} initialIsFollowing={isFollowing} className="w-full" />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground border-b border-border pb-4">Prompts</h2>
        {prompts.length === 0 ? (
          <div className="rounded-card border border-dashed border-border bg-foreground/5 p-12 text-center text-muted-foreground">
            This user hasn&apos;t contributed any approved prompts yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt: Prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
