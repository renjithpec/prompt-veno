import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function ensureAdmin() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { configured: false, role: "admin" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (data?.role !== "admin") redirect("/");
  return { configured: true, role: data.role };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const state = await ensureAdmin();

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {!state.configured && (
        <div className="mb-4 rounded-card border border-accent/20 bg-accent/10 p-3 text-sm text-accent">
          Supabase is not configured yet, so admin pages are shown in preview mode. Add environment variables to enforce authentication.
        </div>
      )}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-accent">Admin</p>
          <h1 className="text-3xl font-black">Prompt Veno Dashboard</h1>
        </div>
        <nav className="flex max-w-full gap-2 overflow-x-auto no-scrollbar">
          {[
            ["/admin", "Overview"],
            ["/admin/prompts", "Prompts"],
            ["/admin/categories", "Categories"],
            ["/admin/tags", "Tags"],
            ["/admin/settings", "Settings"],
            ["/admin/analytics", "Analytics"]
          ].map(([href, label]) => <Button key={href} asChild variant="secondary" size="sm"><Link href={href}>{label}</Link></Button>)}
          <form action={signOut}><Button variant="ghost" size="sm">Sign out</Button></form>
        </nav>
      </div>
      {children}
    </section>
  );
}
