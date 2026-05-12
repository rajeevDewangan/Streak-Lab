"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";

/**
 * Subscribe to entries + categories changes; debounce router.refresh()
 * so all open tabs stay in sync with the server-rendered data.
 */
export function RealtimeSync() {
  const router = useRouter();

  React.useEffect(() => {
    const supabase = getSupabaseBrowser();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const ping = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 250);
    };

    const channel = supabase
      .channel("streak-lab-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "entries" }, ping)
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, ping)
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
