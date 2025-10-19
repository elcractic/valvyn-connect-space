-- Create user profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  tag text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  banner_url text,
  bio text,
  status text DEFAULT 'online',
  custom_status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(username, tag)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create friendships table
CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their friendships"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Create direct messages table
CREATE TABLE public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  edited boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their DMs"
  ON public.direct_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send DMs"
  ON public.direct_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own DMs"
  ON public.direct_messages FOR UPDATE
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own DMs"
  ON public.direct_messages FOR DELETE
  USING (auth.uid() = sender_id);

-- Create nexuses table
CREATE TABLE public.nexuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon_url text,
  banner_url text,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.nexuses ENABLE ROW LEVEL SECURITY;

-- Create nexus members table (create BEFORE adding RLS to nexuses)
CREATE TABLE public.nexus_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nexus_id uuid NOT NULL REFERENCES public.nexuses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(nexus_id, user_id)
);

ALTER TABLE public.nexus_members ENABLE ROW LEVEL SECURITY;

-- Now add RLS policies that reference nexus_members
CREATE POLICY "Users can view nexuses they're members of"
  ON public.nexuses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.nexus_members
      WHERE nexus_id = nexuses.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create nexuses"
  ON public.nexuses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their nexuses"
  ON public.nexuses FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their nexuses"
  ON public.nexuses FOR DELETE
  USING (auth.uid() = owner_id);

-- Add RLS policies for nexus_members
CREATE POLICY "Users can view members of their nexuses"
  ON public.nexus_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.nexus_members nm
      WHERE nm.nexus_id = nexus_members.nexus_id AND nm.user_id = auth.uid()
    )
  );

CREATE POLICY "Nexus owners can add members"
  ON public.nexus_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.nexuses
      WHERE id = nexus_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Nexus owners can update members"
  ON public.nexus_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.nexuses
      WHERE id = nexus_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can leave nexuses"
  ON public.nexus_members FOR DELETE
  USING (auth.uid() = user_id);

-- Create channels table
CREATE TABLE public.channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nexus_id uuid NOT NULL REFERENCES public.nexuses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('text', 'voice', 'forum')),
  category text,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view channels in their nexuses"
  ON public.channels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.nexus_members
      WHERE nexus_id = channels.nexus_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Nexus owners can create channels"
  ON public.channels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.nexuses
      WHERE id = nexus_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Nexus owners can update channels"
  ON public.channels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.nexuses n
      WHERE n.id = nexus_id AND n.owner_id = auth.uid()
    )
  );

CREATE POLICY "Nexus owners can delete channels"
  ON public.channels FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.nexuses n
      WHERE n.id = nexus_id AND n.owner_id = auth.uid()
    )
  );

-- Create messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  edited boolean DEFAULT false,
  reply_to uuid REFERENCES public.messages(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their channels"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.channels c
      JOIN public.nexus_members nm ON c.nexus_id = nm.nexus_id
      WHERE c.id = channel_id AND nm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their messages"
  ON public.messages FOR DELETE
  USING (auth.uid() = author_id);

-- Create invites table
CREATE TABLE public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nexus_id uuid NOT NULL REFERENCES public.nexuses(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  max_uses integer,
  uses integer DEFAULT 0,
  expires_at timestamptz,
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view invites"
  ON public.invites FOR SELECT
  USING (true);

CREATE POLICY "Nexus members can create invites"
  ON public.invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.nexus_members
      WHERE nexus_id = invites.nexus_id AND user_id = auth.uid()
    )
  );

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON public.friendships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_direct_messages_updated_at BEFORE UPDATE ON public.direct_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nexuses_updated_at BEFORE UPDATE ON public.nexuses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON public.channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();