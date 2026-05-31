"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { QueryRule as QueryRuleType, Schema, SchemaField } from "@/lib/types";
import { getOperatorsForType } from "@/lib/operators";
import { getNodeError } from "@/store/query-store";
import { useQueryStore } from "@/store/query-store";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";

interface QueryRuleProps {
  rule: QueryRuleType;
  schema: Schema;
}

const VALUELESS_OPERATORS = new Set(["is_null", "is_not_null"]);

function getDefaultValue(field: SchemaField): unknown {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.type === "boolean") return "true";
  if (field.type === "number") return "";
  return "";
}

export default function QueryRule({ rule, schema }: QueryRuleProps) {
  const validationErrors = useQueryStore((state) => state.validationErrors);
  const updateRule = useQueryStore((state) => state.updateRule);
  const removeNode = useQueryStore((state) => state.removeNode);

  const field = schema.fields.find((item) => item.id === rule.field) ?? schema.fields[0];
  const operators = getOperatorsForType(field.type);

  const fieldError = getNodeError(validationErrors, rule.id, "field");
  const operatorError = getNodeError(validationErrors, rule.id, "operator");
  const valueError = getNodeError(validationErrors, rule.id, "value");

  const handleFieldChange = (fieldId: string) => {
    const nextField = schema.fields.find((item) => item.id === fieldId);
    if (!nextField) return;

    const nextOperators = getOperatorsForType(nextField.type);
    updateRule(rule.id, {
      field: fieldId,
      operator: nextOperators[0]?.value ?? "equals",
      value: getDefaultValue(nextField),
    });
  };

  const handleOperatorChange = (operator: string) => {
    const nextOperator = operator as QueryRuleType["operator"];
    const updates: Partial<QueryRuleType> = { operator: nextOperator };

    if (VALUELESS_OPERATORS.has(nextOperator)) {
      updates.value = null;
    } else if (nextOperator === "between") {
      updates.value = ["", ""];
    } else if (nextOperator === "in_array") {
      updates.value = "";
    } else if (rule.value === null || Array.isArray(rule.value)) {
      updates.value = getDefaultValue(field);
    }

    updateRule(rule.id, updates);
  };

  const renderValueInput = () => {
    if (VALUELESS_OPERATORS.has(rule.operator)) {
      return (
        <span className="text-xs text-text-tertiary italic px-2 py-1">
          No value needed
        </span>
      );
    }

    if (rule.operator === "between") {
      const values = Array.isArray(rule.value) ? rule.value : ["", ""];
      return (
        <div className="flex items-center gap-2">
          <Input
            className="w-24 bg-bg-surface"
            inputSize="sm"
            type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
            value={String(values[0] ?? "")}
            placeholder="Min"
            error={valueError}
            onChange={(event) =>
              updateRule(rule.id, {
                value: [event.target.value, values[1] ?? ""],
              })
            }
          />
          <span className="text-xs text-text-tertiary">and</span>
          <Input
            className="w-24 bg-bg-surface"
            inputSize="sm"
            type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
            value={String(values[1] ?? "")}
            placeholder="Max"
            onChange={(event) =>
              updateRule(rule.id, {
                value: [values[0] ?? "", event.target.value],
              })
            }
          />
        </div>
      );
    }

    if (field.type === "enum" && field.options) {
      return (
        <Select
          className="w-36 bg-bg-surface"
          size="sm"
          error={!!valueError}
          value={String(rule.value ?? "")}
          options={field.options}
          onChange={(event) => updateRule(rule.id, { value: event.target.value })}
        />
      );
    }

    if (field.type === "boolean") {
      return (
        <Select
          className="w-28 bg-bg-surface"
          size="sm"
          error={!!valueError}
          value={String(rule.value ?? "true")}
          options={[
            { value: "true", label: "True" },
            { value: "false", label: "False" },
          ]}
          onChange={(event) => updateRule(rule.id, { value: event.target.value })}
        />
      );
    }

    if (rule.operator === "in_array") {
      return (
        <Input
          className="min-w-40 bg-bg-surface"
          inputSize="sm"
          type="text"
          value={Array.isArray(rule.value) ? rule.value.join(", ") : String(rule.value ?? "")}
          placeholder="Comma-separated values"
          error={valueError}
          onChange={(event) => updateRule(rule.id, { value: event.target.value })}
        />
      );
    }

    return (
      <Input
        className="w-32 bg-bg-surface"
        inputSize="sm"
        type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
        value={String(rule.value ?? "")}
        placeholder={field.placeholder}
        error={valueError}
        onChange={(event) => {
          const raw = event.target.value;
          updateRule(rule.id, {
            value: field.type === "number" && raw !== "" ? Number(raw) : raw,
          });
        }}
      />
    );
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 bg-bg-elevated p-3 rounded-lg border transition-all duration-150 animate-fade-in",
        valueError || fieldError || operatorError
          ? "border-accent-danger/40"
          : "border-border-default"
      )}
    >
      <Select
        className="w-40 bg-bg-surface"
        size="sm"
        error={!!fieldError}
        value={rule.field}
        options={schema.fields.map((item) => ({
          value: item.id,
          label: item.label,
        }))}
        onChange={(event) => handleFieldChange(event.target.value)}
      />

      <Select
        className="w-44 bg-bg-surface"
        size="sm"
        error={!!operatorError}
        value={rule.operator}
        options={operators.map((op) => ({
          value: op.value,
          label: `${op.label} (${op.symbol})`,
        }))}
        onChange={(event) => handleOperatorChange(event.target.value)}
      />

      {renderValueInput()}

      <Button
        variant="ghost"
        size="sm"
        className="ml-auto text-text-tertiary hover:text-accent-danger"
        aria-label="Remove rule"
        onClick={() => removeNode(rule.id)}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
