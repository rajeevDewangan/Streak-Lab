"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryFormDialog } from "@/components/category-form";

export function NewCategoryButton({
  label = "New category",
  icon,
}: {
  label?: string;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        {icon ?? <Plus className="h-3.5 w-3.5" />}
        {label}
      </Button>
      <CategoryFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
