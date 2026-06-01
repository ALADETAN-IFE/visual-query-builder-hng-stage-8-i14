"use client";

import { ChevronDown, ChevronRight, Trash2, GripVertical } from "lucide-react";
import { QueryGroup as QueryGroupType, Schema } from "@/lib/types";
import { useQueryStore, getNodeError } from "@/store/query-store";
import { cn, getDepthColor } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import QueryRule from "./QueryRule";
import AddButton from "./AddButton";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";

interface QueryGroupProps {
  group: QueryGroupType;
  schema: Schema;
  depth?: number;
  isRoot?: boolean;
  isOverlay?: boolean;
}

export default function QueryGroup({
  group,
  schema,
  depth = 0,
  isRoot = false,
  isOverlay = false,
}: QueryGroupProps) {
  const validationErrors = useQueryStore((state) => state.validationErrors);
  const validationTriggered = useQueryStore(
    (state) => state.validationTriggered,
  );
  const setlogicalOperator = useQueryStore((state) => state.setlogicalOperator);
  const toggleCollapsed = useQueryStore((state) => state.toggleCollapsed);
  const addRule = useQueryStore((state) => state.addRule);
  const addGroup = useQueryStore((state) => state.addGroup);
  const removeNode = useQueryStore((state) => state.removeNode);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id, disabled: isRoot || isOverlay });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: group.id,
    disabled: !isRoot || isOverlay,
  });

  const { setNodeRef: setPlaceholderRef } = useDroppable({
    id: "empty-placeholder-" + group.id,
    disabled: isOverlay || group.children.length > 0,
  });

  const style = isRoot
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? "none" : isOverlay ? undefined : transition,
        opacity: isDragging ? 0 : 1,
        position: "relative" as const,
        zIndex: isDragging ? 50 : "auto",
      };

  const groupError = validationTriggered
    ? getNodeError(validationErrors, group.id)
    : undefined;
  const depthColor = getDepthColor(depth);

  return (
    <div
      id={isRoot ? "query-builder-panel" : undefined}
      ref={!isOverlay ? (isRoot ? setDroppableRef : setNodeRef) : undefined}
      style={
        !isRoot
          ? { ...style, borderLeftWidth: 4, borderLeftColor: depthColor }
          : { borderLeftWidth: 4, borderLeftColor: depthColor }
      }
      className={cn(
        "panel p-5 relative animate-fade-in depth-" + (depth % 6),
        !isRoot && "ml-2",
        isDragging && "opacity-0 pointer-events-none",
        isOverlay &&
          "shadow-2xl border-accent-secondary/60 scale-[1.01] opacity-90 border-l-4",
      )}
    >
      <div className="depth-indicator" style={{ background: depthColor }} />

      <div className="flex items-center justify-between pb-4 border-b border-border-default mb-4 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {!isRoot && (
            <div
              className={cn(
                "text-text-tertiary hover:text-text-primary mr-1 shrink-0 flex items-center justify-center p-1 rounded hover:bg-bg-inset transition-colors",
                isOverlay ? "cursor-grabbing" : "cursor-grab",
              )}
              {...(!isOverlay ? attributes : {})}
              {...(!isOverlay ? listeners : {})}
              aria-label="Drag group handle"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          )}

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
                group.logicalOperator === "AND"
                  ? "bg-accent-success text-text-inverse shadow-sm"
                  : "text-text-secondary hover:text-text-primary",
              )}
              onClick={() => setlogicalOperator(group.id, "AND")}
            >
              AND
            </button>
            <button
              type="button"
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer",
                group.logicalOperator === "OR"
                  ? "bg-accent-warning text-text-inverse shadow-sm"
                  : "text-text-secondary hover:text-text-primary",
              )}
              onClick={() => setlogicalOperator(group.id, "OR")}
            >
              OR
            </button>
          </div>

          <Badge variant={group.logicalOperator === "AND" ? "and" : "or"}>
            {group.logicalOperator} GROUP
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
              <div
                ref={setPlaceholderRef}
                className="flex items-center justify-center bg-bg-elevated/40 border border-dashed border-border-default h-13.5 rounded-lg animate-fade-in"
              >
                <span className="text-xs text-text-tertiary font-semibold uppercase tracking-wider">
                  No query
                </span>
              </div>
            </div>
          ) : isOverlay ? (
            <div className="flex flex-col gap-3 pl-4 border-l-2 border-border-default ml-2 group-connector animate-fade-in">
              {group.children.map((child) =>
                child.type === "rule" ? (
                  <QueryRule
                    key={child.id}
                    rule={child}
                    schema={schema}
                    isOverlay
                  />
                ) : (
                  <QueryGroup
                    key={child.id}
                    group={child}
                    schema={schema}
                    depth={depth + 1}
                    isOverlay
                  />
                ),
              )}
            </div>
          ) : (
            <SortableContext
              items={group.children.map((child) => child.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-3 pl-4 border-l-2 border-border-default ml-2 group-connector animate-fade-in">
                {group.children.map((child) =>
                  child.type === "rule" ? (
                    <QueryRule
                      key={child.id}
                      rule={child}
                      schema={schema}
                      isOverlay={isOverlay}
                    />
                  ) : (
                    <QueryGroup
                      key={child.id}
                      group={child}
                      schema={schema}
                      depth={depth + 1}
                      isOverlay={isOverlay}
                    />
                  ),
                )}
              </div>
            </SortableContext>
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
