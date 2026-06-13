"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Home, Search, LayoutGrid, Info, PlusCircle, MessageSquare, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { GlobalSearch } from "@/components/global-search";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/prompts", label: "Prompts", icon: Search },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/ranks", label: "Ranks", icon: Trophy },
  { href: "/about", label: "About", icon: Info }
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [coins, setCoins] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (user && !userError) {
        setUser(user);
        const { data } = await supabase.from("profiles").select("role, coins").eq("id", user.id).single();
        setIsAdmin(data?.role === "admin");
        setCoins(data?.coins || 0);
        
        // Fetch notifications
        const { data: notifs } = await supabase
          .from("notifications")
          .select("*, actor:profiles!notifications_actor_id_fkey(name, avatar), prompt:prompts(title, slug)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);
        if (notifs) setNotifications(notifs);
      }
      setLoading(false);
    };
    fetchUser();
    
    // Listen for custom events to update coins (e.g. from RewardPopup)
    const handleCoinsUpdated = (e: CustomEvent) => {
      if (e.detail && typeof e.detail.amount === 'number') {
        setCoins(prev => prev + e.detail.amount);
      }
    };
    window.addEventListener('coins-updated', handleCoinsUpdated as EventListener);
    
    return () => {
      window.removeEventListener('coins-updated', handleCoinsUpdated as EventListener);
    };
  }, []);

  const handleSignOut = async () => {
    const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <>
    <header className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-2xl md:bottom-4 md:left-4 md:top-4 md:w-[80px] xl:w-[250px] md:rounded-[32px] md:border-2 md:border-border md:bg-panel2/70 md:shadow-[0_0_40px_rgba(0,0,0,0.2)] transition-all duration-300 overflow-visible">
      
      {/* Desktop Sidebar Layout */}
      <div className="hidden h-full flex-col px-2 xl:px-4 py-8 md:flex">
        <Link href="/" className="mb-10 px-2 flex items-center justify-center xl:justify-start gap-3" aria-label="Prompt Veno home">
          <Image src="/logo-icon.png" alt="Prompt Veno" width={48} height={48} priority className="h-10 w-10 shrink-0" />
          <span className="font-display text-2xl font-black uppercase tracking-widest hidden xl:block leading-none mt-1">Prompt<br/>Veno</span>
        </Link>

        <button 
          onClick={() => setSearchOpen(true)}
          className="mb-3 relative flex items-center justify-center xl:justify-start gap-4 rounded-[24px] p-3 xl:px-5 xl:py-4 font-display text-sm font-black uppercase tracking-widest transition-all duration-300 text-muted-foreground hover:bg-foreground/[0.08] hover:text-foreground w-full"
        >
          <Search className="h-6 w-6 xl:h-5 xl:w-5 shrink-0" />
          <span className="hidden xl:block">Search</span>
        </button>
        
        <nav className="flex flex-1 flex-col gap-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`relative flex items-center justify-center xl:justify-start gap-4 rounded-[24px] p-3 xl:px-5 xl:py-4 font-display text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                  isActive 
                    ? "text-background scale-105 z-10" 
                    : "text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-sidebar-pill"
                    className="absolute inset-y-0 right-0 left-0 -z-10 rounded-[24px] bg-foreground shadow-xl"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <link.icon className="relative z-20 h-5 w-5 shrink-0" />
                <span className="relative z-20 hidden xl:block">{link.label}</span>
              </Link>
            );
          })}
          {/* Coins Link */}
          {user && (
            <Link href="/rewards" className={`relative flex items-center justify-center xl:justify-start gap-4 rounded-[24px] p-3 xl:px-5 xl:py-4 font-display text-sm font-black uppercase tracking-widest transition-all duration-300 ${pathname.startsWith('/rewards') ? "text-background scale-105 z-10" : "text-muted-foreground hover:bg-foreground/10 hover:text-foreground"}`}>
              {pathname.startsWith('/rewards') && (
                <motion.div layoutId="active-sidebar-pill" className="absolute inset-y-0 right-0 left-0 -z-10 rounded-[24px] bg-foreground shadow-xl" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              <Image src="/coin-asset.png" alt="Coins" width={20} height={20} className="relative z-20 h-5 w-5 shrink-0 animate-pulse drop-shadow-[0_0_8px_rgba(212,255,58,0.6)]" />
              <span className="relative z-20 hidden xl:block">{coins} Coins</span>
            </Link>
          )}
        </nav>
        
        <div className="mt-auto flex flex-col gap-3 pt-6 relative items-center xl:items-stretch">
          <div className="flex w-full gap-3 flex-col xl:flex-row items-center justify-center">
            <Link href="/contribute" className="flex items-center justify-center gap-2 rounded-full border-2 border-accent bg-transparent w-12 h-12 xl:flex-1 xl:w-auto xl:h-auto xl:py-3 xl:px-4 font-display text-xs font-black uppercase tracking-widest text-foreground transition hover:bg-accent hover:text-black shrink-0">
              <PlusCircle className="h-5 w-5 shrink-0" />
              <span className="hidden xl:block">Contribute</span>
            </Link>
            <div className="shrink-0">
              <ThemeToggle />
            </div>
          </div>

          {!loading && user ? (
            <div className="flex w-full items-center justify-center gap-3 relative flex-col xl:flex-row">
              <div className="shrink-0">
                <NotificationsDropdown initialNotifications={notifications} />
              </div>
              
              <div className="relative flex-1 w-full flex justify-center">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="tap flex items-center justify-center gap-2 rounded-full border-2 border-border bg-foreground/[0.02] w-12 h-12 xl:w-full xl:h-auto xl:py-3 xl:px-4 font-display text-sm font-black uppercase tracking-widest text-foreground transition-all hover:border-accent hover:bg-foreground/[0.06] hover:shadow-[0_0_20px_rgba(214,255,127,0.2)] shrink-0"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-black">
                    {user.email?.[0].toUpperCase() || "U"}
                  </div>
                  <span className="hidden xl:block">Account</span>
                </button>
              
              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, x: -10, scale: 0.95 }} 
                      animate={{ opacity: 1, x: 0, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-0 xl:left-auto xl:top-auto xl:bottom-0 xl:left-full z-50 mb-2 xl:mb-0 xl:ml-2 w-56 overflow-hidden rounded-card border border-border bg-panel p-1 shadow-2xl backdrop-blur-xl"
                    >
                      <div className="px-2 py-2.5 text-sm text-foreground">
                        <p className="font-medium">Logged in as</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="my-1 h-px bg-foreground/10" />
                      <Link href="/rewards" onClick={() => setDropdownOpen(false)} className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground dark:text-accent transition hover:bg-accent/10">
                        <Image src="/coin-asset.png" alt="Coins" width={16} height={16} className="h-4 w-4 drop-shadow-[0_0_8px_rgba(212,255,58,0.6)]" />
                        {coins} Coins
                      </Link>
                      <div className="my-1 h-px bg-foreground/10" />
                      <Link href="/saved" onClick={() => setDropdownOpen(false)} className="flex w-full cursor-pointer items-center rounded-md px-2 py-2 text-sm text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground">
                        Saved Prompts
                      </Link>
                      <Link href="/settings" onClick={() => setDropdownOpen(false)} className="flex w-full cursor-pointer items-center rounded-md px-2 py-2 text-sm text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground">
                        Account Settings
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex w-full cursor-pointer items-center rounded-md px-2 py-2 text-sm text-purple-400 transition hover:bg-foreground/10 hover:text-purple-300">
                          Admin Dashboard
                        </Link>
                      )}
                      <div className="my-1 h-px bg-foreground/10" />
                      <button onClick={handleSignOut} className="flex w-full cursor-pointer items-center rounded-md px-2 py-2 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300">
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
              </div>
            </div>
          ) : !loading ? (
            <div className="flex flex-col gap-2">
              <Button asChild variant="ghost" className="rounded-full font-display font-black uppercase tracking-widest w-full px-2"><Link href="/login" className="flex justify-center"><span className="hidden xl:block">Sign in</span><span className="xl:hidden">In</span></Link></Button>
              <Button asChild className="rounded-full font-display font-black uppercase tracking-widest bg-accent text-black hover:bg-accent/80 hover:shadow-[0_0_20px_rgba(214,255,127,0.4)] w-full px-2"><Link href="/prompts" className="flex justify-center"><span className="hidden xl:block">Get Started</span><span className="xl:hidden">Go</span></Link></Button>
            </div>
          ) : (
            <div className="h-12 w-full animate-pulse rounded-full bg-foreground/5" />
          )}
        </div>
      </div>

      {/* Mobile Top Bar Layout */}
      <div className="mx-auto flex h-20 w-full items-center justify-between px-4 md:hidden">
        <Link href="/" className="flex items-center gap-2" aria-label="Prompt Veno home">
          <Image src="/logo-icon.png" alt="Prompt Veno" width={48} height={48} priority className="h-8 w-8 shrink-0" />
          <span className="font-display text-lg font-black uppercase tracking-widest leading-none mt-1">Prompt Veno</span>
        </Link>
        <div className="flex items-center gap-2">
          {user && (
            <Link href="/rewards" className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-foreground/[0.02] px-3 font-display text-sm font-black uppercase tracking-widest text-foreground dark:text-accent transition-all hover:border-accent hover:bg-foreground/[0.06] shadow-lg backdrop-blur-md">
              <Image src="/coin-asset.png" alt="Coins" width={16} height={16} className="h-4 w-4 drop-shadow-[0_0_8px_rgba(212,255,58,0.6)] animate-pulse" />
              {coins}
            </Link>
          )}
          {user && <NotificationsDropdown initialNotifications={notifications} />}
          <button 
            aria-label="Search" 
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-foreground/5 text-muted-foreground shadow-lg backdrop-blur-md transition hover:bg-foreground/10 hover:text-foreground"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </button>
          <button 
            aria-label="Open navigation" 
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-foreground/5 text-muted-foreground shadow-lg backdrop-blur-md transition hover:bg-foreground/10 hover:text-foreground"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>

    {/* Mobile Drawer */}
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] bg-black/70 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="ml-auto flex h-full w-[86vw] max-w-sm flex-col border-l border-border bg-panel p-4" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.35 }}>
            <div className="flex items-center justify-between">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3">
                <Image src="/logo-icon.png" alt="Prompt Veno" width={48} height={48} className="h-10 w-10 shrink-0" />
                <span className="font-display text-xl font-black uppercase tracking-widest leading-none mt-1">Prompt Veno</span>
              </Link>
              <Button aria-label="Close navigation" size="icon" variant="ghost" onClick={() => setOpen(false)}><X className="h-5 w-5" /></Button>
            </div>
            <div className="mt-8 flex-1 overflow-y-auto no-scrollbar grid content-start gap-2 pb-6">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="flex items-center gap-3 tap rounded-card px-3 py-3 font-display text-lg font-black uppercase text-foreground hover:bg-foreground/[0.08]">
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
              
              <div className="my-2 h-px w-full bg-foreground/10" />
              <div className="flex gap-2">
                <Link href="/contribute" onClick={() => setOpen(false)} className="flex flex-1 items-center justify-center gap-3 tap rounded-full border-2 border-accent px-3 py-3 font-display text-lg font-black uppercase text-foreground hover:bg-accent hover:text-black">
                  <PlusCircle className="h-5 w-5" />
                  Submit a Prompt
                </Link>
                <div className="flex items-center justify-center px-2">
                  <ThemeToggle />
                </div>
              </div>

              {user && (
                <>
                  <div className="my-2 h-px w-full bg-foreground/10" />
                  <Link href="/rewards" onClick={() => setOpen(false)} className="flex items-center gap-3 tap rounded-card px-3 py-3 font-display text-lg font-black uppercase text-foreground dark:text-accent hover:bg-foreground/[0.08]">
                    <Image src="/coin-asset.png" alt="Coins" width={24} height={24} className="h-6 w-6 drop-shadow-[0_0_8px_rgba(212,255,58,0.6)]" />
                    {coins} Coins
                  </Link>
                  <Link href="/saved" onClick={() => setOpen(false)} className="tap rounded-card px-3 py-3 font-display text-lg font-black uppercase text-foreground hover:bg-foreground/[0.08]">Saved Prompts</Link>
                  <Link href="/settings" onClick={() => setOpen(false)} className="tap rounded-card px-3 py-3 font-display text-lg font-black uppercase text-foreground hover:bg-foreground/[0.08]">Account Settings</Link>
                  {isAdmin && <Link href="/admin" onClick={() => setOpen(false)} className="tap rounded-card px-3 py-3 font-display text-lg font-black uppercase text-purple-400 hover:bg-foreground/[0.08]">Admin Dashboard</Link>}
                </>
              )}
            </div>
            <div className="mt-auto grid gap-3">
              {user ? (
                <Button variant="danger" size="lg" className="rounded-full font-display font-black uppercase" onClick={handleSignOut}>Sign Out</Button>
              ) : (
                <>
                  <Button asChild variant="secondary" size="lg" className="rounded-full font-display font-black uppercase">
                    <Link href="/login" onClick={() => setOpen(false)}>Sign in for free</Link>
                  </Button>
                  <Button asChild size="lg" className="rounded-full font-display font-black uppercase">
                    <Link href="/prompts" onClick={() => setOpen(false)}>Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    
    <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
