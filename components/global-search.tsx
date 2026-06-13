"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, User, FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { searchGlobal, getDefaultSearchSuggestions } from "@/app/actions/search";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface SearchResult {
  profiles: any[];
  prompts: any[];
}

export function GlobalSearch({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({ profiles: [], prompts: [] });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (query.trim().length < 2) {
        setLoading(true);
        getDefaultSearchSuggestions().then(res => {
          setResults(res);
          setLoading(false);
        });
      }
    } else {
      setQuery("");
      setResults({ profiles: [], prompts: [] });
    }
  }, [open]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        const res = await searchGlobal(query);
        setResults(res);
        setLoading(false);
      } else {
        setResults({ profiles: [], prompts: [] });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (url: string) => {
    onOpenChange(false);
    router.push(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl w-[95vw] sm:w-full !top-16 sm:!top-24 !translate-y-0 p-0 gap-0 overflow-hidden bg-background border-border rounded-2xl [&>button]:hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="flex items-center px-4 py-3 border-b border-border bg-panel2">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none px-4 text-lg font-medium text-foreground placeholder:text-muted-foreground"
            placeholder="Search prompts and creators..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <Loader2 className="w-5 h-5 text-accent animate-spin shrink-0" />}
          {!loading && query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full shrink-0">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 no-scrollbar">
          {query.trim().length >= 2 && !loading && results.profiles.length === 0 && results.prompts.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No results found for &quot;{query}&quot;.
            </div>
          )}

          {results.profiles.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-2 text-xs font-black tracking-widest uppercase text-muted-foreground font-display">
                {query.trim().length < 2 ? "Top Creators" : "Creators"}
              </div>
              <div className="flex flex-col gap-1">
                {results.profiles.map(profile => {
                  const avatarUrl = profile.avatar 
                    ? (profile.avatar.startsWith('http') ? profile.avatar : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar}`) 
                    : null;
                  
                  return (
                    <button 
                      key={profile.id}
                      onClick={() => handleSelect(`/user/${profile.id}`)}
                      className="flex items-center gap-3 p-3 w-full text-left rounded-xl transition-all hover:bg-foreground/5 hover:text-accent group"
                    >
                      <div className="w-10 h-10 rounded-full border border-border/50 overflow-hidden bg-background shrink-0 flex items-center justify-center">
                        {avatarUrl ? (
                          <Image src={avatarUrl} alt={profile.name || 'User'} width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm group-hover:text-accent transition-colors">{profile.name || "Anonymous"}</span>
                        <span className="text-xs text-muted-foreground">Creator Profile</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {results.prompts.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-black tracking-widest uppercase text-muted-foreground font-display">
                {query.trim().length < 2 ? "Trending Prompts" : "Prompts"}
              </div>
              <div className="flex flex-col gap-1">
                {results.prompts.map(prompt => (
                  <button 
                    key={prompt.id}
                    onClick={() => handleSelect(`/prompt/${prompt.slug}`)}
                    className="flex items-center gap-3 p-3 w-full text-left rounded-xl transition-all hover:bg-foreground/5 hover:text-accent group"
                  >
                    <div className="w-10 h-10 rounded-xl border border-border/50 overflow-hidden bg-panel2 shrink-0 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent/80" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-bold text-sm truncate group-hover:text-accent transition-colors">{prompt.title}</span>
                      <span className="text-xs text-muted-foreground">Prompt</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
