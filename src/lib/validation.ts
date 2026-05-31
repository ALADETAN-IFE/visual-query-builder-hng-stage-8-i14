import {
  FieldType,
  Operator,
  QueryGroup,
  QueryRule,
  Schema,
  ValidationError,
} from "./types";
import { getOperatorsForType } from "./operators";

const VALUELESS_OPERATORS: Operator[] = ["is_null", "is_not_null"];

function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  return false;
}

function validateBetweenValue(
  ruleId: string,
  value: unknown
): ValidationError[] {
  const values = Array.isArray(value) ? value : [value];
  if (values.length < 2 || isEmptyValue(values[0]) || isEmptyValue(values[1])) {
    return [
      {
        nodeId: ruleId,
        field: "value",
        message: "Between requires two values",
      },
    ];
  }
  return [];
}

function validateTypedValue(
  ruleId: string,
  value: unknown,
  fieldType: FieldType,
  fieldLabel: string,
  operator: Operator
): ValidationError[] {
  if (VALUELESS_OPERATORS.includes(operator)) {
    return [];
  }

  if (operator === "between") {
    return validateBetweenValue(ruleId, value);
  }

  if (operator === "in_array") {
    const list = Array.isArray(value)
      ? value
      : String(value ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    if (list.length === 0) {
      return [
        {
          nodeId: ruleId,
          field: "value",
          message: "In list requires at least one value",
        },
      ];
    }
    return [];
  }

  if (isEmptyValue(value)) {
    return [
      {
        nodeId: ruleId,
        field: "value",
        message: `Value is required for ${fieldLabel}`,
      },
    ];
  }

  if (fieldType === "number") {
    const num = Number(value);
    if (Number.isNaN(num)) {
      return [
        {
          nodeId: ruleId,
          field: "value",
          message: "Must be a valid number",
        },
      ];
    }
  }

  if (fieldType === "date") {
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) {
      return [
        {
          nodeId: ruleId,
          field: "value",
          message: "Must be a valid date",
        },
      ];
    }
  }

  if (fieldType === "boolean") {
    if (value !== true && value !== false && value !== "true" && value !== "false") {
      return [
        {
          nodeId: ruleId,
          field: "value",
          message: "Must be true or false",
        },
      ];
    }
  }

  return [];
}

export function validateRule(rule: QueryRule, schema: Schema): ValidationError[] {
  const errors: ValidationError[] = [];
  const field = schema.fields.find((item) => item.id === rule.field);

  if (!field) {
    errors.push({
      nodeId: rule.id,
      field: "field",
      message: "Invalid field selected",
    });
    return errors;
  }

  const validOperators = getOperatorsForType(field.type).map((op) => op.value);
  if (!validOperators.includes(rule.operator)) {
    errors.push({
      nodeId: rule.id,
      field: "operator",
      message: `Operator not valid for ${field.label}`,
    });
  }

  errors.push(
    ...validateTypedValue(rule.id, rule.value, field.type, field.label, rule.operator)
  );

  return errors;
}

export function validateQueryTree(
  group: QueryGroup,
  schema: Schema
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (group.children.length === 0) {
    errors.push({
      nodeId: group.id,
      message: "Group must contain at least one rule or subgroup",
    });
  }

  for (const child of group.children) {
    if (child.type === "rule") {
      errors.push(...validateRule(child, schema));
    } else {
      errors.push(...validateQueryTree(child, schema));
    }
  }

  return errors;
}

export function hasValidationErrors(errors: ValidationError[]): boolean {
  return errors.length > 0;
}
