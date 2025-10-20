import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import UserSettingsDialog from "./UserSettingsDialog";

interface UserPanelProps {
  userId: string;
}

const UserPanel = ({ userId }: UserPanelProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out successfully" });
    navigate("/auth");
  };

  if (!profile) return null;

  const statusColor = {
    online: "bg-green-500",
    idle: "bg-yellow-500",
    dnd: "bg-red-500",
    invisible: "bg-gray-500",
  }[profile.status] || "bg-gray-500";

  const isVideoAvatar = profile.avatar_url?.includes('.mp4') || profile.avatar_url?.includes('.webm');

  return (
    <>
      <div className="p-2 border-t border-border glass">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
          <div className="relative">
            {profile.avatar_url ? (
              isVideoAvatar ? (
                <video
                  src={profile.avatar_url}
                  autoPlay
                  loop
                  muted
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center">
                <span className="font-semibold text-sm">
                  {profile.username[0].toUpperCase()}
                </span>
              </div>
            )}
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${statusColor}`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{profile.username}</div>
            <div className="text-xs text-muted-foreground">#{profile.tag}</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <UserSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        userId={userId}
      />
    </>
  );
};

export default UserPanel;
