-- Fix RLS for prompt_categories to allow users to insert/delete categories for their own prompts

-- Allow users to insert categories for prompts they own
create policy "Users can insert categories for their own prompts"
on public.prompt_categories for insert
with check (
  exists (
    select 1 from public.prompts
    where id = prompt_id and user_id = auth.uid()
  )
);

-- Allow users to delete categories from prompts they own
create policy "Users can delete categories from their own prompts"
on public.prompt_categories for delete
using (
  exists (
    select 1 from public.prompts
    where id = prompt_id and user_id = auth.uid()
  )
);
