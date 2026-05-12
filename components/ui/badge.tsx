import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  color,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement> & { color?: string }) {
  const style = color
    ? { boxShadow: `inset 2px 0 0 ${color}` }
    : undefined;
  return (
    <span
      style={style}
      className={cn(
        "inline-flex items-center gap-1 pl-2 pr-2 py-0.5 rounded text-[11px] font-medium",
        "border border-[var(--color-border)] bg-[var(--color-bg-elev)] text-[var(--color-fg-muted)]",
        className,
      )}
      {...rest}
    />
  );
}
