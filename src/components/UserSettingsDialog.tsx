import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";

interface UserSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const UserSettingsDialog = ({ open, onOpenChange, userId }: UserSettingsDialogProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) loadProfile();
  }, [open, userId]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile(data);
      setUsername(data.username);
      setBio(data.bio || "");
      if (data.avatar_url) setAvatarPreview(data.avatar_url);
      if (data.banner_url) setBannerPreview(data.banner_url);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let avatarUrl = profile?.avatar_url;
      let bannerUrl = profile?.banner_url;

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
        const path = `${userId}/avatar.${ext}`;
        avatarUrl = await uploadFile(avatarFile, 'avatars', path);
      }

      if (bannerFile) {
        const ext = bannerFile.name.split('.').pop();
        const path = `${userId}/banner.${ext}`;
        bannerUrl = await uploadFile(bannerFile, 'banners', path);
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          bio,
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
        })
        .eq("id", userId);

      if (error) throw error;

      toast({ title: "Profile updated successfully!" });
      onOpenChange(false);
    } catch (error: any) {
      toast({ 
        title: "Error updating profile", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Banner */}
          <div>
            <Label>Banner</Label>
            <div className="mt-2 relative">
              {bannerPreview ? (
                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                  <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setBannerPreview(null);
                      setBannerFile(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                  <div className="flex flex-col items-center">
                    <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload Banner</span>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleBannerChange} />
                </label>
              )}
            </div>
          </div>

          {/* Avatar */}
          <div>
            <Label>Avatar (Images or Videos)</Label>
            <div className="mt-2 flex items-center gap-4">
              {avatarPreview ? (
                <div className="relative">
                  {avatarFile?.type.startsWith('video/') || profile?.avatar_url?.includes('.mp4') || profile?.avatar_url?.includes('.webm') ? (
                    <video
                      src={avatarPreview}
                      autoPlay
                      loop
                      muted
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                  )}
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => {
                      setAvatarPreview(null);
                      setAvatarFile(null);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-accent flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {username[0]?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <label>
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </span>
                </Button>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/mp4,video/webm"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
          </div>

          {/* Username */}
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserSettingsDialog;
