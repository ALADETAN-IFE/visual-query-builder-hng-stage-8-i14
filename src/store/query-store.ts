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
    logicalOperator: "AND",
    children: [],
    collapsed: false,
  };
}

function createInitialRoot(): QueryGroup {
  const root = createEmptyGroup();
  root.children = [];
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

function hasDescendant(
  node: QueryRule | QueryGroup,
  targetId: string,
): boolean {
  if (node.id === targetId) return true;
  if (node.type === "group") {
    return node.children.some((child) => hasDescendant(child, targetId));
  }
  return false;
}

function isAncestor(
  root: QueryGroup,
  activeId: string,
  overId: string,
): boolean {
  let activeNode: QueryRule | QueryGroup | null = null;
  function findNode(node: QueryRule | QueryGroup) {
    if (node.id === activeId) {
      activeNode = node;
      return;
    }
    if (node.type === "group") {
      node.children.forEach(findNode);
    }
  }
  findNode(root);

  if (!activeNode) return false;
  return hasDescendant(activeNode, overId);
}

function extractNode(
  group: QueryGroup,
  id: string,
): { newGroup: QueryGroup; node: QueryRule | QueryGroup | null } {
  const childIndex = group.children.findIndex((c) => c.id === id);
  if (childIndex !== -1) {
    const tempGroup = { ...group, children: [...group.children] };
    const [extracted] = tempGroup.children.splice(childIndex, 1);
    return { newGroup: tempGroup, node: extracted };
  }

  let foundNode: QueryRule | QueryGroup | null = null;
  const newChildren = group.children.map((child) => {
    if (child.type === "group") {
      const res = extractNode(child, id);
      if (res.node) {
        foundNode = res.node;
        return res.newGroup;
      }
    }
    return child;
  });

  return { newGroup: { ...group, children: newChildren }, node: foundNode };
}

function insertNode(
  group: QueryGroup,
  overId: string,
  nodeToInsert: QueryRule | QueryGroup,
): QueryGroup {
  if (group.id === overId) {
    return { ...group, children: [...group.children, nodeToInsert] };
  }

  const childIndex = group.children.findIndex((c) => c.id === overId);
  if (childIndex !== -1) {
    const child = group.children[childIndex];
    if (
      child.type === "group" &&
      (nodeToInsert.type === "rule" || child.children.length === 0)
    ) {
      const updatedChild = {
        ...child,
        children: [...child.children, nodeToInsert],
      };
      const newChildren = [...group.children];
      newChildren[childIndex] = updatedChild;
      return { ...group, children: newChildren };
    }
    const newChildren = [...group.children];
    newChildren.splice(childIndex, 0, nodeToInsert);
    return { ...group, children: newChildren };
  }

  const newChildren = group.children.map((child) => {
    if (child.type === "group") {
      return insertNode(child, overId, nodeToInsert);
    }
    return child;
  });

  return { ...group, children: newChildren };
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
  setlogicalOperator: (
    groupId: string,
    logicalOperator: LogicalOperator,
  ) => void;
  toggleCollapsed: (groupId: string) => void;
  runValidation: () => void;
  resetQuery: () => void;
  moveNode: (activeId: string, overId: string) => void;
  importQuery: (schemaId: string, query: QueryGroup) => void;
}

const getInitialSchemaId = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("querycraft-schema") || "users";
  }
  return "users";
};

export const useQueryStore = create<QueryStore>((set, get) => {
  const initialSchema = getInitialSchemaId();
  return {
    schemaId: initialSchema,
    rootGroup: createInitialRoot(),
    validationErrors: [],
    validationTriggered: false,

    setSchemaId: (id) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("querycraft-schema", id);
      }
      set({
        schemaId: id,
        rootGroup: createInitialRoot(),
        validationErrors: [],
        validationTriggered: false,
      });
    },

    addRule: (groupId) => {
      const { schemaId, rootGroup } = get();
      set({
        rootGroup: addChildToGroup(
          rootGroup,
          groupId,
          createEmptyRule(schemaId),
        ),
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

    setlogicalOperator: (groupId, logicalOperator) => {
      const { rootGroup } = get();
      set({
        rootGroup: updateNodeInTree(rootGroup, groupId, (node) => {
          if (node.type !== "group") return node;
          return { ...node, logicalOperator };
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
      set({
        rootGroup: createInitialRoot(),
        validationErrors: [],
        validationTriggered: false,
      });
    },

    moveNode: (activeId: string, overId: string) => {
      if (activeId === overId) return;
      const { rootGroup } = get();

      if (isAncestor(rootGroup, activeId, overId)) return;

      const rootCopy = JSON.parse(JSON.stringify(rootGroup));
      const { newGroup: treeWithoutActive, node } = extractNode(
        rootCopy,
        activeId,
      );

      if (!node) return;

      const finalTree = insertNode(treeWithoutActive, overId, node);

      set({ rootGroup: finalTree });

      if (get().validationTriggered) {
        get().runValidation();
      }
    },

    importQuery: (schemaId: string, query: QueryGroup) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("querycraft-schema", schemaId);
      }
      set({
        schemaId,
        rootGroup: query,
        validationErrors: [],
        validationTriggered: false,
      });
      if (get().validationTriggered) {
        get().runValidation();
      }
    },
  };
});

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
