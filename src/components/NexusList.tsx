import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NexusListProps {
  onNexusSelect: (nexusId: string) => void;
}

const NexusList = ({ onNexusSelect }: NexusListProps) => {
  const [nexuses, setNexuses] = useState<any[]>([]);

  useEffect(() => {
    loadNexuses();
  }, []);

  const loadNexuses = async () => {
    const { data } = await supabase
      .from("nexuses")
      .select("*")
      .order("created_at", { ascending: true });

    if (data) setNexuses(data);
  };

  return (
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
            <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center">
              <span className="text-sm font-semibold">
                {nexus.name[0].toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium truncate">{nexus.name}</span>
          </div>
        </button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Nexus
      </Button>
    </div>
  );
};

export default NexusList;
