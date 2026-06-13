"use client";

import { Hash } from "lucide-react";
import { motion } from "framer-motion";

interface Community {
  id: string;
  name: string;
  description: string;
}

interface ChatSidebarProps {
  communities: Community[];
  activeRoom: Community;
  onSelectRoom: (room: Community) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function ChatSidebar({ communities, activeRoom, onSelectRoom, isOpen, onClose }: ChatSidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={onClose} 
        />
      )}
      
      <div className={`
        fixed inset-y-0 left-0 z-50 w-[280px] bg-background border-r border-border/50 transform transition-transform duration-300 flex flex-col shrink-0 h-full
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0
      `}>
      <div className="p-4 border-b border-border/50">
        <h2 className="font-display text-xl font-black uppercase tracking-widest">Communities</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {communities.map((room) => {
          const isActive = activeRoom.id === room.id;
          return (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-left relative ${
                isActive 
                  ? "bg-foreground text-background shadow-lg" 
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${isActive ? 'bg-background/20' : 'bg-foreground/5'}`}>
                <Hash className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{room.name}</div>
                <div className={`text-xs truncate ${isActive ? 'text-background/70' : 'text-muted-foreground/70'}`}>
                  {room.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
    </>
  );
}
