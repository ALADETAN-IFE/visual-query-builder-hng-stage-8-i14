import { QueryGroup, QueryRule } from "./types";
import { MOCK_DATA, MockRecord } from "./mock-data";
import { getSchemaById } from "./schemas";

function evaluateRule(
  rule: QueryRule,
  record: MockRecord,
  schemaId: string,
): boolean {
  const schema = getSchemaById(schemaId);
  if (!schema) return false;

  const fieldDef = schema.fields.find((f) => f.id === rule.field);
  if (!fieldDef) return false;

  const recordValue = record[rule.field];
  const ruleValue = rule.value;
  const fieldType = fieldDef.type;

  // Null check operators can evaluate even if recordValue is null/undefined
  if (rule.operator === "is_null") {
    return (
      recordValue === null || recordValue === undefined || recordValue === ""
    );
  }
  if (rule.operator === "is_not_null") {
    return (
      recordValue !== null && recordValue !== undefined && recordValue !== ""
    );
  }

  // If record value is missing, other operators should return false
  if (recordValue === null || recordValue === undefined) {
    return false;
  }

  // Normalize types for comparison
  const normalize = (val: unknown) => {
    if (fieldType === "number") {
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    }
    if (fieldType === "boolean") {
      return val === true || String(val) === "true" || String(val) === "1";
    }
    if (fieldType === "date") {
      // Coerce to string then parse to avoid narrowing issues with unknown
      return new Date(String(val)).getTime();
    }
    return String(val).toLowerCase(); // Case-insensitive comparison for strings
  };

  const normRecordVal = normalize(recordValue);

  switch (rule.operator) {
    case "equals": {
      const normRuleVal = normalize(ruleValue);
      return normRecordVal === normRuleVal;
    }
    case "not_equals": {
      const normRuleVal = normalize(ruleValue);
      return normRecordVal !== normRuleVal;
    }
    case "contains": {
      const recStr = String(recordValue).toLowerCase();
      const ruleStr = String(ruleValue).toLowerCase();
      return recStr.includes(ruleStr);
    }
    case "starts_with": {
      const recStr = String(recordValue).toLowerCase();
      const ruleStr = String(ruleValue).toLowerCase();
      return recStr.startsWith(ruleStr);
    }
    case "ends_with": {
      const recStr = String(recordValue).toLowerCase();
      const ruleStr = String(ruleValue).toLowerCase();
      return recStr.endsWith(ruleStr);
    }
    case "greater_than": {
      const normRuleVal = normalize(ruleValue);
      return normRecordVal > normRuleVal;
    }
    case "less_than": {
      const normRuleVal = normalize(ruleValue);
      return normRecordVal < normRuleVal;
    }
    case "between": {
      const arr = Array.isArray(ruleValue) ? ruleValue : [ruleValue, ruleValue];
      const from = normalize(arr[0]);
      const to = normalize(arr[1]);
      return normRecordVal >= from && normRecordVal <= to;
    }
    case "in_array": {
      const rawArr = Array.isArray(ruleValue)
        ? ruleValue
        : String(ruleValue ?? "")
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);

      return rawArr.some((v) => {
        const normalizedV = normalize(v);
        if (typeof normRecordVal === "string") {
          return normRecordVal.includes(String(normalizedV));
        }
        return normRecordVal === normalizedV;
      });
    }
    case "regex": {
      try {
        const regex = new RegExp(String(ruleValue), "i");
        return regex.test(String(recordValue));
      } catch {
        return false; // Invalid regex returns false
      }
    }
    default:
      return false;
  }
}

function evaluateGroup(
  group: QueryGroup,
  record: MockRecord,
  schemaId: string,
): boolean {
  if (group.children.length === 0) return true; // Empty group matches everything

  if (group.logicalOperator === "AND") {
    return group.children.every((child) => {
      if (child.type === "rule") {
        return evaluateRule(child, record, schemaId);
      }
      return evaluateGroup(child as QueryGroup, record, schemaId);
    });
  } else {
    return group.children.some((child) => {
      if (child.type === "rule") {
        return evaluateRule(child, record, schemaId);
      }
      return evaluateGroup(child as QueryGroup, record, schemaId);
    });
  }
}

export function runQuerySimulator(
  rootGroup: QueryGroup,
  schemaId: string,
): MockRecord[] {
  const records = MOCK_DATA[schemaId] || [];
  return records.filter((rec) => evaluateGroup(rootGroup, rec, schemaId));
}
