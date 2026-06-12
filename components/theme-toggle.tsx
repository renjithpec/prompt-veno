"use client";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return (
    <div className="h-10 w-20 rounded-full border-2 border-border bg-panel opacity-50" />
  );

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-10 w-20 items-center justify-between rounded-full border-2 border-border bg-panel shadow-inner transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-[10px]">
        <Sun className={`h-4 w-4 transition-colors duration-300 ${!isDark ? "text-black" : "text-muted"}`} />
        <Moon className={`h-4 w-4 transition-colors duration-300 ${isDark ? "text-black" : "text-muted"}`} />
      </div>
      
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute bottom-[3px] top-[3px] z-0 w-8 rounded-full bg-accent shadow-[0_0_15px_rgba(214,255,127,0.4)]"
        style={{
          left: isDark ? "calc(100% - 36px)" : "4px",
        }}
      />
    </button>
  );
}
