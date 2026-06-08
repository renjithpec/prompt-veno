-- Allow any authenticated user to upload images to the 'prompt-images' bucket
drop policy if exists "admins upload prompt images" on storage.objects;
drop policy if exists "Authenticated users can upload prompt images" on storage.objects;

create policy "Authenticated users can upload prompt images" 
on storage.objects for insert 
with check ( bucket_id = 'prompt-images' and auth.role() = 'authenticated' );

drop policy if exists "Users can update their own prompt images" on storage.objects;
create policy "Users can update their own prompt images"
on storage.objects for update
using ( bucket_id = 'prompt-images' and auth.uid() = owner )
with check ( bucket_id = 'prompt-images' and auth.uid() = owner );

drop policy if exists "Users can delete their own prompt images" on storage.objects;
create policy "Users can delete their own prompt images"
on storage.objects for delete
using ( bucket_id = 'prompt-images' and auth.uid() = owner );
