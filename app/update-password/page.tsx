"use client";

import { useActionState, useEffect } from "react";
import { updatePassword } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const [state, formAction] = useActionState(updatePassword, null);

  useEffect(() => {
    // Initialize client-side Supabase to parse the URL hash fragment
    // (access_token, refresh_token) and establish the session cookies automatically.
    createSupabaseBrowserClient();
  }, []);

  return (
    <section className="mx-auto grid min-h-[calc(100svh-64px)] max-w-md content-center px-4 py-12">
      <div className="glass overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
        <h1 className="text-2xl font-black mb-2">Create New Password</h1>
        <p className="text-sm text-zinc-400 mb-6">
          Please enter your new password below.
        </p>

        {state?.error && (
          <div className="mb-6 rounded-card border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {state.error}
          </div>
        )}

        <form action={formAction} className="grid gap-4">
          <Input name="password" type="password" autoComplete="new-password" placeholder="New password (min 6 chars)" required minLength={6} />
          <SubmitButton loadingText="Updating...">Update Password</SubmitButton>
        </form>
      </div>
    </section>
  );
}
