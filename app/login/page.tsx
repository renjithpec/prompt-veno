import { signInWithEmail, signInWithGoogle } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <section className="mx-auto grid min-h-[calc(100svh-64px)] max-w-md content-center px-4 py-12">
      <div className="glass rounded-card p-5">
        <h1 className="text-3xl font-black">Login</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">Sign in to manage prompts, settings, categories, tags, and analytics.</p>
        {params.error && <p className="mt-4 rounded-card border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">{params.error}</p>}
        <form action={signInWithEmail} className="mt-5 grid gap-3">
          <Input name="email" type="email" autoComplete="email" placeholder="Email" required />
          <Input name="password" type="password" autoComplete="current-password" placeholder="Password" required />
          <Button type="submit">Login</Button>
        </form>
        <form action={signInWithGoogle} className="mt-3">
          <Button type="submit" variant="secondary" className="w-full">Continue with Google</Button>
        </form>
      </div>
    </section>
  );
}
