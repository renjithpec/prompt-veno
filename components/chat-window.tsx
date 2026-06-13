"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Hash, Loader2, Trash2, Pencil, X, Check, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { rewardForChat } from "@/app/actions/rewards";
import { format } from "date-fns";

interface Community {
  id: string;
  name: string;
  description: string;
}

interface Profile {
  name: string | null;
  avatar: string | null;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  is_edited?: boolean;
  profiles?: Profile | Profile[];
}

export function ChatWindow({ room, onOpenSidebar }: { room: Community, onOpenSidebar?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [showTerms, setShowTerms] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    let supabase: any;
    let channel: any;

    const setupChat = async () => {
      setLoading(true);
      setMessages([]);
      const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
      supabase = createSupabaseBrowserClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase.from('profiles').select('name, avatar').eq('id', user.id).single();
        if (profile) setUserProfile(profile);
      }

      // Fetch existing messages
      const { data: initialMessages, error } = await supabase
        .from('public_messages')
        .select(`
          id,
          content,
          created_at,
          user_id,
          is_edited,
          profiles:user_id (name, avatar)
        `)
        .eq('room_id', room.id)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error("Fetch error:", error);
        toast.error(`Database Error: ${error.message}. Please ensure all SQL migrations are run!`);
      } else if (initialMessages) {
        // Handle array wrap from supabase relation
        const formattedMessages = initialMessages.map((msg: any) => ({
          ...msg,
          profiles: Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles
        }));
        setMessages(formattedMessages);
      }
      setLoading(false);
      setTimeout(scrollToBottom, 100);

      // Subscribe to real-time updates
      const channelName = `room:${room.id}`;
      const existingChannel = supabase.getChannels().find((c: any) => c.topic === channelName);
      if (existingChannel) {
        await supabase.removeChannel(existingChannel);
      }

      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'public_messages', filter: `room_id=eq.${room.id}` },
          async (payload: any) => {
            // We need to fetch the profile for the new message because it's not joined in the realtime payload
            const newMsg = payload.new as Message;
            const { data: profileData } = await supabase
              .from('profiles')
              .select('name, avatar')
              .eq('id', newMsg.user_id)
              .single();
            
            const completeMessage = { ...newMsg, profiles: profileData || null };
            setMessages((current) => [...current, completeMessage]);
            setTimeout(scrollToBottom, 100);
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'public_messages', filter: `room_id=eq.${room.id}` },
          (payload: any) => {
            setMessages((current) => current.filter(m => m.id !== payload.old.id));
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'public_messages', filter: `room_id=eq.${room.id}` },
          (payload: any) => {
            const updatedMsg = payload.new as Message;
            setMessages((current) => current.map(m => m.id === updatedMsg.id ? { ...m, content: updatedMsg.content, is_edited: updatedMsg.is_edited } : m));
          }
        )
        .subscribe();
    };

    setupChat();

    return () => {
      if (channel) {
        supabase?.removeChannel(channel);
      }
    };
  }, [room.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    const content = newMessage.trim();
    setNewMessage("");

    const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const messageId = crypto.randomUUID();
    
    // Optimistically add the message to the UI
    const optimisticMsg: Message = {
      id: messageId,
      content,
      created_at: new Date().toISOString(),
      user_id: userId,
      is_edited: false,
      profiles: userProfile || { name: 'You', avatar: null }
    };
    
    setMessages((current) => [...current, optimisticMsg]);
    setTimeout(scrollToBottom, 10);

    const { error } = await supabase
      .from('public_messages')
      .insert([
        { id: messageId, content, room_id: room.id, user_id: userId }
      ]);
      
    if (error) {
      console.error("Error sending message:", error);
      toast.error(`Failed to send: ${error.message}`);
      setMessages(current => current.filter(m => m.id !== messageId));
    } else {
      // Reward 1 coin for participating in the chat
      rewardForChat().catch(console.error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    // Check if message is older than 60 minutes
    const msg = messages.find(m => m.id === messageId);
    if (msg) {
      const messageAgeMs = new Date().getTime() - new Date(msg.created_at).getTime();
      if (messageAgeMs >= 60 * 60 * 1000) {
        toast.error("Messages cannot be deleted after 1 hour.");
        setMessageToDelete(null);
        return;
      }
    }

    // Optimistic delete
    setMessages(current => current.filter(m => m.id !== messageId));

    const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    
    const { error } = await supabase
      .from('public_messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', userId!);
      
    if (error) {
      console.error("Error deleting message:", error);
      toast.error(`Failed to delete: ${error.message}`);
      // Revert optimistic delete could be done here if we stored the original
    }
  };

  const handleUpdateMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingContent.trim() || !editingMessageId) return;

    const content = editingContent.trim();
    const id = editingMessageId;
    
    setEditingMessageId(null);
    setEditingContent("");

    // Check if message is older than 30 minutes
    const msg = messages.find(m => m.id === id);
    if (msg) {
      const messageAgeMs = new Date().getTime() - new Date(msg.created_at).getTime();
      if (messageAgeMs >= 30 * 60 * 1000) {
        toast.error("Messages cannot be edited after 30 minutes.");
        setEditingMessageId(null);
        return;
      }
    }

    // Optimistic update
    setMessages(current => current.map(m => m.id === id ? { ...m, content, is_edited: true } : m));

    const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    
    const { error } = await supabase
      .from('public_messages')
      .update({ content, is_edited: true })
      .eq('id', id)
      .eq('user_id', userId!);
      
    if (error) {
      console.error("Error updating message:", error);
      toast.error(`Failed to edit: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative z-0">
      {/* Terms & Conditions Modal */}
      <Dialog open={showTerms} onOpenChange={(open) => {
        if (!open && agreed) {
          setShowTerms(false);
        }
      }}>
        <DialogContent className="w-[92vw] max-w-md rounded-2xl sm:max-w-md [&>button]:hidden p-6 sm:p-8" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="font-display font-black text-2xl uppercase tracking-wider text-accent flex items-center gap-2">
              Chat Zone Rules
            </DialogTitle>
            <DialogDescription className="text-base text-foreground/80 mt-2">
              Before you enter, you must agree to our community guidelines.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 text-sm font-medium">
            <div className="bg-panel p-4 rounded-xl border border-border/50 space-y-3">
              <p className="flex gap-2">
                <span className="text-accent font-bold">1.</span> 
                <span><strong>Chat respectfully.</strong> Be kind to others. Harassment, toxicity, or hate speech will result in an immediate and permanent ban.</span>
              </p>
              <p className="flex gap-2">
                <span className="text-accent font-bold">2.</span> 
                <span><strong>No spam.</strong> Do not flood the chat or share malicious links.</span>
              </p>
              <p className="flex gap-2">
                <span className="text-accent font-bold">3.</span> 
                <span><strong>Moderation active.</strong> Admins will remove users who violate these terms without warning.</span>
              </p>
            </div>
            
            <label className="flex items-center space-x-3 mt-6 p-4 border-2 border-border rounded-xl bg-panel cursor-pointer hover:border-accent/50 transition-all select-none">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${agreed ? 'bg-accent border-accent text-black' : 'border-muted-foreground'}`}>
                {agreed && <Check className="w-3.5 h-3.5" />}
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={agreed} 
                onChange={() => setAgreed(!agreed)} 
              />
              <span className="font-bold">I agree to chat respectfully</span>
            </label>
          </div>
          <DialogFooter className="sm:justify-end mt-2">
            <Button 
              type="button" 
              className="w-full sm:w-auto font-bold uppercase tracking-wider"
              disabled={!agreed}
              onClick={() => setShowTerms(false)}
            >
              Enter Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={() => setMessageToDelete(null)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={() => {
              if (messageToDelete) handleDeleteMessage(messageToDelete);
              setMessageToDelete(null);
            }}>
              Delete Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="h-20 flex items-center px-4 sm:px-6 border-b border-border/50 shrink-0 bg-background/95 backdrop-blur z-10 sticky top-0 gap-3">
        {onOpenSidebar && (
          <Button variant="ghost" size="icon" onClick={onOpenSidebar} className="lg:hidden shrink-0">
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-black shadow-[0_0_15px_rgba(214,255,127,0.3)] shrink-0">
          <Hash className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-xl font-black tracking-wide">{room.name}</h2>
          <p className="text-sm text-muted-foreground">{room.description}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Hash className="w-12 h-12 mb-4 opacity-20" />
            <p>Welcome to {room.name}!</p>
            <p className="text-sm">Be the first to say hello.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.user_id === userId;
            const profile = Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles;
            const avatarUrl = profile?.avatar 
              ? profile.avatar.startsWith('http')
                ? profile.avatar
                : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar}`
              : null;
              
            const showHeader = index === 0 || messages[index - 1].user_id !== msg.user_id;
            const messageAgeMs = new Date().getTime() - new Date(msg.created_at).getTime();
            const canEdit = isMe && messageAgeMs < 30 * 60 * 1000;
            const canDelete = isMe && messageAgeMs < 60 * 60 * 1000;

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {showHeader && (
                  <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="w-6 h-6 rounded-full bg-foreground/10 overflow-hidden shrink-0 flex items-center justify-center">
                      {avatarUrl ? (
                        <Image src={avatarUrl} alt={profile?.name || 'User'} width={24} height={24} className="object-cover w-full h-full" />
                      ) : (
                        <div className="text-[10px] font-bold">{(profile?.name || 'U').charAt(0).toUpperCase()}</div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {profile?.name || 'Anonymous'}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                <div className={`flex items-center gap-2 group w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {isMe && editingMessageId !== msg.id && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center transition-all order-1">
                      {canEdit && (
                        <button 
                          onClick={() => {
                            setEditingMessageId(msg.id);
                            setEditingContent(msg.content);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-full transition-all"
                          title="Edit message"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button 
                          onClick={() => setMessageToDelete(msg.id)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                  
                  {editingMessageId === msg.id ? (
                    <form onSubmit={handleUpdateMessage} className="flex items-center gap-2 order-2 w-full max-w-[85%]">
                      <input 
                        type="text"
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full bg-panel border-2 border-accent/50 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:border-accent"
                        autoFocus
                      />
                      <button type="button" onClick={() => setEditingMessageId(null)} className="p-2 bg-foreground/10 hover:bg-foreground/20 rounded-full">
                        <X className="w-4 h-4" />
                      </button>
                      <button type="submit" className="p-2 bg-accent text-black hover:bg-accent/80 rounded-full">
                        <Check className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <div 
                      className={`px-4 py-2.5 rounded-2xl max-w-[75%] break-words ${
                        isMe 
                          ? 'bg-accent text-black rounded-tr-sm shadow-[0_4px_14px_rgba(214,255,127,0.15)] order-2' 
                          : 'bg-panel border border-border/50 text-foreground rounded-tl-sm shadow-md'
                      }`}
                    >
                      {msg.content}
                      {msg.is_edited && (
                        <span className={`text-[10px] block mt-1 opacity-60 font-medium ${isMe ? 'text-black' : 'text-muted-foreground'}`}>
                          (edited)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background/95 backdrop-blur border-t border-border/50 shrink-0 sticky bottom-0 z-10">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={userId ? `Message #${room.name}...` : "Sign in to chat..."}
            disabled={!userId}
            className="w-full bg-panel border-2 border-border/50 rounded-full pl-6 pr-14 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!newMessage.trim() || !userId}
            className="absolute right-2 rounded-full bg-accent text-black hover:bg-accent/80 transition-all shadow-[0_0_10px_rgba(214,255,127,0.3)] disabled:opacity-50 disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
