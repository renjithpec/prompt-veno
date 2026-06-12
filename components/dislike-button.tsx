"use client";

import { useState } from "react";
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

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isPending) return;
    setIsPending(true);

    const newIsDisliked = !isDisliked;
    setIsDisliked(newIsDisliked);
    setDislikes(prev => newIsDisliked ? prev + 1 : prev - 1);

    const result = await toggleDislike(promptId);
    
    if (result?.error) {
      setIsDisliked(!newIsDisliked);
      setDislikes(prev => !newIsDisliked ? prev + 1 : prev - 1);
      
      if (result.error.toLowerCase().includes("unauthorized")) {
        router.push("/login");
      } else {
        toast.error("Failed to dislike");
      }
    } else if (result && "disliked" in result && typeof result.disliked === "boolean") {
      setIsDisliked(result.disliked);
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
