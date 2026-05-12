import { redirect } from "next/navigation";
import { loadAppData } from "@/lib/data";
import { Topbar } from "@/components/topbar";
import { QuickAddProvider } from "@/components/quick-add-context";
import { QuickAdd } from "@/components/quick-add";
import { RealtimeSync } from "@/components/realtime-sync";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const data = await loadAppData();
  if (!data.user) redirect("/login");

  return (
    <QuickAddProvider>
      <RealtimeSync />
      <Topbar me={data.me} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
      <QuickAdd categories={data.categories} />
    </QuickAddProvider>
  );
}
