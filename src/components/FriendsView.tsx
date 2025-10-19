import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Check, X } from "lucide-react";

interface FriendsViewProps {
  userId: string;
}

const FriendsView = ({ userId }: FriendsViewProps) => {
  const [activeTab, setActiveTab] = useState<"all" | "online" | "pending" | "blocked">("all");
  const [friendInput, setFriendInput] = useState("");
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadFriends();
    loadPendingRequests();

    const channel = supabase
      .channel("friendships-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friendships" },
        () => {
          loadFriends();
          loadPendingRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadFriends = async () => {
    const { data, error } = await supabase
      .from("friendships")
      .select("*, friend:friend_id(username, tag, status, avatar_url)")
      .eq("user_id", userId)
      .eq("status", "accepted");

    if (!error && data) {
      setFriends(data);
    }
  };

  const loadPendingRequests = async () => {
    const { data, error } = await supabase
      .from("friendships")
      .select("*, user:user_id(username, tag, avatar_url)")
      .eq("friend_id", userId)
      .eq("status", "pending");

    if (!error && data) {
      setPendingRequests(data);
    }
  };

  const sendFriendRequest = async () => {
    if (!friendInput.includes("#")) {
      toast({
        title: "Invalid format",
        description: "Use format: username#1234",
        variant: "destructive",
      });
      return;
    }

    const [username, tag] = friendInput.split("#");

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .eq("tag", tag)
      .single();

    if (!profile) {
      toast({
        title: "User not found",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("friendships").insert({
      user_id: userId,
      friend_id: profile.id,
      status: "pending",
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Friend request sent!",
      });
      setFriendInput("");
    }
  };

  const acceptRequest = async (requestId: string, friendId: string) => {
    await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", requestId);

    await supabase.from("friendships").insert({
      user_id: userId,
      friend_id: friendId,
      status: "accepted",
    });

    toast({ title: "Friend request accepted!" });
  };

  const declineRequest = async (requestId: string) => {
    await supabase.from("friendships").delete().eq("id", requestId);
    toast({ title: "Friend request declined" });
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-14 px-6 flex items-center justify-between border-b border-border glass">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold">Friends</h2>
          <div className="flex gap-2">
            {(["all", "online", "pending", "blocked"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  activeTab === tab
                    ? "bg-primary/20 text-primary"
                    : "hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-2xl space-y-6">
          <div className="glass p-4 rounded-lg border border-border/50">
            <h3 className="font-semibold mb-3">Add Friend</h3>
            <div className="flex gap-2">
              <Input
                value={friendInput}
                onChange={(e) => setFriendInput(e.target.value)}
                placeholder="username#1234"
                className="flex-1"
              />
              <Button
                onClick={sendFriendRequest}
                className="bg-gradient-primary hover:shadow-glow"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {pendingRequests.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">
                PENDING REQUESTS
              </h3>
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 glass rounded-lg border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center">
                      <span className="font-semibold text-sm">
                        {request.user.username[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">
                        {request.user.username}#{request.user.tag}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Incoming Friend Request
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => acceptRequest(request.id, request.user_id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => declineRequest(request.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {friends.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">
                ALL FRIENDS — {friends.length}
              </h3>
              {friends.map((friendship) => (
                <div
                  key={friendship.id}
                  className="flex items-center justify-between p-4 glass rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
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
                    <div>
                      <div className="font-semibold">
                        {friendship.friend.username}#{friendship.friend.tag}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {friendship.friend.status}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Message
                  </Button>
                </div>
              ))}
            </div>
          )}

          {friends.length === 0 && pendingRequests.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No friends yet. Add some using the form above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsView;
