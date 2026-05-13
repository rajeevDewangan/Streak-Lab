"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer, getSession } from "@/lib/supabase/server";

export async function saveSharedDoc(content: string) {
  const user = await getSession();
  if (!user) return { error: "Not signed in" };

  const supabase = await getSupabaseServer();
  const { error } = await supabase
    .from("shared_doc")
    .update({
      content,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", 1);
  if (error) return { error: error.message };

  revalidatePath("/notes");
  return { ok: true as const };
}

export async function createCategoryNote(input: {
  categoryId: string;
  topic: string;
  content: string;
}) {
  const user = await getSession();
  if (!user) return { error: "Not signed in" };

  const topic = input.topic.trim();
  const content = input.content.trim();
  if (!topic) return { error: "Topic is required" };
  if (!content) return { error: "Write something first." };
  if (!input.categoryId) return { error: "Missing category" };

  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("category_notes").insert({
    category_id: input.categoryId,
    user_id: user.id,
    topic,
    content,
  });
  if (error) return { error: error.message };

  revalidatePath(`/category/${input.categoryId}`);
  return { ok: true as const };
}

export async function updateCategoryNote(
  id: string,
  patch: { topic: string; content: string },
) {
  const user = await getSession();
  if (!user) return { error: "Not signed in" };

  const topic = patch.topic.trim();
  const content = patch.content.trim();
  if (!topic) return { error: "Topic is required" };
  if (!content) return { error: "Write something first." };

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("category_notes")
    .update({ topic, content, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("category_id")
    .maybeSingle();
  if (error) return { error: error.message };

  if (data?.category_id) revalidatePath(`/category/${data.category_id}`);
  return { ok: true as const };
}

export async function deleteCategoryNote(id: string) {
  const user = await getSession();
  if (!user) return { error: "Not signed in" };

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("category_notes")
    .delete()
    .eq("id", id)
    .select("category_id")
    .maybeSingle();
  if (error) return { error: error.message };

  if (data?.category_id) revalidatePath(`/category/${data.category_id}`);
  return { ok: true as const };
}
