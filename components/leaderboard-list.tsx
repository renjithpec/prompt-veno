"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface ListUser {
  id: string;
  name: string;
  avatar: string | null;
  coins: number;
}

interface LeaderboardListProps {
  users: ListUser[];
  startRank?: number;
  currentUserId?: string | null;
}

export function LeaderboardList({ users, startRank = 4, currentUserId }: LeaderboardListProps) {
  const getAvatarUrl = (avatar: string | null) => {
    if (!avatar) return "/default-avatar.png";
    if (avatar.startsWith('http')) return avatar;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatar}`;
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-2xl mx-auto pb-12">
      {/* Table Header */}
      <div className="flex items-center justify-between px-6 py-2 text-sm font-bold text-muted-foreground uppercase tracking-widest font-display">
        <span className="w-12 text-center">Rank</span>
        <span className="flex-1 text-left ml-4">Player</span>
        <span className="text-right">Points</span>
      </div>

      {/* List */}
      {users.map((user, index) => {
        const rank = startRank + index;
        const isMe = currentUserId === user.id;

        return (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl transition-all ${
              isMe 
                ? "bg-foreground/[0.08] border border-accent/30 shadow-[0_0_15px_rgba(214,255,127,0.1)]" 
                : "bg-panel hover:bg-foreground/[0.04]"
            }`}
          >
            <div className="w-12 text-center font-display font-black text-lg text-muted-foreground">
              {rank}
            </div>
            
            <div className="flex-1 flex items-center gap-4 ml-4 min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-foreground/10 shrink-0 flex items-center justify-center">
                {user.avatar ? (
                  <Image src={getAvatarUrl(user.avatar)} alt={user.name} width={40} height={40} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">{(user.name || 'U').charAt(0)}</span>
                )}
              </div>
              <div className="truncate pr-4">
                <span className={`font-display font-bold text-sm sm:text-base ${isMe ? 'text-accent' : 'text-foreground'}`}>
                  {user.name || 'Anonymous'} {isMe && "(You)"}
                </span>
              </div>
            </div>

            <div className="text-right flex items-center justify-end gap-1.5 font-bold font-display text-sm sm:text-base">
              <Image src="/coin-asset.png" alt="Coins" width={16} height={16} className="w-4 h-4 drop-shadow-[0_0_8px_rgba(212,255,58,0.4)]" />
              {user.coins.toLocaleString()}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
