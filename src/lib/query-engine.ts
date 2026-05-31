import { QueryGroup, QueryRule, QueryNode, Schema } from "./types";
import { getOperatorLabel } from "./operators";

export type QueryFormat = "sql" | "mongo" | "graphql";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getFieldLabel(schema: Schema, fieldId: string): string {
  return schema.fields.find((f) => f.id === fieldId)?.label ?? fieldId;
}

function formatValue(value: unknown, type?: string): string {
  if (value === null || value === undefined || value === "") return "NULL";
  if (type === "string" || type === "enum") return `'${String(value)}'`;
  if (type === "date") return `'${String(value)}'`;
  if (Array.isArray(value)) return `(${value.map((v) => `'${v}'`).join(", ")})`;
  return String(value);
}

function getFieldType(schema: Schema, fieldId: string): string | undefined {
  return schema.fields.find((f) => f.id === fieldId)?.type;
}

// ─────────────────────────────────────────────────────────────────────────────
// SQL Generator
// ─────────────────────────────────────────────────────────────────────────────

function ruleToSQL(rule: QueryRule, schema: Schema, indent = ""): string {
  const fieldType = getFieldType(schema, rule.field);
  const field = rule.field;
  const val = rule.value;

  switch (rule.operator) {
    case "equals":
      return `${indent}${field} = ${formatValue(val, fieldType)}`;
    case "not_equals":
      return `${indent}${field} != ${formatValue(val, fieldType)}`;
    case "contains":
      return `${indent}${field} LIKE '%${val}%'`;
    case "starts_with":
      return `${indent}${field} LIKE '${val}%'`;
    case "ends_with":
      return `${indent}${field} LIKE '%${val}'`;
    case "greater_than":
      return `${indent}${field} > ${val}`;
    case "less_than":
      return `${indent}${field} < ${val}`;
    case "between": {
      const [from, to] = Array.isArray(val) ? val : [val, val];
      return `${indent}${field} BETWEEN ${formatValue(from, fieldType)} AND ${formatValue(to, fieldType)}`;
    }
    case "in_array": {
      const arr = Array.isArray(val) ? val : [val];
      return `${indent}${field} IN (${arr.map((v) => formatValue(v, fieldType)).join(", ")})`;
    }
    case "is_null":
      return `${indent}${field} IS NULL`;
    case "is_not_null":
      return `${indent}${field} IS NOT NULL`;
    case "regex":
      return `${indent}${field} REGEXP '${val}'`;
    default:
      return `${indent}${field} ${getOperatorLabel(rule.operator)} ${formatValue(val, fieldType)}`;
  }
}

function groupToSQL(group: QueryGroup, schema: Schema, depth = 0): string {
  if (group.children.length === 0) return "";

  const indent = "  ".repeat(depth);
  const conjunction = ` ${group.conjunction}\n${indent}`;

  const parts = group.children.map((child) => {
    if (child.type === "rule") {
      return ruleToSQL(child, schema, "");
    } else {
      const inner = groupToSQL(child, schema, depth + 1);
      return `(\n${indent}  ${inner}\n${indent})`;
    }
  });

  const joined = parts.join(conjunction);

  if (depth === 0) {
    return `SELECT * FROM ${schema.id}\nWHERE ${joined}`;
  }
  return joined;
}

// ─────────────────────────────────────────────────────────────────────────────
// MongoDB Generator
// ─────────────────────────────────────────────────────────────────────────────

function ruleToMongo(rule: QueryRule): Record<string, unknown> {
  const { field, operator, value } = rule;

  switch (operator) {
    case "equals":
      return { [field]: value };
    case "not_equals":
      return { [field]: { $ne: value } };
    case "contains":
      return { [field]: { $regex: String(value), $options: "i" } };
    case "starts_with":
      return { [field]: { $regex: `^${value}`, $options: "i" } };
    case "ends_with":
      return { [field]: { $regex: `${value}$`, $options: "i" } };
    case "greater_than":
      return { [field]: { $gt: value } };
    case "less_than":
      return { [field]: { $lt: value } };
    case "between": {
      const [from, to] = Array.isArray(value) ? value : [value, value];
      return { [field]: { $gte: from, $lte: to } };
    }
    case "in_array": {
      const arr = Array.isArray(value) ? value : [value];
      return { [field]: { $in: arr } };
    }
    case "is_null":
      return { [field]: null };
    case "is_not_null":
      return { [field]: { $ne: null } };
    case "regex":
      return { [field]: { $regex: String(value) } };
    default:
      return { [field]: value };
  }
}

