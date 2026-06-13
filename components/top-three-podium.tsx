"use client";

import Image from "next/image";
import { Crown } from "lucide-react";
import { motion } from "framer-motion";

interface PodiumUser {
  id: string;
  name: string;
  avatar: string | null;
  coins: number;
}

interface TopThreePodiumProps {
  users: PodiumUser[];
}

export function TopThreePodium({ users }: TopThreePodiumProps) {
  // users are expected to be sorted descending.
  // [0] = 1st, [1] = 2nd, [2] = 3rd
  const first = users[0];
  const second = users[1];
  const third = users[2];

  const getAvatarUrl = (avatar: string | null) => {
    if (!avatar) return "/default-avatar.png";
    if (avatar.startsWith('http')) return avatar;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatar}`;
  };

  return (
    <div className="flex items-end justify-center gap-4 sm:gap-8 mb-6 pt-12">
      
      {/* 2nd Place */}
      {second && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="flex flex-col items-center relative z-10"
        >
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[3px] border-[#9b59b6] overflow-hidden bg-panel flex items-center justify-center">
              {second.avatar ? (
                <Image src={getAvatarUrl(second.avatar)} alt={second.name} width={96} height={96} className="object-cover w-full h-full" />
              ) : (
                <span className="text-xl font-bold">{(second.name || 'U').charAt(0)}</span>
              )}
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#9b59b6] flex items-center justify-center font-bold text-white text-xs border-2 border-background shadow-lg">
              2
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="font-display font-bold text-sm sm:text-base text-foreground truncate w-24">{second.name}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
              <Image src="/coin-asset.png" alt="Coins" width={12} height={12} className="w-3 h-3 drop-shadow-[0_0_8px_rgba(212,255,58,0.4)]" />
              {second.coins}
            </p>
          </div>
        </motion.div>
      )}

      {/* 1st Place */}
      {first && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, bounce: 0.5 }}
          className="flex flex-col items-center relative z-20 -mt-8"
        >
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute -top-10 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]"
          >
            <Crown className="w-10 h-10 fill-current" />
          </motion.div>
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-[4px] border-yellow-400 overflow-hidden bg-panel flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.3)]">
              {first.avatar ? (
                <Image src={getAvatarUrl(first.avatar)} alt={first.name} width={128} height={128} className="object-cover w-full h-full" />
              ) : (
                <span className="text-3xl font-bold">{(first.name || 'U').charAt(0)}</span>
              )}
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-400 flex items-center justify-center font-black text-black text-sm sm:text-base border-4 border-background shadow-lg">
              1
            </div>
          </div>
          <div className="mt-5 text-center">
            <p className="font-display font-black text-base sm:text-lg text-foreground truncate w-28">{first.name}</p>
            <p className="text-xs sm:text-sm text-yellow-400 flex items-center justify-center gap-1 mt-0.5 font-bold">
              <Image src="/coin-asset.png" alt="Coins" width={14} height={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-[0_0_8px_rgba(212,255,58,0.6)]" />
              {first.coins} pts
            </p>
          </div>
        </motion.div>
      )}

      {/* 3rd Place */}
      {third && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          className="flex flex-col items-center relative z-10"
        >
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[3px] border-[#3498db] overflow-hidden bg-panel flex items-center justify-center">
              {third.avatar ? (
                <Image src={getAvatarUrl(third.avatar)} alt={third.name} width={80} height={80} className="object-cover w-full h-full" />
              ) : (
                <span className="text-lg font-bold">{(third.name || 'U').charAt(0)}</span>
              )}
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#3498db] flex items-center justify-center font-bold text-white text-xs border-2 border-background shadow-lg">
              3
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="font-display font-bold text-xs sm:text-sm text-foreground truncate w-20">{third.name}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
              <Image src="/coin-asset.png" alt="Coins" width={10} height={10} className="w-2.5 h-2.5 sm:w-3 sm:h-3 drop-shadow-[0_0_8px_rgba(212,255,58,0.4)]" />
              {third.coins}
            </p>
          </div>
        </motion.div>
      )}

    </div>
  );
}
