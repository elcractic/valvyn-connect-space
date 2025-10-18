import { Hash, Volume2, Plus, Settings, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface NexusSidebarProps {
  onChannelSelect: (channel: string) => void;
  selectedChannel: string;
}

const NexusSidebar = ({ onChannelSelect, selectedChannel }: NexusSidebarProps) => {
  const textChannels = [
    { id: "general", name: "general", icon: Hash },
    { id: "announcements", name: "announcements", icon: Hash },
    { id: "random", name: "random", icon: Hash },
  ];

  const voiceChannels = [
    { id: "lounge", name: "Lounge", icon: Volume2 },
    { id: "gaming", name: "Gaming", icon: Volume2 },
  ];

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
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Channels */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-3 space-y-4">
          {/* Text Channels */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Streams
              </span>
              <Button variant="ghost" size="icon" className="h-4 w-4">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            {textChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onChannelSelect(channel.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                  selectedChannel === channel.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <channel.icon className="h-4 w-4" />
                <span className="text-sm">{channel.name}</span>
              </button>
            ))}
          </div>

          <Separator className="bg-sidebar-border" />

          {/* Voice Channels */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Waves
              </span>
              <Button variant="ghost" size="icon" className="h-4 w-4">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            {voiceChannels.map((channel) => (
              <button
                key={channel.id}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
              >
                <channel.icon className="h-4 w-4" />
                <span className="text-sm">{channel.name}</span>
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* User Panel */}
      <div className="h-14 px-3 flex items-center gap-2 border-t border-sidebar-border glass">
        <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center">
          <Users className="w-4 h-4 text-accent-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-sidebar-foreground truncate">
            Username
          </div>
          <div className="text-xs text-muted-foreground">#1234</div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default NexusSidebar;
