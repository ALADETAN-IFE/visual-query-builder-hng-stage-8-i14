import { create } from "zustand";
import {
  LogicalOperator,
  QueryGroup,
  QueryRule,
  ValidationError,
} from "@/lib/types";
import { getSchemaById } from "@/lib/schemas";
import { getOperatorsForType } from "@/lib/operators";
import { generateId } from "@/lib/utils";
import { validateQueryTree } from "@/lib/validation";

function createEmptyRule(schemaId: string): QueryRule {
  const schema = getSchemaById(schemaId);
  const firstField = schema?.fields[0];
  const operator = firstField
    ? (getOperatorsForType(firstField.type)[0]?.value ?? "equals")
    : "equals";

  return {
    id: generateId(),
    type: "rule",
    field: firstField?.id ?? "",
    operator,
    value: firstField?.defaultValue ?? "",
  };
}

function createEmptyGroup(): QueryGroup {
  return {
    id: generateId(),
    type: "group",
    conjunction: "AND",
    children: [],
    collapsed: false,
  };
}

function createInitialRoot(schemaId: string): QueryGroup {
  const root = createEmptyGroup();
  root.children = [createEmptyRule(schemaId), createEmptyRule(schemaId)];
  return root;
}

function updateNodeInTree(
  group: QueryGroup,
  nodeId: string,
  updater: (node: QueryGroup | QueryRule) => QueryGroup | QueryRule,
): QueryGroup {
  if (group.id === nodeId) {
    return updater(group) as QueryGroup;
  }

  return {
    ...group,
    children: group.children.map((child) => {
      if (child.id === nodeId) {
        return updater(child);
      }
      if (child.type === "group") {
        return updateNodeInTree(child, nodeId, updater);
      }
      return child;
    }),
  };
}

function removeNodeFromTree(group: QueryGroup, nodeId: string): QueryGroup {
  return {
    ...group,
    children: group.children
      .filter((child) => child.id !== nodeId)
      .map((child) =>
        child.type === "group" ? removeNodeFromTree(child, nodeId) : child,
      ),
  };
}

function addChildToGroup(
  group: QueryGroup,
  parentId: string,
  child: QueryRule | QueryGroup,
): QueryGroup {
  if (group.id === parentId) {
    return { ...group, children: [...group.children, child] };
  }

  return {
    ...group,
    children: group.children.map((node) =>
      node.type === "group" ? addChildToGroup(node, parentId, child) : node,
    ),
  };
}

interface QueryStore {
  schemaId: string;
  rootGroup: QueryGroup;
  validationErrors: ValidationError[];
  validationTriggered: boolean;

  setSchemaId: (id: string) => void;
  addRule: (groupId: string) => void;
  addGroup: (groupId: string) => void;
  removeNode: (nodeId: string) => void;
  updateRule: (
    ruleId: string,
    updates: Partial<Omit<QueryRule, "id" | "type">>,
  ) => void;
  setConjunction: (groupId: string, conjunction: LogicalOperator) => void;
  toggleCollapsed: (groupId: string) => void;
  runValidation: () => void;
  resetQuery: () => void;
}

export const useQueryStore = create<QueryStore>((set, get) => ({
  schemaId: "users",
  rootGroup: createInitialRoot("users"),
  validationErrors: [],
  validationTriggered: false,

  setSchemaId: (id) => {
    set({
      schemaId: id,
      rootGroup: createInitialRoot(id),
      validationErrors: [],
      validationTriggered: false,
    });
  },

  addRule: (groupId) => {
    const { schemaId, rootGroup } = get();
    set({
      rootGroup: addChildToGroup(rootGroup, groupId, createEmptyRule(schemaId)),
    });
    if (get().validationTriggered) {
      get().runValidation();
    }
  },

  addGroup: (groupId) => {
    const { schemaId, rootGroup } = get();
    const newGroup = createEmptyGroup();
    newGroup.children = [createEmptyRule(schemaId)];
    set({
      rootGroup: addChildToGroup(rootGroup, groupId, newGroup),
    });
    if (get().validationTriggered) {
      get().runValidation();
    }
  },

  removeNode: (nodeId) => {
    const { rootGroup } = get();
    if (rootGroup.id === nodeId) return;

    set({
      rootGroup: removeNodeFromTree(rootGroup, nodeId),
    });
    if (get().validationTriggered) {
      get().runValidation();
    }
  },

  updateRule: (ruleId, updates) => {
    const { rootGroup } = get();
    set({
      rootGroup: updateNodeInTree(rootGroup, ruleId, (node) => {
        if (node.type !== "rule") return node;
        return { ...node, ...updates };
      }) as QueryGroup,
    });
    if (get().validationTriggered) {
      get().runValidation();
    }
  },

  setConjunction: (groupId, conjunction) => {
    const { rootGroup } = get();
    set({
      rootGroup: updateNodeInTree(rootGroup, groupId, (node) => {
        if (node.type !== "group") return node;
        return { ...node, conjunction };
      }) as QueryGroup,
    });
  },

  toggleCollapsed: (groupId) => {
    const { rootGroup } = get();
    set({
      rootGroup: updateNodeInTree(rootGroup, groupId, (node) => {
        if (node.type !== "group") return node;
        return { ...node, collapsed: !node.collapsed };
      }) as QueryGroup,
    });
  },

  runValidation: () => {
    const { schemaId, rootGroup } = get();
    const schema = getSchemaById(schemaId);
    if (!schema) {
      set({ validationErrors: [], validationTriggered: true });
      return;
    }
    set({
      validationErrors: validateQueryTree(rootGroup, schema),
      validationTriggered: true,
    });
  },

  resetQuery: () => {
    const { schemaId } = get();
    set({
      rootGroup: createInitialRoot(schemaId),
      validationErrors: [],
      validationTriggered: false,
    });
  },
}));

export function getErrorsForNode(
  errors: ValidationError[],
  nodeId: string,
): ValidationError[] {
  return errors.filter((error) => error.nodeId === nodeId);
}

export function getNodeError(
  errors: ValidationError[],
  nodeId: string,
  field?: string,
): string | undefined {
  const match = errors.find(
    (error) => error.nodeId === nodeId && (!field || error.field === field),
  );
  return match?.message;
}
