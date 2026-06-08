"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";
import { LogoSpinner } from "@/components/logo-spinner";

/**
 * A form submit button that automatically shows the PV logo spinner
 * while the form action is pending. Drop-in replacement for <Button type="submit">.
 *
 * Uses React 19's useFormStatus() — must be inside a <form>.
 */
export function SubmitButton({
  children,
  loadingText,
  ...props
}: ButtonProps & { loadingText?: string }) {
  const { pending } = useFormStatus();

  return (
    <>
      <Button type="submit" disabled={pending} {...props}>
        {children}
      </Button>

      {/* Full-screen centered loading overlay */}
      {pending && (
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
}
