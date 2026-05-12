"use client";

import * as React from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuickAdd } from "@/components/quick-add-context";
import { CategoryFormDialog } from "@/components/category-form";
import type { Category } from "@/lib/types";

export function CategoryActions({ category }: { category: Category }) {
  const { open } = useQuickAdd();
  const [editOpen, setEditOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
        <Pencil className="h-3 w-3" /> Edit
      </Button>
      <Button size="sm" onClick={() => open(category.id)}>
        <Plus className="h-3 w-3" /> Log
      </Button>
      <CategoryFormDialog open={editOpen} onOpenChange={setEditOpen} category={category} />
    </div>
  );
}
