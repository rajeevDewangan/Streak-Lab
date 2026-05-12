import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "surface p-5 transition-colors hover:border-[var(--color-border-strong)]",
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-start justify-between gap-3 mb-3", className)} {...rest} />;
}

export function CardTitle({ className, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-xs font-medium text-[var(--color-fg-muted)] uppercase tracking-wide", className)} {...rest} />;
}

export function CardValue({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-2xl font-semibold tracking-tight", className)} {...rest} />;
}
