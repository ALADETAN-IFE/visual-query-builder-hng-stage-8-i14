import { OperatorDefinition, FieldType, Operator } from "./types";

export const OPERATOR_DEFINITIONS: OperatorDefinition[] = [
  { value: "equals", label: "Equals", symbol: "=", types: ["string", "number", "enum", "date", "boolean"] },
  { value: "not_equals", label: "Does Not Equal", symbol: "!=", types: ["string", "number", "enum", "date", "boolean"] },
  { value: "contains", label: "Contains", symbol: "LIKE %...%", types: ["string"] },
  { value: "starts_with", label: "Starts With", symbol: "LIKE ...%", types: ["string"] },
  { value: "ends_with", label: "Ends With", symbol: "LIKE %...", types: ["string"] },
  { value: "greater_than", label: "Greater Than", symbol: ">", types: ["number", "date"] },
  { value: "less_than", label: "Less Than", symbol: "<", types: ["number", "date"] },
  { value: "between", label: "Between", symbol: "BETWEEN", types: ["number", "date"] },
  { value: "in_array", label: "In List", symbol: "IN (...)", types: ["enum", "string", "number"] },
  { value: "is_null", label: "Is Empty / Null", symbol: "IS NULL", types: ["string", "number", "date"] },
  { value: "is_not_null", label: "Is Defined / Not Null", symbol: "IS NOT NULL", types: ["string", "number", "date"] },
  { value: "regex", label: "Matches Regex", symbol: "REGEX", types: ["string"] },
];

export function getOperatorsForType(type: FieldType): OperatorDefinition[] {
  return OPERATOR_DEFINITIONS.filter((op) => op.types.includes(type));
}

export function getOperatorSymbol(opValue: Operator): string {
  const op = OPERATOR_DEFINITIONS.find((o) => o.value === opValue);
  return op ? op.symbol : String(opValue);
}

export function getOperatorLabel(opValue: Operator): string {
  const op = OPERATOR_DEFINITIONS.find((o) => o.value === opValue);
  return op ? op.label : String(opValue);
}
