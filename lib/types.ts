export type Profile = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: "admin" | "user";
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  created_at: string;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type Prompt = {
  id: string;
  title: string;
  slug: string;
  description: string;
  prompt_content: string;
  preview_image: string;
  category_id: string;
  category?: Category;
  tags: Tag[];
  featured: boolean;
  views: number;
  copies: number;
  created_at: string;
  updated_at: string;
};

export type Settings = {
  id: string;
  instagram_url: string;
  instagram_username: string;
  creator_name: string;
  creator_avatar: string;
  site_title: string;
  site_description: string;
  updated_at: string;
};
