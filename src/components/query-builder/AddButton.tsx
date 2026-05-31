"use client";

import React from "react";
import { Plus, Layers } from "lucide-react";
import Button from "@/components/ui/Button";

interface AddButtonProps {
  onAddRule: () => void;
  onAddGroup: () => void;
}

export default function AddButton({ onAddRule, onAddGroup }: AddButtonProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="secondary"
        size="sm"
        icon={<Plus className="w-3.5 h-3.5" />}
        onClick={onAddRule}
      >
        Add Rule
      </Button>
      <Button
        variant="secondary"
        size="sm"
        icon={<Layers className="w-3.5 h-3.5" />}
        onClick={onAddGroup}
      >
        Add Subgroup
      </Button>
    </div>
  );
}
