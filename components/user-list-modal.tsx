"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User as UserIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ProfileListItem = {
  id: string;
  name: string | null;
  avatar: string | null;
  instagram_url: string | null;
};

type UserListModalProps = {
  title: string;
  count: number;
  label: string;
  users: ProfileListItem[];
};

export function UserListModal({ title, count, label, users }: UserListModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-center sm:text-left transition-transform hover:scale-105 active:scale-95 group focus:outline-none">
          <div className="text-xl font-bold text-white group-hover:text-accent transition-colors">{count}</div>
          <div className="text-sm text-zinc-400 group-hover:text-zinc-300">{label}</div>
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-sm sm:max-w-md border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl p-0 overflow-hidden">
        <DialogHeader className="border-b border-white/10 px-6 py-4">
          <DialogTitle className="text-center text-white">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto px-6 py-2 no-scrollbar">
          {users.length === 0 ? (
            <div className="py-8 text-center text-zinc-500">
              No {label} yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between gap-3">
                  <Link 
                    href={`/user/${user.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex flex-1 items-center gap-3 overflow-hidden group/user"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-black/50 transition-colors group-hover/user:border-accent/50">
                      {user.avatar ? (
                        <Image src={user.avatar} alt={user.name || "User"} fill className="object-cover" />
                      ) : (
                        <UserIcon className="h-full w-full p-3 text-zinc-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white group-hover/user:text-accent transition-colors">
                        {user.name || "Anonymous"}
                      </p>
                    </div>
                  </Link>
                  
                  {/* Keep the follow button out of the link if we want them to follow directly from the list later */}
                  <Link
                    href={`/user/${user.id}`}
                    onClick={() => setIsOpen(false)}
                    className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
