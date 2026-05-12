export type Profile = {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  goal: number | null;
  created_by: string;
  created_at: string;
};

export type Entry = {
  id: string;
  user_id: string;
  category_id: string;
  content: string;
  link: string | null;
  created_at: string;
  local_date: string;
};

export type EntryWithRefs = Entry & {
  category: Pick<Category, "id" | "name" | "icon" | "color"> | null;
  profile: Pick<Profile, "id" | "name" | "avatar_url"> | null;
};

export type StreakInfo = {
  current: number;
  longest: number;
  totalDays: number;
  loggedToday: boolean;
  consistencyPct: number; // last 30d
};
