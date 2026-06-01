import { Copy, Database, Eye, Layers } from "lucide-react";
import { getAdminStats } from "@/lib/data";

export default async function AdminPage() {
  const stats = await getAdminStats();
  const cards = [
    { label: "Prompts", value: stats.promptCount, icon: Database },
    { label: "Views", value: stats.views.toLocaleString(), icon: Eye },
    { label: "Copies", value: stats.copies.toLocaleString(), icon: Copy },
    { label: "Categories", value: stats.categories, icon: Layers }
  ];

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="glass rounded-card p-5">
            <card.icon className="h-5 w-5 text-accent" />
            <div className="mt-4 text-3xl font-black">{card.value}</div>
            <div className="text-sm text-zinc-400">{card.label}</div>
          </div>
        ))}
      </div>
      <div className="glass rounded-card p-5">
        <h2 className="text-xl font-bold">Popular Prompts</h2>
        <div className="mt-4 grid gap-3">
          {stats.topPrompts.map((prompt) => (
            <div key={prompt.id} className="flex items-center justify-between gap-4 rounded-card border border-white/10 p-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{prompt.title}</p>
                <p className="text-sm text-zinc-400">{prompt.category?.name}</p>
              </div>
              <p className="shrink-0 text-sm text-accent">{(prompt.views + prompt.copies).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
