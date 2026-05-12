"use client";

import * as Icons from "lucide-react";
import { Sparkles, type LucideIcon } from "lucide-react";

type IconName = string;

export const ICON_OPTIONS = [
  "sparkles",
  "cpu",
  "atom",
  "mic",
  "file-text",
  "server",
  "workflow",
  "rocket",
  "calculator",
  "code-2",
  "book-open",
  "brain",
  "flame",
  "target",
  "trophy",
  "graduation-cap",
  "pencil",
  "lightbulb",
  "terminal",
  "globe",
  "database",
  "wrench",
] as const;

function toPascal(name: string) {
  return name
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

export function CatIcon({ name, className }: { name: IconName; className?: string }) {
  const key = toPascal(name);
  const lib = Icons as unknown as Record<string, LucideIcon>;
  const Cmp = lib[key] ?? Sparkles;
  return <Cmp className={className} />;
}
