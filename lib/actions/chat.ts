"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer, getSession } from "@/lib/supabase/server";

export async function sendChat(content: string) {
  const user = await getSession();
  if (!user) return { error: "Not signed in" };

  const trimmed = content.trim();
  if (!trimmed) return { error: "Write something first." };

  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("chat_messages").insert({
    user_id: user.id,
    content: trimmed,
  });
  if (error) return { error: error.message };

  revalidatePath("/notes");
  return { ok: true as const };
}
