"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { toggleSave } from "@/app/actions/user";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function SaveButton({ 
  promptId, 
  initialSaves, 
  initialIsSaved,
  className,
  showText = false
}: { 
  promptId: string; 
  initialSaves: number; 
  initialIsSaved: boolean;
  className?: string;
  showText?: boolean;
}) {
  const [saves, setSaves] = useState(initialSaves);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isPending) return;
    setIsPending(true);

    const newIsSaved = !isSaved;
    setIsSaved(newIsSaved);
    setSaves(prev => newIsSaved ? prev + 1 : prev - 1);

    const result = await toggleSave(promptId);
    
    if (result?.error) {
      setIsSaved(!newIsSaved);
      setSaves(prev => !newIsSaved ? prev + 1 : prev - 1);
      
      if (result.error.toLowerCase().includes("unauthorized")) {
        router.push("/login");
      } else {
        toast.error("Failed to save");
      }
    } else if (result && "saved" in result && typeof result.saved === "boolean") {
      setIsSaved(result.saved);
      if (result.saved) {
        toast.success("Prompt saved to your collection!");
      }
    }
    
    setIsPending(false);
  };

  return (
    <button 
      onClick={handleToggle}
      className={cn(
        "flex items-center gap-1.5 transition-colors tap rounded-full p-1 -m-1 focus:outline-none focus:ring-2 focus:ring-accent/50",
        isSaved ? "text-accent-foreground hover:text-accent-foreground/80" : "text-muted-foreground hover:text-foreground",
        className
      )}
      disabled={isPending}
      aria-label={isSaved ? "Unsave" : "Save"}
    >
      <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
      {showText ? (
        <span className="font-semibold text-sm">{saves} {saves === 1 ? 'Save' : 'Saves'}</span>
      ) : (
        <span className="font-bold text-xs">{saves}</span>
      )}
    </button>
  );
}
