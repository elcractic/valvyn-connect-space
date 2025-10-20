import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";

interface CreateNexusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onNexusCreated?: () => void;
}

const CreateNexusDialog = ({ open, onOpenChange, userId, onNexusCreated }: CreateNexusDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setIconPreview(reader.result as string);
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

  const uploadFile = async (file: File, bucket: string, nexusId: string, type: 'icon' | 'banner') => {
    const ext = file.name.split('.').pop();
    const path = `${nexusId}/${type}.${ext}`;
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrl;
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({ title: "Please enter a nexus name", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      // Create nexus
      const { data: nexus, error: nexusError } = await supabase
        .from("nexuses")
        .insert({
          name: name.trim(),
          description: description.trim(),
          owner_id: userId,
        })
        .select()
        .single();

      if (nexusError) throw nexusError;

      // Upload files if provided
      let iconUrl = null;
      let bannerUrl = null;

      if (iconFile) {
        iconUrl = await uploadFile(iconFile, 'nexus-icons', nexus.id, 'icon');
      }

      if (bannerFile) {
        bannerUrl = await uploadFile(bannerFile, 'nexus-banners', nexus.id, 'banner');
      }

      // Update nexus with file URLs
      if (iconUrl || bannerUrl) {
        await supabase
          .from("nexuses")
          .update({
            icon_url: iconUrl,
            banner_url: bannerUrl,
          })
          .eq("id", nexus.id);
      }

      // Add creator as member
      await supabase
        .from("nexus_members")
        .insert({
          nexus_id: nexus.id,
          user_id: userId,
          role: "owner",
        });

      // Create default channel
      await supabase
        .from("channels")
        .insert({
          nexus_id: nexus.id,
          name: "general",
          type: "text",
          category: "Text Channels",
          position: 0,
        });

      toast({ title: "Nexus created successfully!" });
      onNexusCreated?.();
      onOpenChange(false);
      
      // Reset form
      setName("");
      setDescription("");
      setIconFile(null);
      setBannerFile(null);
      setIconPreview(null);
      setBannerPreview(null);
    } catch (error: any) {
      toast({
        title: "Error creating nexus",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Nexus</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Banner */}
          <div>
            <Label>Banner (Optional)</Label>
            <div className="mt-2">
              {bannerPreview ? (
                <div className="relative w-full h-24 rounded-lg overflow-hidden">
                  <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => {
                      setBannerPreview(null);
                      setBannerFile(null);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleBannerChange} />
                </label>
              )}
            </div>
          </div>

          {/* Icon */}
          <div>
            <Label>Icon (Optional)</Label>
            <div className="mt-2 flex items-center gap-3">
              {iconPreview ? (
                <div className="relative">
                  <img src={iconPreview} alt="Icon" className="w-16 h-16 rounded-full object-cover" />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5"
                    onClick={() => {
                      setIconPreview(null);
                      setIconFile(null);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-accent flex items-center justify-center">
                  <span className="text-xl font-bold">{name[0]?.toUpperCase() || "?"}</span>
                </div>
              )}
              <label>
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </span>
                </Button>
                <input type="file" className="hidden" accept="image/*" onChange={handleIconChange} />
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">Nexus Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Nexus"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's your nexus about?"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNexusDialog;
