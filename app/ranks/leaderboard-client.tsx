"use client";

import { useState } from "react";
import { TopThreePodium } from "@/components/top-three-podium";
import { LeaderboardList } from "@/components/leaderboard-list";

interface UserProfile {
  id: string;
  name: string;
  avatar: string | null;
  coins: number;
}

interface LeaderboardClientProps {
  initialUsers: UserProfile[];
  currentUserId: string | null;
}

export function LeaderboardClient({ initialUsers, currentUserId }: LeaderboardClientProps) {
  const [activeTab, setActiveTab] = useState<"daily" | "monthly" | "allTime">("allTime");

  // Since we only have all-time data for now, we'll use the initialUsers for all tabs.
  // In the future, this component can fetch daily/monthly data when tabs change.
  const displayedUsers = initialUsers;
  
  const topThree = displayedUsers.slice(0, 3);
  const restList = displayedUsers.slice(3);

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex justify-center mb-12">
        <div className="flex bg-panel rounded-full p-1 shadow-inner border border-border/50">
          {(["daily", "monthly", "allTime"] as const).map((tab) => {
            const labels = {
              daily: "Daily",
              monthly: "Monthly",
              allTime: "All Time"
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-full font-display font-bold text-sm transition-all ${
                  activeTab === tab 
                    ? "bg-accent text-black shadow-md" 
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Podium */}
      {topThree.length > 0 && (
        <TopThreePodium users={topThree} />
      )}

      {/* List */}
      {restList.length > 0 ? (
        <LeaderboardList users={restList} currentUserId={currentUserId} startRank={4} />
      ) : (
        <div className="text-center py-10 text-muted-foreground font-medium">
          {displayedUsers.length === 0 ? "No users found on the leaderboard." : "No more users to display."}
        </div>
      )}
    </div>
  );
}
