"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer, getSession } from "@/lib/supabase/server";

export async function createCategory(input: {
  name: string;
  icon: string;
  color: string;
  goal: number | null;
}) {
  const user = await getSession();
  if (!user) return { error: "Not signed in" };

  const name = input.name.trim();
  if (!name) return { error: "Name is required" };

  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("categories").insert({
    name,
    icon: input.icon || "sparkles",
    color: input.color || "#7c5cff",
    goal: input.goal,
    created_by: user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function updateCategory(
  id: string,
  patch: Partial<{ name: string; icon: string; color: string; goal: number | null }>,
) {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("categories").update(patch).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function deleteCategory(id: string) {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}
