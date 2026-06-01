"use client";

import { useState } from "react";
import { AlertCircle, RotateCcw, Save } from "lucide-react";
import { getSchemaById } from "@/lib/schemas";
import { useQueryStore } from "@/store/query-store";
import { hasValidationErrors } from "@/lib/validation";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import QueryGroup from "./QueryGroup";
import QueryRule from "./QueryRule";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  type Modifier,
} from "@dnd-kit/core";
import { QueryNode } from "@/lib/types";

function findNode(node: QueryNode, id: string): QueryNode | null {
  if (node.id === id) return node;
  if (node.type === "group") {
    for (const child of node.children) {
      const res = findNode(child, id);
      if (res) return res;
    }
  }
  return null;
}

const restrictToBuilderModifier: Modifier = ({ transform, activeNodeRect }) => {
  if (!activeNodeRect) return transform;

  // Target the actual visible card panel, not the outer flex wrapper
  const container = document.getElementById("query-builder-panel");
  if (!container) return transform;

  const containerRect = container.getBoundingClientRect();
  const inset = 16; // 16px padding so overlay never pokes past card edges

  const minLeft = containerRect.left + inset;
  const maxRight = containerRect.right - inset;
  const minTop = containerRect.top + inset;
  const maxBottom = containerRect.bottom - inset;

  const left = activeNodeRect.left + transform.x;
  const right = activeNodeRect.right + transform.x;
  const top = activeNodeRect.top + transform.y;
  const bottom = activeNodeRect.bottom + transform.y;

  let newX = transform.x;
  let newY = transform.y;

  if (left < minLeft) {
    newX += minLeft - left;
  } else if (right > maxRight) {
    newX -= right - maxRight;
  }

  if (top < minTop) {
    newY += minTop - top;
  } else if (bottom > maxBottom) {
    newY -= bottom - maxBottom;
  }

  return { ...transform, x: newX, y: newY };
};

export default function QueryBuilder() {
  const schemaId = useQueryStore((state) => state.schemaId);
  const rootGroup = useQueryStore((state) => state.rootGroup);
  const validationErrors = useQueryStore((state) => state.validationErrors);
  const validationTriggered = useQueryStore(
    (state) => state.validationTriggered,
  );
  const resetQuery = useQueryStore((state) => state.resetQuery);
  const moveNode = useQueryStore((state) => state.moveNode);

  const [activeNode, setActiveNode] = useState<QueryNode | null>(null);

  const schema = getSchemaById(schemaId);

  const handleDragStart = (event: DragStartEvent) => {
    const node = findNode(rootGroup, String(event.active.id));
    if (node) {
      setActiveNode(node);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveNode(null);
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      moveNode(String(active.id), String(over.id));
    }
  };

  const handleDragCancel = () => {
    setActiveNode(null);
  };

  if (!schema) {
    return (
      <div className="panel p-5 text-sm text-accent-danger">
        Schema not found. Please select a valid data source.
      </div>
    );
  }

  const invalid = validationTriggered && hasValidationErrors(validationErrors);

  return (
    <div id="query-builder-container" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
            Query Builder
          </h2>
          {invalid ? (
            <Badge variant="danger" dot>
              {validationErrors.length} issue
              {validationErrors.length === 1 ? "" : "s"}
            </Badge>
          ) : (
            <Badge variant="success">Valid</Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Save className="w-3.5 h-3.5" />}
          >
            Save Preset
          </Button>

          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={resetQuery}
          >
            Reset
          </Button>
        </div>
      </div>

      {validationTriggered && invalid && (
        <div className="flex items-start gap-2 rounded-lg border border-accent-warning/30 bg-accent-warning/10 px-3 py-2 text-xs text-text-secondary">
          <AlertCircle className="w-4 h-4 text-accent-warning shrink-0 mt-0.5" />
          <p>
            Fix validation issues before running queries. Errors are shown
            inline on each rule.
          </p>
        </div>
      )}

      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToBuilderModifier]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <QueryGroup group={rootGroup} schema={schema} isRoot depth={0} />
        <DragOverlay dropAnimation={null}>
          {activeNode ? (
            activeNode.type === "rule" ? (
              <div className="shadow-2xl select-none pointer-events-none w-full max-w-4xl opacity-95">
                <QueryRule rule={activeNode} schema={schema} isOverlay />
              </div>
            ) : (
              <div className="shadow-2xl select-none pointer-events-none w-full max-w-4xl opacity-95">
                <QueryGroup
                  group={activeNode}
                  schema={schema}
                  depth={0}
                  isOverlay
                />
              </div>
            )
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
