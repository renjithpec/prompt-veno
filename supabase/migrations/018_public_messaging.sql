-- Migration for real-time public group messaging

-- Create the public_messages table
CREATE TABLE IF NOT EXISTS public_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    room_id TEXT NOT NULL DEFAULT 'general',
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone (authenticated or not) to read messages
-- Usually, we might want only authenticated, but public communities might be read-only for guests.
-- Let's make it read for everyone, insert for authenticated.
CREATE POLICY "Public messages are viewable by everyone" 
ON public_messages FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert public messages" 
ON public_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Enable realtime for this table
-- Drop publication if exists then create/alter it. Supabase uses 'supabase_realtime' publication.
-- We alter the existing 'supabase_realtime' publication to add the new table.
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'public_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public_messages;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Fallback if publication doesn't exist (local dev sometimes)
  -- Or if adding fails.
END $$;
