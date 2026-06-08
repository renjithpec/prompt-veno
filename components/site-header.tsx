"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Home" },
  { href: "/prompts", label: "Prompts" },
  { href: "/category/veo3", label: "Categories" },
  { href: "/about", label: "About" }
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Check if admin
        const { data } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
        setIsAdmin(data?.role === "admin");
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#050505]/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center" aria-label="Prompt Veno home">
          <Image src="/logo.svg" alt="Prompt Veno" width={436} height={136} priority className="h-11 w-auto sm:h-12" />
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-zinc-400 transition hover:text-white">{link.label}</Link>
          ))}
        </nav>
        
        <div className="hidden items-center gap-3 md:flex relative">
          {!loading && user ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="tap flex h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.02] pl-3 pr-4 text-sm font-medium transition hover:bg-white/[0.06]"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-black">
                  {user.email?.[0].toUpperCase() || "U"}
                </div>
                Account
              </button>
              
              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-card border border-white/10 bg-[#090909] p-1 shadow-2xl backdrop-blur-xl"
                    >
                      <div className="px-2 py-2.5 text-sm text-white">
                        <p className="font-medium">Logged in as</p>
                        <p className="truncate text-xs text-zinc-400">{user.email}</p>
                      </div>
                      <div className="my-1 h-px bg-white/10" />
                      <Link href="/contribute" onClick={() => setDropdownOpen(false)} className="flex w-full cursor-pointer items-center rounded-md px-2 py-2 text-sm text-lime-400 transition hover:bg-white/10 hover:text-lime-300">
                        Submit a Prompt
                      </Link>
                      <Link href="/settings" onClick={() => setDropdownOpen(false)} className="flex w-full cursor-pointer items-center rounded-md px-2 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white">
                        Account Settings
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex w-full cursor-pointer items-center rounded-md px-2 py-2 text-sm text-purple-400 transition hover:bg-white/10 hover:text-purple-300">
                          Admin Dashboard
                        </Link>
                      )}
                      <div className="my-1 h-px bg-white/10" />
                      <button onClick={handleSignOut} className="flex w-full cursor-pointer items-center rounded-md px-2 py-2 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300">
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : !loading ? (
            <>
              <Button asChild variant="ghost"><Link href="/login">Sign in</Link></Button>
              <Button asChild><Link href="/prompts">Get Started</Link></Button>
            </>
          ) : (
            <div className="h-10 w-24 animate-pulse rounded-full bg-white/5" />
          )}
        </div>
        
        <button 
          aria-label="Open navigation" 
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/5 backdrop-blur-md text-zinc-300 hover:bg-white/10 hover:text-white transition shadow-lg"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>

    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] bg-black/70 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="ml-auto flex h-full w-[86vw] max-w-sm flex-col border-l border-white/10 bg-[#090909] p-4" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.35 }}>
            <div className="flex items-center justify-between">
              <Image src="/logo.svg" alt="Prompt Veno" width={436} height={136} className="h-12 w-auto" />
              <Button aria-label="Close navigation" size="icon" variant="ghost" onClick={() => setOpen(false)}><X className="h-5 w-5" /></Button>
            </div>
            <div className="mt-8 grid gap-2">
              {links.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="tap rounded-card px-3 py-3 text-lg font-medium text-zinc-100 hover:bg-white/[0.08]">{link.label}</Link>
              ))}
              {user && (
                <>
                  <div className="my-2 h-px w-full bg-white/10" />
                  <Link href="/contribute" onClick={() => setOpen(false)} className="tap rounded-card px-3 py-3 text-lg font-medium text-lime-400 hover:bg-white/[0.08]">Submit a Prompt</Link>
                  <Link href="/settings" onClick={() => setOpen(false)} className="tap rounded-card px-3 py-3 text-lg font-medium text-accent hover:bg-white/[0.08]">Account Settings</Link>
                  {isAdmin && <Link href="/admin" onClick={() => setOpen(false)} className="tap rounded-card px-3 py-3 text-lg font-medium text-purple-400 hover:bg-white/[0.08]">Admin Dashboard</Link>}
                </>
              )}
            </div>
            <div className="mt-auto grid gap-3">
              {user ? (
                <Button variant="danger" size="lg" onClick={handleSignOut}>Sign Out</Button>
              ) : (
                <>
                  <Button asChild variant="secondary" size="lg"><Link href="/login">Sign in for free</Link></Button>
                  <Button asChild size="lg"><Link href="/prompts">Get Started</Link></Button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
