"use client";

import { useState } from "react";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatWindow } from "@/components/chat-window";

const COMMUNITIES = [
  { id: "general", name: "General", description: "General discussion for everyone" },
  { id: "feedback", name: "Feedback", description: "Share your thoughts and ideas" },
  { id: "announcements", name: "Announcements", description: "Updates from the team" }
];

export default function MessagesPage() {
  const [activeRoom, setActiveRoom] = useState(COMMUNITIES[0]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-5rem)] md:h-screen w-full bg-background overflow-hidden relative">
      <ChatSidebar 
        communities={COMMUNITIES} 
        activeRoom={activeRoom} 
        onSelectRoom={(room) => {
          setActiveRoom(room);
          setIsMobileSidebarOpen(false);
        }} 
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <main className="flex-1 flex flex-col min-w-0 bg-panel border-l border-border/50">
        <ChatWindow room={activeRoom} onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
      </main>
    </div>
  );
}
