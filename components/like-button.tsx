"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleLike } from "@/app/actions/user";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function LikeButton({ 
  promptId, 
  initialLikes, 
  initialIsLiked,
  className,
  showText = false
}: { 
  promptId: string; 
  initialLikes: number; 
  initialIsLiked: boolean;
  className?: string;
  showText?: boolean;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if inside a Link
    
    if (isPending) return;
    setIsPending(true);

    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes(prev => newIsLiked ? prev + 1 : prev - 1);

    const result = await toggleLike(promptId);
    
    // If not authenticated or error, revert
    if (result?.error) {
      setIsLiked(!newIsLiked);
      setLikes(prev => !newIsLiked ? prev + 1 : prev - 1);
      
      // If error is related to auth, redirect to login
      if (result.error.toLowerCase().includes("unauthorized")) {
        router.push("/login");
      }
    } else if (result && "liked" in result && typeof result.liked === "boolean") {
      // Sync with server result just in case
      setIsLiked(result.liked);
    }
    
    setIsPending(false);
  };

  return (
    <button 
      onClick={handleToggle}
      className={cn(
        "flex items-center gap-1.5 transition-colors tap rounded-full p-1 -m-1 focus:outline-none focus:ring-2 focus:ring-accent/50",
        isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground",
        className
      )}
      disabled={isPending}
      aria-label={isLiked ? "Unlike" : "Like"}
    >
      <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
      {showText ? (
        <span className="font-semibold text-sm">{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
      ) : (
        <span className="font-bold text-xs">{likes}</span>
      )}
    </button>
  );
}
