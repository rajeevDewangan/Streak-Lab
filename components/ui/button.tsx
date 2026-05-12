"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-fg)] text-[var(--color-bg)] hover:bg-[#e5e5e5] active:bg-[#d4d4d4]",
  secondary:
    "bg-[var(--color-bg-elev)] text-[var(--color-fg)] hover:bg-[var(--color-bg-elev-2)] border border-[var(--color-border)]",
  ghost:
    "bg-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-elev)]",
  danger:
    "bg-transparent border border-[var(--color-border)] text-[var(--color-danger)] hover:bg-[var(--color-bg-elev)] hover:border-[var(--color-danger)]/40",
  outline:
    "bg-transparent border border-[var(--color-border)] text-[var(--color-fg)] hover:bg-[var(--color-bg-elev)] hover:border-[var(--color-border-strong)]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-10 px-5 text-sm gap-2",
  icon: "h-8 w-8 text-sm",
};

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", loading, disabled, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors duration-100",
        "ring-focus disabled:opacity-40 disabled:cursor-not-allowed select-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className="inline-block h-3.5 w-3.5 border-2 border-current border-r-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
});
