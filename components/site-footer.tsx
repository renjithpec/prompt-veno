import Link from "next/link";
import Image from "next/image";
import type { Settings } from "@/lib/types";

export function SiteFooter({ settings }: { settings: Settings }) {
  return (
    <footer className="border-t border-white/[0.08] bg-[#050505]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Image src="/logo.svg" alt="Prompt Veno" width={436} height={136} className="h-12 w-auto" />
          <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">{settings.site_description}</p>
        </div>
        <div className="grid gap-3 text-sm">
          <span className="font-semibold text-white">Explore</span>
          <Link href="/prompts" className="text-zinc-400 hover:text-accent">Prompts</Link>
          <Link href="/category/veo3" className="text-zinc-400 hover:text-accent">Veo 3</Link>
          <Link href="/category/chatgpt" className="text-zinc-400 hover:text-accent">ChatGPT</Link>
        </div>
        <div className="grid gap-3 text-sm">
          <span className="font-semibold text-white">Creator</span>
          <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-accent">{settings.instagram_username}</a>
          <Link href="/privacy" className="text-zinc-400 hover:text-accent">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
