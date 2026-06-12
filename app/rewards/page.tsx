import { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Rewards",
  description: "View your earned coins and transaction history."
};

export default async function RewardsPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch coins and transactions
  const { data: profile } = await supabase
    .from("profiles")
    .select("coins")
    .eq("id", user.id)
    .single();

  const { data: transactions } = await supabase
    .from("coin_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const coins = profile?.coins || 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 flex flex-col items-center justify-between gap-6 rounded-[32px] border border-border bg-panel p-8 sm:flex-row sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center sm:items-start">
          <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl">Your Rewards</h1>
          <p className="mt-2 text-muted-foreground text-center sm:text-left max-w-md">
            Earn coins by contributing high-quality prompts to the community. Build your balance to unlock exclusive perks!
          </p>
        </div>
        
        <div className="relative z-10 flex flex-col items-center rounded-3xl border border-accent/20 bg-black/40 p-6 backdrop-blur-md shadow-[0_0_40px_rgba(212,255,58,0.15)]">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Total Balance</span>
          <div className="flex items-center gap-3">
            <Image 
              src="/coin-asset.png" 
              alt="Coins" 
              width={48} 
              height={48} 
              className="h-12 w-12 drop-shadow-[0_0_15px_rgba(212,255,58,0.5)]" 
            />
            <span className="font-display text-5xl font-black text-accent">{coins}</span>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-border bg-panel/50 p-6 sm:p-8 backdrop-blur-md">
        <h2 className="mb-6 font-display text-2xl font-black uppercase tracking-tight">Transaction History</h2>
        
        {(!transactions || transactions.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-xl">
            <Image src="/coin-asset.png" alt="No transactions" width={64} height={64} className="opacity-20 mb-4 grayscale" />
            <p className="text-muted-foreground">You haven't earned any coins yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Submit your first prompt to start earning!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="flex items-center justify-between rounded-xl border border-border bg-background/50 p-4 transition hover:bg-foreground/[0.02]"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-foreground">{tx.reason}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString(undefined, { 
                      year: 'numeric', month: 'short', day: 'numeric', 
                      hour: '2-digit', minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 border border-accent/20">
                  <span className="font-bold text-accent">+{tx.amount}</span>
                  <Image src="/coin-asset.png" alt="coin" width={16} height={16} className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
