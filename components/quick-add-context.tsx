"use client";

import * as React from "react";

type Ctx = {
  isOpen: boolean;
  open: (presetCategoryId?: string) => void;
  close: () => void;
  presetCategoryId: string | null;
};

const QuickAddCtx = React.createContext<Ctx | null>(null);

export function QuickAddProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [preset, setPreset] = React.useState<string | null>(null);

  const open = React.useCallback((id?: string) => {
    setPreset(id ?? null);
    setIsOpen(true);
  }, []);
  const close = React.useCallback(() => setIsOpen(false), []);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((v) => !v);
      } else if (e.key === "n" && !meta) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        setIsOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <QuickAddCtx.Provider value={{ isOpen, open, close, presetCategoryId: preset }}>
      {children}
    </QuickAddCtx.Provider>
  );
}

export function useQuickAdd() {
  const ctx = React.useContext(QuickAddCtx);
  if (!ctx) throw new Error("useQuickAdd must be used inside QuickAddProvider");
  return ctx;
}
