"use client";

import React from "react";
import { Database, Info, Users, Package, ShoppingCart } from "lucide-react";
import { SCHEMAS } from "@/lib/schemas";
import { Schema } from "@/lib/types";
import Select from "@/components/ui/Select";

interface SchemaSelectorProps {
  selectedSchemaId: string;
  onSchemaChange: (schemaId: string) => void;
}

export default function SchemaSelector({
  selectedSchemaId,
  onSchemaChange,
}: SchemaSelectorProps) {
  const currentSchema =
    SCHEMAS.find((s) => s.id === selectedSchemaId) || SCHEMAS[0];
  const iconMap: Record<
    string,
    React.ComponentType<React.SVGProps<SVGSVGElement>>
  > = {
    users: Users,
    products: Package,
    orders: ShoppingCart,
  };

  const options = SCHEMAS.map((schema) => ({
    value: schema.id,
    label: schema.label,
  }));

  const CurrentIcon = iconMap[currentSchema.id] || Users;

  return (
    <section
      className="w-full rounded-xl border border-border-default bg-bg-surface p-4 shadow-sm"
      aria-label="Data source selection"
    >
      <div className="flex items-center justify-between gap-4 max-[750px]:flex-col max-[750px]:items-start">
        <div className="flex items-center min-w-0 gap-4 flex-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-primary/10 text-accent-primary">
              <Database className="h-4 w-4" />
            </div>
            <span className="text-[0.625rem] font-bold uppercase tracking-wider text-text-tertiary">
              Data Source
            </span>
          </div>

          <Select
            className="w-64 bg-bg-elevated font-medium"
            size="sm"
            options={options}
            value={selectedSchemaId}
            onChange={(e) => onSchemaChange(e.target.value)}
            leadingIcon={
              <CurrentIcon className="h-4 w-4 text-text-secondary" />
            }
          />
        </div>

        <div className="flex items-center min-w-0 gap-3 rounded-lg border border-border-default/60 bg-bg-elevated/40 px-4 py-2.5 max-w-lg ml-4 max-[750px]:ml-0">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-secondary" />
          <p className="min-w-0 text-[0.6875rem] leading-relaxed text-text-secondary">
            <span className="mb-0.5 block font-semibold text-text-primary">
              {currentSchema.label}
            </span>
            {currentSchema.description}
          </p>
        </div>
      </div>
    </section>
  );
}

export type { Schema };
