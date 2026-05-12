"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
};

export function Dialog({ open, onOpenChange, children, title, description, className }: DialogProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 animate-in-up"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full max-w-lg bg-[var(--color-bg-elev)] border border-[var(--color-border)] rounded-lg animate-in-up",
          "p-6",
          className,
        )}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 p-1.5 rounded-md text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-elev-2)] transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        {(title || description) && (
          <div className="mb-5">
            {title && <h2 className="text-base font-medium tracking-tight">{title}</h2>}
            {description && (
              <p className="text-sm text-[var(--color-fg-muted)] mt-1">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
