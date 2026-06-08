export type Profile = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: "admin" | "user";
  is_verified: boolean;
  follower_count: number;
  following_count: number;
  instagram_url: string | null;
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
  user_id: string;
  title: string;
  slug: string;
  description: string;
  prompt_content: string;
  preview_image: string;
  category_id: string;
  category?: Category;
  tags: Tag[];
  profiles?: {
    name: string | null;
    avatar: string | null;
    is_verified?: boolean;
    follower_count?: number;
    instagram_url?: string | null;
  } | null;
  status?: 'pending' | 'approved' | 'rejected';
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
