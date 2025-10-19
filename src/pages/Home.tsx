import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import FriendsView from "@/components/FriendsView";
import DirectMessages from "@/components/DirectMessages";
import NexusList from "@/components/NexusList";
import UserPanel from "@/components/UserPanel";
import { Loader2 } from "lucide-react";

const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"friends" | "dm" | string>("friends");
  const [selectedDM, setSelectedDM] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar */}
      <div className="w-60 flex flex-col border-r border-border glass">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            VALVYN
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-2 space-y-1">
            <button
              onClick={() => {
                setCurrentView("friends");
                setSelectedDM(null);
              }}
              className={`w-full px-3 py-2 rounded-lg text-left transition-colors ${
                currentView === "friends"
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              🏠 Friends
            </button>

            <button
              onClick={() => {
                setCurrentView("dm");
                setSelectedDM(null);
              }}
              className={`w-full px-3 py-2 rounded-lg text-left transition-colors ${
                currentView === "dm"
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              💬 Direct Messages
            </button>
          </div>

          <div className="h-px bg-border my-2" />

          <NexusList onNexusSelect={(id) => setCurrentView(id)} />
        </div>

        <UserPanel userId={user.id} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {currentView === "friends" && <FriendsView userId={user.id} />}
        {currentView === "dm" && (
          <DirectMessages
            userId={user.id}
            selectedDM={selectedDM}
            onSelectDM={setSelectedDM}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
