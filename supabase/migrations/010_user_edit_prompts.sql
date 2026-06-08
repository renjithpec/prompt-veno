-- Allow authenticated users to update their own prompts
drop policy if exists "users update own prompts" on public.prompts;
create policy "users update own prompts" on public.prompts for update using (
  auth.uid() = user_id
) with check (
  auth.uid() = user_id
);

-- Allow authenticated users to delete tags for their own prompts (needed when editing a prompt)
drop policy if exists "users delete own prompt tags" on public.prompt_tags;
create policy "users delete own prompt tags" on public.prompt_tags for delete using (
  exists (
    select 1 from public.prompts
    where id = prompt_id and user_id = auth.uid()
  )
);

-- Allow authenticated users to insert tags for their own prompts
drop policy if exists "users insert own prompt tags" on public.prompt_tags;
create policy "users insert own prompt tags" on public.prompt_tags for insert with check (
  exists (
    select 1 from public.prompts
    where id = prompt_id and user_id = auth.uid()
  )
);
