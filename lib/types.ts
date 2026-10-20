export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
  is_superadmin: boolean;
};

export type Generation = {
  id: string;
  creator_id: string;
  prompt: string;
  title: string;
  collaboration: string;
  concept: string;
  hook: string;
  neighborhood: string;
  category: string;
  model: string;
  generated_on: string;
  created_at: string;
  daily_slot: number | null;
};

export type Vote = {
  id: string;
  generation_id: string;
  user_id: string;
  value: number;
  created_at: string;
  updated_at: string;
};
