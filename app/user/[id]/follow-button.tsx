"use client";

import { useState } from "react";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "@/app/actions/social";
import { useRouter } from "next/navigation";

export function FollowButton({ 
  userId, 
  initialIsFollowing 
}: { 
  userId: string;
  initialIsFollowing: boolean;
}) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    setLoading(true);
    try {
      const result = await toggleFollow(userId);
      if (result?.error) {
        // Handle error if needed (maybe show toast if implemented)
        console.error(result.error);
        if (result.error.includes("Unauthorized")) {
          router.push("/login");
        }
      } else {
        setIsFollowing(!isFollowing);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button 
      onClick={handleToggle} 
      variant={isFollowing ? "secondary" : "default"}
      disabled={loading}
      className={isFollowing ? "border border-white/10" : "bg-accent text-black hover:bg-accent/90"}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="mr-2 h-4 w-4" />
      ) : (
        <UserPlus className="mr-2 h-4 w-4" />
      )}
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
