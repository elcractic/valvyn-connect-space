import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Hash, Send, Smile, Paperclip, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import Message from "@/components/Message";

interface ChannelViewProps {
  channelId: string;
  userId: string;
}

const ChannelView = ({ channelId, userId }: ChannelViewProps) => {
  const [channel, setChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadChannel();
    loadMessages();

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  const loadChannel = async () => {
    const { data } = await supabase
      .from("channels")
      .select("*")
      .eq("id", channelId)
      .single();

    if (data) setChannel(data);
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select(`
        *,
        profiles:author_id (username, avatar_url)
      `)
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          channel_id: channelId,
          author_id: userId,
          content: message.trim(),
        });

      if (error) throw error;

      setMessage("");
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Channel Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-border glass">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold text-foreground">{channel?.name || "Loading..."}</span>
        </div>
        <Button variant="ghost" size="icon">
          <Users className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-4 space-y-4">
          {messages.map((msg) => (
            <Message
              key={msg.id}
              author={msg.profiles?.username || "Unknown"}
              content={msg.content}
              timestamp={new Date(msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              avatar={msg.profiles?.avatar_url || msg.profiles?.username?.[0] || "?"}
            />
          ))}
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border glass">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={`Message #${channel?.name || "channel"}`}
              className="bg-background/50 border-border/50 focus:border-primary pr-20"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </div>
          <Button
            onClick={handleSend}
            className="bg-gradient-primary hover:shadow-glow transition-all"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChannelView;
