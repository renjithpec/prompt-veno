"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { trackShare } from "@/app/actions/user";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ShareButton({ 
  promptId, 
  promptSlug,
  initialShares,
  className,
  showText = false
}: { 
  promptId: string; 
  promptSlug: string;
  initialShares: number; 
  className?: string;
  showText?: boolean;
}) {
  const [shares, setShares] = useState(initialShares);
  const [isPending, setIsPending] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Copy to clipboard
    const url = `${window.location.origin}/prompt/${promptSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }

    if (isPending) return;
    setIsPending(true);

    // Optimistic update for UI
    setShares(prev => prev + 1);

    const result = await trackShare(promptId);
    
    if (!result?.success) {
      setShares(prev => prev - 1); // Revert on failure
    }
    
    setIsPending(false);
  };

  return (
    <button 
      onClick={handleShare}
      className={cn(
        "flex items-center gap-1.5 transition-colors tap rounded-full p-1 -m-1 focus:outline-none focus:ring-2 focus:ring-accent/50 text-muted-foreground hover:text-foreground",
        className
      )}
      disabled={isPending}
      aria-label="Share"
    >
      <Share2 className="h-4 w-4" />
      {showText ? (
        <span className="font-semibold text-sm">{shares} {shares === 1 ? 'Share' : 'Shares'}</span>
      ) : (
        <span className="font-bold text-xs">{shares}</span>
      )}
    </button>
  );
}
