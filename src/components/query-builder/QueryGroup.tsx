"use client";

import React from "react";
import { ChevronDown, ChevronRight, Trash2, Filter, Plus, FolderPlus } from "lucide-react";
import { QueryGroup as QueryGroupType, Schema } from "@/lib/types";
import { useQueryStore, getNodeError } from "@/store/query-store";
import { cn, getDepthColor } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import QueryRule from "./QueryRule";
import AddButton from "./AddButton";

interface QueryGroupProps {
  group: QueryGroupType;
  schema: Schema;
  depth?: number;
  isRoot?: boolean;
}

export default function QueryGroup({
  group,
  schema,
  depth = 0,
  isRoot = false,
}: QueryGroupProps) {
  const validationErrors = useQueryStore((state) => state.validationErrors);
  const validationTriggered = useQueryStore((state) => state.validationTriggered);
  const setConjunction = useQueryStore((state) => state.setConjunction);
  const toggleCollapsed = useQueryStore((state) => state.toggleCollapsed);
  const addRule = useQueryStore((state) => state.addRule);
  const addGroup = useQueryStore((state) => state.addGroup);
  const removeNode = useQueryStore((state) => state.removeNode);

  const groupError = validationTriggered ? getNodeError(validationErrors, group.id) : undefined;
  const depthColor = getDepthColor(depth);

  return (
    <div
      className={cn(
        "panel p-5 relative animate-fade-in depth-" + (depth % 6),
        !isRoot && "ml-2"
      )}
      style={{ borderLeftWidth: 4, borderLeftColor: depthColor }}
    >
      <div className="depth-indicator" style={{ background: depthColor }} />

      <div className="flex items-center justify-between pb-4 border-b border-border-default mb-4 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-7 h-7 p-0"
            aria-label={group.collapsed ? "Expand group" : "Collapse group"}
            onClick={() => toggleCollapsed(group.id)}
          >
            {group.collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          <div className="flex bg-bg-elevated p-1 rounded-lg">
            <button
              type="button"
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-md transition-all duration-150 cursor-pointer",
                group.conjunction === "AND"
                  ? "bg-accent-success text-text-inverse shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              )}
              onClick={() => setConjunction(group.id, "AND")}
            >
              AND
            </button>
            <button
              type="button"
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer",
                group.conjunction === "OR"
                  ? "bg-accent-warning text-text-inverse shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              )}
              onClick={() => setConjunction(group.id, "OR")}
            >
              OR
            </button>
          </div>

          <Badge variant={group.conjunction === "AND" ? "and" : "or"}>
            {group.conjunction} GROUP
          </Badge>

          {groupError && (
            <span className="text-xs text-accent-danger">{groupError}</span>
          )}
        </div>

        {!isRoot && (
          <Button
            variant="ghost"
            size="sm"
            className="text-accent-danger border border-accent-danger/20 bg-accent-danger/5 hover:bg-accent-danger/10"
            aria-label="Remove group"
            onClick={() => removeNode(group.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {!group.collapsed && (
        <>
          {group.children.length === 0 ? (
            <div className="flex flex-col gap-3 pl-4 border-l-2 border-border-default ml-2 group-connector">
              <div className="flex items-center justify-center bg-bg-elevated/40 border border-dashed border-border-default h-[54px] rounded-lg animate-fade-in">
                <span className="text-xs text-text-tertiary font-semibold uppercase tracking-wider">
                  No query
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pl-4 border-l-2 border-border-default ml-2 group-connector">
              {group.children.map((child) =>
                child.type === "rule" ? (
                  <QueryRule key={child.id} rule={child} schema={schema} />
                ) : (
                  <QueryGroup
                    key={child.id}
                    group={child}
                    schema={schema}
                    depth={depth + 1}
                  />
                )
              )}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-border-default">
            <AddButton
              onAddRule={() => addRule(group.id)}
              onAddGroup={() => addGroup(group.id)}
            />
          </div>
        </>
      )}
    </div>
  );
}
