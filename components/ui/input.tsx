import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full h-9 px-3 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)]",
          "text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-dim)]",
          "ring-focus transition-colors",
          "focus:border-[var(--color-border-strong)]",
          className,
        )}
        {...rest}
      />
    );
  },
);

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full px-3 py-2 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)]",
        "text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-dim)]",
        "ring-focus transition-colors resize-none",
        "focus:border-[var(--color-border-strong)]",
        className,
      )}
      {...rest}
    />
  );
});
