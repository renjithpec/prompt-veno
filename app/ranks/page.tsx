import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LeaderboardClient } from "./leaderboard-client";

export const dynamic = "force-dynamic";

export default async function RanksPage() {
  const supabase = await createSupabaseServerClient();
  let currentUserId: string | null = null;
  let topUsers: any[] = [];
  
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      currentUserId = user.id;
    }

    const { data } = await supabase
      .from('profiles')
      .select('id, name, avatar, coins')
      .order('coins', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(100);
      
    if (data) {
      topUsers = data;
    }
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl md:text-5xl font-black uppercase tracking-widest text-foreground">
            Leaderboard
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Top Prompt Creators & Contributors</p>
        </div>

        <LeaderboardClient initialUsers={topUsers} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
