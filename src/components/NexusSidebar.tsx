import { useState } from "react";
import { Hash, Volume2, Plus, Settings, Sparkles, Mic, Headphones, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NexusSidebarProps {
  onChannelSelect: (channel: string) => void;
  selectedChannel: string;
}

const NexusSidebar = ({ onChannelSelect, selectedChannel }: NexusSidebarProps) => {
  const [userStatus, setUserStatus] = useState<"online" | "idle" | "dnd" | "invisible">("online");
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  const textChannels = [
    { id: "general", name: "general", icon: Hash },
    { id: "announcements", name: "announcements", icon: Hash },
    { id: "random", name: "random", icon: Hash },
  ];

  const voiceChannels = [
    { id: "lounge", name: "Lounge", icon: Volume2 },
    { id: "gaming", name: "Gaming", icon: Volume2 },
  ];

  const statusColors = {
    online: "bg-green-500",
    idle: "bg-yellow-500",
    dnd: "bg-red-500",
    invisible: "bg-gray-500",
  };

  const statusLabels = {
    online: "Online",
    idle: "Idle",
    dnd: "Do Not Disturb",
    invisible: "Invisible",
  };

  return (
    <div className="w-60 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Nexus Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-sidebar-border glass">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground">My Nexus</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-sidebar-accent">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Channels */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-3 space-y-4">
          {/* Text Channels */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Streams
              </span>
              <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-sidebar-accent">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            {textChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onChannelSelect(channel.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all ${
                  selectedChannel === channel.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <channel.icon className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm truncate">{channel.name}</span>
              </button>
            ))}
          </div>

          <Separator className="bg-sidebar-border" />

          {/* Voice Channels */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Waves
              </span>
              <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-sidebar-accent">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            {voiceChannels.map((channel) => (
              <button
                key={channel.id}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all"
              >
                <channel.icon className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm truncate">{channel.name}</span>
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* User Panel - Discord Style */}
      <div className="h-[52px] px-2 flex items-center gap-2 border-t border-sidebar-border bg-sidebar/95 glass">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 flex-1 min-w-0 px-1 py-1 rounded hover:bg-sidebar-accent/50 transition-all group">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center">
                  <span className="text-sm font-semibold text-accent-foreground">E</span>
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusColors[userStatus]} rounded-full border-2 border-sidebar`} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-semibold text-sidebar-foreground truncate">
                  elcractic
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {statusLabels[userStatus]}
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass">
            <DropdownMenuLabel>Set Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setUserStatus("online")} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Online
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setUserStatus("idle")} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                Idle
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setUserStatus("dnd")} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                Do Not Disturb
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setUserStatus("invisible")} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500" />
                Invisible
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isMuted ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setIsMuted(!isMuted)}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isDeafened ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setIsDeafened(!isDeafened)}
          >
            <Headphones className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Cog className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NexusSidebar;
