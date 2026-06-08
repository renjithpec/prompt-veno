"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogoSpinner } from "@/components/logo-spinner";

export const AnimatedLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { loadingText?: string }
>(({ href, children, loadingText, onClick, ...props }, ref) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    // If it's opening in a new tab, don't show the loading overlay on this tab
    if (props.target === "_blank") return;
    if (!href || e.defaultPrevented) return;
    
    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <>
      <a href={href} onClick={handleClick} ref={ref} {...props}>
        {children}
      </a>
      
      {isPending && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-all">
          <LogoSpinner className="h-24 w-24" />
          {loadingText && (
            <p className="mt-6 text-sm font-medium tracking-wide text-zinc-300 animate-pulse">
              {loadingText}
            </p>
          )}
        </div>
      )}
    </>
  );
});

AnimatedLink.displayName = "AnimatedLink";
