"use client";

import React from "react";
import { Database, Info } from "lucide-react";
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
  const currentSchema = SCHEMAS.find((s) => s.id === selectedSchemaId) || SCHEMAS[0];

  const options = SCHEMAS.map((schema) => {
    let icon = "👥";
    if (schema.id === "products") icon = "📦";
    if (schema.id === "orders") icon = "🛒";
    return {
      value: schema.id,
      label: `${icon} ${schema.label}`,
    };
  });

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-bg-surface p-4 rounded-xl border border-border-default shadow-sm w-full transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center flex-shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[0.625rem] font-bold uppercase tracking-wider text-text-tertiary block">
              Data Source
            </span>
            <span className="text-xs font-semibold text-text-secondary sm:hidden">
              {currentSchema.label}
            </span>
          </div>
        </div>
        <Select
          className="w-full sm:w-56 bg-bg-elevated font-medium"
          size="sm"
          options={options}
          value={selectedSchemaId}
          onChange={(e) => onSchemaChange(e.target.value)}
        />
      </div>

      {/* Schema description card */}
      <div className="flex items-start gap-2 bg-bg-elevated/40 p-2.5 rounded-lg border border-border-default max-w-md flex-1">
        <Info className="w-3.5 h-3.5 text-accent-secondary mt-0.5 flex-shrink-0" />
        <p className="text-[0.6875rem] text-text-secondary leading-relaxed">
          <span className="font-semibold text-text-primary block mb-0.5">
            {currentSchema.label} Description
          </span>
          {currentSchema.description}
        </p>
      </div>
    </div>
  );
}
export type { Schema };
