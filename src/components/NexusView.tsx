import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Hash, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NexusSidebar from "./NexusSidebar";
import ChannelView from "./ChannelView";

interface NexusViewProps {
  nexusId: string;
  userId: string;
}

const NexusView = ({ nexusId, userId }: NexusViewProps) => {
  const [nexus, setNexus] = useState<any>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadNexus();
    loadDefaultChannel();
  }, [nexusId]);

  const loadNexus = async () => {
    const { data } = await supabase
      .from("nexuses")
      .select("*")
      .eq("id", nexusId)
      .single();

    if (data) setNexus(data);
  };

  const loadDefaultChannel = async () => {
    const { data } = await supabase
      .from("channels")
      .select("*")
      .eq("nexus_id", nexusId)
      .order("position")
      .limit(1)
      .single();

    if (data) setSelectedChannel(data.id);
  };

  if (!nexus) return null;

  return (
    <div className="flex-1 flex">
      <NexusSidebar
        nexusId={nexusId}
        userId={userId}
        onChannelSelect={setSelectedChannel}
        selectedChannel={selectedChannel}
      />
      
      {selectedChannel && (
        <ChannelView channelId={selectedChannel} userId={userId} />
      )}
    </div>
  );
};

export default NexusView;
