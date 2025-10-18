import { useState } from "react";
import { Hash, Send, Smile, Paperclip, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Message from "@/components/Message";

interface ChannelViewProps {
  channelName: string;
}

const ChannelView = ({ channelName }: ChannelViewProps) => {
  const [message, setMessage] = useState("");

  const mockMessages = [
    {
      id: 1,
      author: "Alice",
      content: "Hey everyone! Welcome to Valvyn 🎉",
      timestamp: "2:30 PM",
      avatar: "A",
    },
    {
      id: 2,
      author: "Bob",
      content: "This looks amazing! Love the design",
      timestamp: "2:32 PM",
      avatar: "B",
    },
    {
      id: 3,
      author: "Charlie",
      content: "The glassmorphism effects are 🔥",
      timestamp: "2:35 PM",
      avatar: "C",
    },
  ];

  const handleSend = () => {
    if (message.trim()) {
      // In real app, would send message
      setMessage("");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Channel Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-border glass">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold text-foreground">{channelName}</span>
        </div>
        <Button variant="ghost" size="icon">
          <Users className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-4 space-y-4">
          {mockMessages.map((msg) => (
            <Message key={msg.id} {...msg} />
          ))}
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
              placeholder={`Message #${channelName}`}
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
