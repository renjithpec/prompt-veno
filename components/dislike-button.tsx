"use client";

import { useState, useEffect } from "react";
import { ThumbsDown } from "lucide-react";
import { toggleDislike } from "@/app/actions/user";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DislikeButton({ 
  promptId, 
  initialDislikes, 
  initialIsDisliked,
  className,
  showText = false
}: { 
  promptId: string; 
  initialDislikes: number; 
  initialIsDisliked: boolean;
  className?: string;
  showText?: boolean;
}) {
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [isDisliked, setIsDisliked] = useState(initialIsDisliked);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  // Sync state if props change from server
  useEffect(() => {
    setDislikes(initialDislikes);
    setIsDisliked(initialIsDisliked);
  }, [initialDislikes, initialIsDisliked]);

  // Listen for like events on the same prompt to clear the dislike state instantly
  useEffect(() => {
    const handleReaction = (e: any) => {
      if (e.detail.promptId === promptId && e.detail.type === "like" && isDisliked) {
        setIsDisliked(false);
        setDislikes(prev => Math.max(0, prev - 1));
      }
    };
    window.addEventListener("reaction-update", handleReaction);
    return () => window.removeEventListener("reaction-update", handleReaction);
  }, [promptId, isDisliked]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isPending) return;
    setIsPending(true);

    // Optimistic update
    const newIsDisliked = !isDisliked;
    setIsDisliked(newIsDisliked);
    setDislikes(prev => newIsDisliked ? prev + 1 : Math.max(0, prev - 1));

    // Tell the like button to turn off optimistically
    if (newIsDisliked) {
      window.dispatchEvent(new CustomEvent("reaction-update", { detail: { promptId, type: "dislike" } }));
    }

    const result = await toggleDislike(promptId);
    
    if (result?.error) {
      setIsDisliked(!newIsDisliked);
      setDislikes(prev => !newIsDisliked ? prev + 1 : Math.max(0, prev - 1));
      
      if (result.error.toLowerCase().includes("unauthorized")) {
        router.push("/login");
      } else {
        toast.error("Failed to dislike");
      }
    } else if (result && "disliked" in result && typeof result.disliked === "boolean") {
      // Sync with server result just in case
      setIsDisliked(result.disliked);
      router.refresh(); // Refresh to pull updated stats from server
    }
    
    setIsPending(false);
  };

  return (
    <button 
      onClick={handleToggle}
      className={cn(
        "flex items-center gap-1.5 transition-colors tap rounded-full p-1 -m-1 focus:outline-none focus:ring-2 focus:ring-accent/50",
        isDisliked ? "text-orange-500 hover:text-orange-600" : "text-muted-foreground hover:text-foreground",
        className
      )}
      disabled={isPending}
      aria-label={isDisliked ? "Remove dislike" : "Dislike"}
    >
      <ThumbsDown className={cn("h-4 w-4", isDisliked && "fill-current")} />
      {showText ? (
        <span className="font-semibold text-sm">{dislikes} {dislikes === 1 ? 'Dislike' : 'Dislikes'}</span>
      ) : (
        <span className="font-bold text-xs">{dislikes}</span>
      )}
    </button>
  );
}
