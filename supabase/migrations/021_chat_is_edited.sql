-- Add is_edited column to public_messages to track edited messages

ALTER TABLE public_messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;
