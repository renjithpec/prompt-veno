"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#050505]/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center" aria-label="Prompt Veno home">
          <Image src="/logo.svg" alt="Prompt Veno" width={436} height={136} priority className="h-11 w-auto sm:h-12" />
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-zinc-400 transition hover:text-white">{link.label}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost"><Link href="/login">Login</Link></Button>
          <Button asChild><Link href="/prompts">Get Started</Link></Button>
        </div>
        <Button aria-label="Open navigation" size="icon" variant="secondary" className="md:hidden" onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 bg-black/70 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="ml-auto flex h-full w-[86vw] max-w-sm flex-col border-l border-white/10 bg-[#090909] p-4" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.35 }}>
              <div className="flex items-center justify-between">
                <Image src="/logo.svg" alt="Prompt Veno" width={436} height={136} className="h-12 w-auto" />
                <Button aria-label="Close navigation" size="icon" variant="ghost" onClick={() => setOpen(false)}><X className="h-5 w-5" /></Button>
              </div>
              <div className="mt-8 grid gap-2">
                {links.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="tap rounded-card px-3 py-3 text-lg font-medium text-zinc-100 hover:bg-white/[0.08]">{link.label}</Link>
                ))}
              </div>
              <div className="mt-auto grid gap-3">
                <Button asChild variant="secondary"><Link href="/login">Login</Link></Button>
                <Button asChild><Link href="/prompts">Get Started</Link></Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
