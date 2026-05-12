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
