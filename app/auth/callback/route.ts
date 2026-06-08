import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase?.auth.exchangeCodeForSession(code);

    const next = requestUrl.searchParams.get("next");
    if (next) {
      return NextResponse.redirect(new URL(next, request.url));
    }

    // Check if the user is an admin to redirect accordingly
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }
    }
  }

  const nextFallback = requestUrl.searchParams.get("next");
  if (nextFallback) {
    return NextResponse.redirect(new URL(nextFallback, request.url));
  }

  return NextResponse.redirect(new URL("/", request.url));
}
