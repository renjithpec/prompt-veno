import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

async function test() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users[0];

  console.log("User:", user?.id);

  const { data: categories } = await supabase.from('categories').select('id').limit(1);
  const category_id = categories?.[0]?.id;

  const promptData = {
    title: "Test Prompt " + Date.now(),
    slug: "test-prompt-" + Date.now(),
    description: "This is a test description",
    prompt_content: "This is the content of the prompt",
    preview_image: "https://example.com/image.jpg",
    category_id: category_id,
    user_id: user?.id
  };

  const { data: prompt, error } = await supabase
    .from("prompts")
    .insert(promptData)
    .select("id")
    .single();

  console.log("Prompt insert result:", prompt, error);

  const { data: check } = await supabase.from('prompts').select('*').eq('slug', promptData.slug);
  console.log("Fetch check:", check);
}

test();
