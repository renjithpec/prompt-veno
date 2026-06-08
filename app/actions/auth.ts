"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeError } from "@/lib/safe-action";

// --- Input Validation Schemas ---

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(254, "Email is too long")
  .email("Please enter a valid email address");

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(72, "Password must be at most 72 characters");

const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
  email: emailSchema,
  password: passwordSchema
});

// --- Rate Limiting Helper ---

function checkAuthRateLimit(ip: string): void {
  const { allowed } = rateLimit(ip, 5, 60_000, "auth");
  if (!allowed) {
    redirect("/login?error=Too%20many%20attempts.%20Please%20wait%20a%20minute%20and%20try%20again.");
  }
}

// --- Auth Actions ---

export async function signInWithGoogle() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");

  try {
    const reqHeaders = await headers();
    const host = reqHeaders.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.match(/^\d{1,3}\.\d{1,3}/) ? "http" : "https";
    const origin = `${protocol}://${host}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`
      }
    });
    if (error || !data.url) redirect(`/login?error=${encodeURIComponent("Unable to start Google login")}`);
    redirect(data.url);
  } catch (error: unknown) {
    // Re-throw redirects (Next.js uses thrown redirects internally)
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("[signInWithGoogle]", error);
    redirect("/login?error=Something%20went%20wrong.%20Please%20try%20again.");
  }
}

export async function signInWithEmail(formData: FormData) {
  // Rate limit by IP
  const headerStore = await headers();
  const ip = getClientIp(headerStore);
  checkAuthRateLimit(ip);

  // Validate input
  const result = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!result.success) {
    const message = sanitizeError(result.error, "signInWithEmail:validation");
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }

  const { email, password } = result.data;
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");

  // Temporary delay to let you see the loading animation!
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Generic message — don't reveal whether email exists
      console.error("[signInWithEmail] Auth error:", error.message);
      redirect("/login?error=Invalid%20email%20or%20password");
    }

    // Check if user is admin to redirect accordingly
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role === "admin") redirect("/admin");
    }
    redirect("/");
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("[signInWithEmail]", error);
    redirect("/login?error=Something%20went%20wrong.%20Please%20try%20again.");
  }
}

export async function signUpWithEmail(formData: FormData) {
  // Rate limit by IP
  const headerStore = await headers();
  const ip = getClientIp(headerStore);
  checkAuthRateLimit(ip);

  // Validate input
  const result = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!result.success) {
    const message = sanitizeError(result.error, "signUpWithEmail:validation");
    redirect(`/login?mode=signup&error=${encodeURIComponent(message)}`);
  }

  const { name, email, password } = result.data;
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`
      }
    });

    if (error) {
      console.error("[signUpWithEmail] Auth error:", error.message);
      redirect(`/login?mode=signup&error=${encodeURIComponent("Unable to create account. Please try again.")}`);
    }
    redirect("/login?success=Check%20your%20email%20to%20confirm%20your%20account");
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("[signUpWithEmail]", error);
    redirect("/login?mode=signup&error=Something%20went%20wrong.%20Please%20try%20again.");
  }
}

export async function signOut() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase?.auth.signOut();
  } catch (error) {
    console.error("[signOut]", error);
  }
  redirect("/");
}
