import "server-only";
import { getSupabaseServer, getSession } from "./supabase/server";
import type { Category, EntryWithRefs, Profile } from "./types";

export async function loadAppData() {
  const user = await getSession();
  if (!user) {
    return {
      user: null,
      me: null,
      others: [] as Profile[],
      profiles: [] as Profile[],
      categories: [] as Category[],
      entries: [] as EntryWithRefs[],
    };
  }
  const supabase = await getSupabaseServer();

  const [{ data: profiles = [] }, { data: categories = [] }, { data: entries = [] }] =
    await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: true }),
      supabase.from("categories").select("*").order("created_at", { ascending: true }),
      supabase
        .from("entries")
        .select(
          "id,user_id,category_id,content,link,created_at,local_date,category:categories(id,name,icon,color),profile:profiles(id,name,avatar_url)",
        )
        .order("created_at", { ascending: false })
        .limit(2000),
    ]);

  const allProfiles = (profiles ?? []) as Profile[];
  const me = allProfiles.find((p) => p.id === user.id) ?? null;
  const others = allProfiles.filter((p) => p.id !== user.id);

  return {
    user,
    me,
    others,
    profiles: allProfiles,
    categories: (categories ?? []) as Category[],
    entries: (entries ?? []) as unknown as EntryWithRefs[],
  };
}
