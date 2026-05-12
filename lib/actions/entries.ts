"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer, getSession } from "@/lib/supabase/server";

export async function createEntry(input: {
  categoryId: string;
  content: string;
  link?: string | null;
  localDate: string; // YYYY-MM-DD (client local)
}) {
  const user = await getSession();
  if (!user) return { error: "Not signed in" };

  const content = input.content.trim();
  if (!content) return { error: "Write something first." };
  if (!input.categoryId) return { error: "Pick a category." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.localDate)) return { error: "Bad date" };

  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("entries").insert({
    user_id: user.id,
    category_id: input.categoryId,
    content,
    link: input.link?.trim() || null,
    local_date: input.localDate,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/feed");
  revalidatePath(`/category/${input.categoryId}`);
  return { ok: true as const };
}

export async function deleteEntry(id: string) {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("entries").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/feed");
  return { ok: true as const };
}
