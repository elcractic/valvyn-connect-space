import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateNexusDialog from "./CreateNexusDialog";

interface NexusListProps {
  onNexusSelect: (nexusId: string) => void;
  userId: string;
}

const NexusList = ({ onNexusSelect, userId }: NexusListProps) => {
  const [nexuses, setNexuses] = useState<any[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadNexuses();
  }, []);

  const loadNexuses = async () => {
    const { data } = await supabase
      .from("nexus_members")
      .select("*, nexuses(*)")
      .eq("user_id", userId);

    if (data) {
      setNexuses(data.map((m: any) => m.nexuses));
    }
  };

  return (
    <>
      <div className="px-2 space-y-2">
        <div className="px-2 text-xs font-semibold text-muted-foreground">
          NEXUSES
        </div>
        {nexuses.map((nexus) => (
          <button
            key={nexus.id}
            onClick={() => onNexusSelect(nexus.id)}
            className="w-full p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              {nexus.icon_url ? (
                <img
                  src={nexus.icon_url}
                  alt={nexus.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center">
                  <span className="text-sm font-semibold">
                    {nexus.name[0].toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium truncate">{nexus.name}</span>
            </div>
          </button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Nexus
        </Button>
      </div>

      <CreateNexusDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        userId={userId}
        onNexusCreated={loadNexuses}
      />
    </>
  );
};

export default NexusList;
