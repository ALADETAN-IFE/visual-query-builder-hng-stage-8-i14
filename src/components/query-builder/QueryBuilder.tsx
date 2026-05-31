"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { getSchemaById } from "@/lib/schemas";
import { useQueryStore } from "@/store/query-store";
import { hasValidationErrors } from "@/lib/validation";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import QueryGroup from "./QueryGroup";

export default function QueryBuilder() {
  const schemaId = useQueryStore((state) => state.schemaId);
  const rootGroup = useQueryStore((state) => state.rootGroup);
  const validationErrors = useQueryStore((state) => state.validationErrors);
  const runValidation = useQueryStore((state) => state.runValidation);
  const resetQuery = useQueryStore((state) => state.resetQuery);

  const schema = getSchemaById(schemaId);

  useEffect(() => {
    runValidation();
  }, [runValidation]);

  if (!schema) {
    return (
      <div className="panel p-5 text-sm text-accent-danger">
        Schema not found. Please select a valid data source.
      </div>
    );
  }

  const invalid = hasValidationErrors(validationErrors);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
            Query Builder
          </h2>
          {invalid ? (
            <Badge variant="danger" dot>
              {validationErrors.length} issue{validationErrors.length === 1 ? "" : "s"}
            </Badge>
          ) : (
            <Badge variant="success">Valid</Badge>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          icon={<RotateCcw className="w-3.5 h-3.5" />}
          onClick={resetQuery}
        >
          Reset
        </Button>
      </div>

      {invalid && (
        <div className="flex items-start gap-2 rounded-lg border border-accent-warning/30 bg-accent-warning/10 px-3 py-2 text-xs text-text-secondary">
          <AlertCircle className="w-4 h-4 text-accent-warning shrink-0 mt-0.5" />
          <p>
            Fix validation issues before running queries. Errors are shown inline on each rule.
          </p>
        </div>
      )}

      <QueryGroup group={rootGroup} schema={schema} isRoot depth={0} />
    </div>
  );
}