function nodeToMongo(node: QueryNode): Record<string, unknown> {
  if (node.type === "rule") return ruleToMongo(node);

  const group = node as QueryGroup;
  if (group.children.length === 0) return {};

  const parts = group.children.map(nodeToMongo);
  const mongoOp = group.conjunction === "AND" ? "$and" : "$or";

  if (parts.length === 1) return parts[0];
  return { [mongoOp]: parts };
}

function mongoToString(obj: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  const inner = "  ".repeat(indent + 1);

  if (Array.isArray(obj)) {
    const items = obj.map((v) => `${inner}${mongoToString(v, indent + 1)}`).join(",\n");
    return `[\n${items}\n${pad}]`;
  }
  if (obj !== null && typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>)
      .map(([k, v]) => `${inner}"${k}": ${mongoToString(v, indent + 1)}`)
      .join(",\n");
    return `{\n${entries}\n${pad}}`;
  }
  if (typeof obj === "string") return `"${obj}"`;
  return String(obj);
}

// ─────────────────────────────────────────────────────────────────────────────
// GraphQL Generator
// ─────────────────────────────────────────────────────────────────────────────

function ruleToGraphQL(rule: QueryRule, schema: Schema, indent = ""): string {
  const { field, operator, value } = rule;
  const label = getFieldLabel(schema, field);

  switch (operator) {
    case "equals":
      return `${indent}${field}: { eq: ${JSON.stringify(value)} }  # ${label} equals`;
    case "not_equals":
      return `${indent}${field}: { neq: ${JSON.stringify(value)} }  # ${label} not equals`;
    case "contains":
      return `${indent}${field}: { contains: ${JSON.stringify(value)} }`;
    case "starts_with":
      return `${indent}${field}: { startsWith: ${JSON.stringify(value)} }`;
    case "ends_with":
      return `${indent}${field}: { endsWith: ${JSON.stringify(value)} }`;
    case "greater_than":
      return `${indent}${field}: { gt: ${value} }`;
    case "less_than":
      return `${indent}${field}: { lt: ${value} }`;
    case "between": {
      const [from, to] = Array.isArray(value) ? value : [value, value];
      return `${indent}${field}: { gte: ${from}, lte: ${to} }`;
    }
    case "in_array": {
      const arr = Array.isArray(value) ? value : [value];
      return `${indent}${field}: { in: [${arr.map((v) => JSON.stringify(v)).join(", ")}] }`;
    }
    case "is_null":
      return `${indent}${field}: { isNull: true }`;
    case "is_not_null":
      return `${indent}${field}: { isNull: false }`;
    case "regex":
      return `${indent}${field}: { regex: ${JSON.stringify(value)} }`;
    default:
      return `${indent}${field}: { ${operator}: ${JSON.stringify(value)} }`;
  }
}

function groupToGraphQL(group: QueryGroup, schema: Schema, depth = 0): string {
  if (group.children.length === 0) return "";

  const parts = group.children.map((child) => {
    if (child.type === "rule") {
      const ruleIndent = " ".repeat(6 + depth * 2);
      return ruleToGraphQL(child, schema, ruleIndent);
    } else {
      const groupIndent = " ".repeat(6 + depth * 2);
      const childGroup = child as QueryGroup;
      const subConjunction = childGroup.conjunction.toLowerCase();
      const inner = groupToGraphQL(childGroup, schema, depth + 1);
      return `${groupIndent}${subConjunction}: {\n${inner}\n${groupIndent}}`;
    }
  });

  if (depth === 0) {
    return `query {\n  ${schema.id}(\n    filter: {\n${parts.join("\n")}\n    }\n  ) {\n    id\n  }\n}`;
  }
  return parts.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export function generateQuery(
  rootGroup: QueryGroup,
  schema: Schema,
  format: QueryFormat
): string {
  if (rootGroup.children.length === 0) {
    if (format === "sql") {
      return `SELECT * FROM ${schema.id}`;
    }
    if (format === "mongo") {
      return `{}`;
    }
    return `query {\n  ${schema.id} {\n    id\n  }\n}`;
  }

  if (format === "sql") return groupToSQL(rootGroup, schema);
  if (format === "mongo") return mongoToString(nodeToMongo(rootGroup));
  return groupToGraphQL(rootGroup, schema);
}
