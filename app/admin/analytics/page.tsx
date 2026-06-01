import { getAdminStats } from "@/lib/data";

export default async function AnalyticsPage() {
  const stats = await getAdminStats();
  const max = Math.max(...stats.topPrompts.map((prompt) => prompt.views + prompt.copies), 1);

  return (
    <div className="glass rounded-card p-5">
      <h2 className="text-xl font-bold">Analytics</h2>
      <p className="mt-2 text-sm text-zinc-400">Popular prompts and copy behavior update from Supabase metrics.</p>
      <div className="mt-6 grid gap-4">
        {stats.topPrompts.map((prompt) => {
          const total = prompt.views + prompt.copies;
          return (
            <div key={prompt.id}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-zinc-200">{prompt.title}</span>
                <span className="shrink-0 text-accent">{total.toLocaleString()}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/[0.08]">
                <div className="h-full rounded-full bg-accent" style={{ width: `${(total / max) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
