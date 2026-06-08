"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";

export default function ResetPasswordPage() {
  const [state, formAction] = useActionState(resetPassword, null);

  return (
    <section className="mx-auto grid min-h-[calc(100svh-64px)] max-w-md content-center px-4 py-12">
      <div className="glass overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
        <h1 className="text-2xl font-black mb-2">Reset Password</h1>
        <p className="text-sm text-zinc-400 mb-6">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        {state?.success && (
          <div className="mb-6 rounded-card border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-200">
            {state.message}
          </div>
        )}

        {state?.error && (
          <div className="mb-6 rounded-card border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {state.error}
          </div>
        )}

        {!state?.success && (
          <form action={formAction} className="grid gap-4">
            <Input name="email" type="email" autoComplete="email" placeholder="Email address" required />
            <SubmitButton loadingText="Sending link...">Send Reset Link</SubmitButton>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          <Link href="/login" className="font-semibold text-zinc-400 hover:text-white transition-colors">
            Back to sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
