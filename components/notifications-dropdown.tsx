"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { markNotificationsAsRead } from "@/app/actions/user";
import type { Notification } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function NotificationsDropdown({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialNotifications.filter(n => !n.is_read).length);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) return;

    // We need the user's ID to filter real-time events
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotif = payload.new as Notification;
            
            // Fetch actor details
            supabase.from('profiles').select('name, avatar').eq('id', newNotif.actor_id).single().then(({ data: actorData }) => {
              if (actorData) {
                newNotif.actor = actorData;
              }
              
              if (newNotif.prompt_id) {
                supabase.from('prompts').select('title, slug').eq('id', newNotif.prompt_id).single().then(({ data: promptData }) => {
                   if (promptData) {
                     newNotif.prompt = promptData;
                   }
                   setNotifications(prev => [newNotif, ...prev].slice(0, 50));
                   setUnreadCount(prev => prev + 1);
                });
              } else if (newNotif.message_id) {
                supabase.from('public_messages').select('content').eq('id', newNotif.message_id).single().then(({ data: msgData }) => {
                   if (msgData) {
                     newNotif.message = msgData;
                   }
                   setNotifications(prev => [newNotif, ...prev].slice(0, 50));
                   setUnreadCount(prev => prev + 1);
                });
              } else {
                setNotifications(prev => [newNotif, ...prev].slice(0, 50));
                setUnreadCount(prev => prev + 1);
              }
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, [supabase]);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      await markNotificationsAsRead();
    }
  };

  const getNotificationText = (notification: Notification) => {
    const actorName = notification.actor?.name || (notification.actor_id ? "Someone" : "A guest");
    if (notification.type === 'like') {
      return <span><b>{actorName}</b> liked your prompt <i>{notification.prompt?.title}</i></span>;
    }
    if (notification.type === 'follow') {
      return <span><b>{actorName}</b> started following you</span>;
    }
    if (notification.type === 'new_post') {
      return <span><b>{actorName}</b> published a new prompt: <i>{notification.prompt?.title}</i></span>;
    }
    if (notification.type === 'announcement') {
      return <span><b>{actorName}</b> posted an announcement: <i className="text-muted-foreground">{notification.message?.content}</i></span>;
    }
    if (notification.type === 'save') {
      return <span><b>{actorName}</b> saved your prompt: <i>{notification.prompt?.title}</i></span>;
    }
    if (notification.type === 'share') {
      return <span><b>{actorName}</b> shared your prompt: <i>{notification.prompt?.title}</i></span>;
    }
    if (notification.type === 'copy') {
      return <span><b>{actorName}</b> copied your prompt: <i>{notification.prompt?.title}</i></span>;
    }
    if (notification.type === 'pending_approval') {
      return <span className="text-accent"><b>{actorName}</b> submitted a new prompt for approval: <i>{notification.prompt?.title}</i></span>;
    }
    return <span>New notification</span>;
  };

  const getNotificationLink = (notification: Notification) => {
    if (notification.type === 'like' || notification.type === 'new_post' || notification.type === 'save' || notification.type === 'share' || notification.type === 'copy') {
      return notification.prompt?.slug ? `/prompt/${notification.prompt.slug}` : '#';
    }
    if (notification.type === 'follow') {
      return `/user/${notification.actor_id}`;
    }
    if (notification.type === 'announcement') {
      return `/messages`;
    }
    if (notification.type === 'pending_approval') {
      return `/admin`;
    }
    return '#';
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger className="relative p-2 rounded-full hover:bg-foreground/5 transition-colors focus:outline-none focus:ring-2 focus:ring-accent">
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 border-border bg-panel">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-bold text-sm text-foreground">Notifications</h3>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              You don&apos;t have any notifications yet.
            </div>
          ) : (
            notifications.map((notification) => {
              const isHighPriority = notification.type === 'pending_approval';
              
              return (
              <DropdownMenuItem key={notification.id} asChild className={cn(
                "p-4 cursor-pointer flex items-start gap-3 border-b border-border/50 last:border-0 rounded-none focus:bg-foreground/5",
                !notification.is_read && "bg-foreground/[0.02]",
                isHighPriority && "bg-accent/10 border-accent/20 focus:bg-accent/20"
              )}>
                <Link href={getNotificationLink(notification)}>
                  <div className={cn(
                    "relative h-10 w-10 shrink-0 overflow-hidden rounded-full",
                    isHighPriority ? "bg-accent text-black" : "bg-foreground/10"
                  )}>
                    {notification.actor?.avatar ? (
                      <Image src={notification.actor.avatar} alt="Avatar" fill className="object-cover" />
                    ) : (
                      <div className={cn(
                        "flex h-full w-full items-center justify-center text-xs font-bold",
                        isHighPriority ? "bg-accent text-black" : "bg-accent text-black"
                      )}>
                        {(notification.actor?.name || (notification.actor_id ? "U" : "G"))[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      "text-sm leading-tight",
                      isHighPriority ? "text-accent font-medium" : "text-foreground"
                    )}>
                      {getNotificationText(notification)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className={cn(
                      "h-2 w-2 shrink-0 rounded-full mt-1.5",
                      isHighPriority ? "bg-accent animate-pulse shadow-[0_0_8px_rgba(212,255,58,1)]" : "bg-accent"
                    )} />
                  )}
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
