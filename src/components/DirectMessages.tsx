import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface DirectMessagesProps {
  userId: string;
  selectedDM: string | null;
  onSelectDM: (userId: string) => void;
}

const DirectMessages = ({ userId, selectedDM, onSelectDM }: DirectMessagesProps) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFriends();
  }, [userId]);

  useEffect(() => {
    if (selectedDM) {
      loadMessages();

      const channel = supabase
        .channel(`dm-${userId}-${selectedDM}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "direct_messages" },
          () => {
            loadMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedDM, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadFriends = async () => {
    const { data } = await supabase
      .from("friendships")
      .select("*, friend:friend_id(id, username, tag, status, avatar_url)")
      .eq("user_id", userId)
      .eq("status", "accepted");

    if (data) setFriends(data);
  };

  const loadMessages = async () => {
    if (!selectedDM) return;

    const { data } = await supabase
      .from("direct_messages")
      .select("*, sender:sender_id(username, tag, avatar_url)")
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${selectedDM}),and(sender_id.eq.${selectedDM},receiver_id.eq.${userId})`)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedDM) return;

    const { error } = await supabase.from("direct_messages").insert({
      sender_id: userId,
      receiver_id: selectedDM,
      content: newMessage,
    });

    if (error) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNewMessage("");
    }
  };

  const selectedFriend = friends.find((f) => f.friend.id === selectedDM)?.friend;

  return (
    <div className="flex-1 flex">
      {/* DM List */}
      <div className="w-60 border-r border-border glass flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Direct Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {friends.map((friendship) => (
            <button
              key={friendship.id}
              onClick={() => onSelectDM(friendship.friend.id)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors ${
                selectedDM === friendship.friend.id ? "bg-muted/50" : ""
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center">
                  <span className="font-semibold text-sm">
                    {friendship.friend.username[0].toUpperCase()}
                  </span>
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                    friendship.friend.status === "online"
                      ? "bg-green-500"
                      : "bg-gray-500"
                  }`}
                />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{friendship.friend.username}</div>
                <div className="text-xs text-muted-foreground">
                  {friendship.friend.status}
                </div>
              </div>
            </button>
          ))}
          {friends.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No friends yet. Add friends to start chatting!
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedDM && selectedFriend ? (
        <div className="flex-1 flex flex-col">
          <div className="h-14 px-4 flex items-center border-b border-border glass">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center">
                <span className="font-semibold text-sm">
                  {selectedFriend.username[0].toUpperCase()}
                </span>
              </div>
              <div className="font-semibold">
                {selectedFriend.username}#{selectedFriend.tag}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold">
                      {msg.sender.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold">{msg.sender.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(msg.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-foreground mt-1">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="p-4 border-t border-border glass">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={`Message ${selectedFriend.username}`}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                className="bg-gradient-primary hover:shadow-glow"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Select a friend to start messaging
        </div>
      )}
    </div>
  );
};

export default DirectMessages;
