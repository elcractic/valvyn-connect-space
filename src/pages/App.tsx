import { useState } from "react";
import NexusSidebar from "@/components/NexusSidebar";
import ChannelView from "@/components/ChannelView";

const AppPage = () => {
  const [selectedChannel, setSelectedChannel] = useState("general");

  return (
    <div className="h-screen flex bg-background">
      <NexusSidebar onChannelSelect={setSelectedChannel} selectedChannel={selectedChannel} />
      <ChannelView channelName={selectedChannel} />
    </div>
  );
};

export default AppPage;
