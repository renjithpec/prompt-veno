"use client";

import { BadgeCheck } from "lucide-react";
import { toast } from "sonner";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toast("Official Creator", {
          description: "This user is an officially verified premium creator on Prompt Veno.",
          icon: <BadgeCheck className="h-5 w-5 text-blue-400" />
        });
      }}
      className="inline-flex shrink-0 cursor-pointer rounded-full transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-background"
      aria-label="Verified User"
    >
      <BadgeCheck className={className || "h-4 w-4 text-blue-400"} />
    </button>
  );
}
