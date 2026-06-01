update public.settings
set
  site_title = 'Prompt Veno',
  creator_name = 'Prompt Veno',
  instagram_username = 'Prompt Veno',
  instagram_url = 'https://www.instagram.com/promptveno/',
  updated_at = now()
where id = 'settings';
