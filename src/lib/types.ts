export type FieldType = "string" | "number" | "enum" | "date" | "boolean";

export type Operator =
  | "equals"
  | "not_equals"
  | "contains"
  | "starts_with"
  | "ends_with"
  | "greater_than"
  | "less_than"
  | "between"
  | "in_array"
  | "is_null"
  | "is_not_null"
  | "regex";

export interface OperatorDefinition {
  value: Operator;
  label: string;
  symbol: string;
  types: FieldType[]; // Which field types support this operator
}

export interface SchemaField {
  id: string; // e.g. "age"
  label: string; // e.g. "Age"
  type: FieldType;
  placeholder?: string;
  options?: { value: string; label: string }[]; // For enum fields
  defaultValue?: string | number | boolean;
}

export interface Schema {
  id: string; // e.g. "users"
  label: string; // e.g. "Users Table"
  description: string;
  fields: SchemaField[];
}

export type LogicalOperator = "AND" | "OR";

export interface QueryRule {
  id: string;
  type: "rule";
  field: string;
  operator: Operator;
  value: unknown; // Can be string, number, array, boolean, etc.
}

export interface QueryGroup {
  id: string;
  type: "group";
  conjunction: LogicalOperator;
  children: (QueryRule | QueryGroup)[];
  collapsed?: boolean;
}

export type QueryNode = QueryRule | QueryGroup;

export interface ValidationError {
  nodeId: string;
  field?: string;
  message: string;
}
