-- 011_user_delete_prompts.sql
-- Allow users to delete their own prompts
drop policy if exists "users delete own prompts" on public.prompts;
create policy "users delete own prompts" on public.prompts for delete using (
  auth.uid() = user_id
);
