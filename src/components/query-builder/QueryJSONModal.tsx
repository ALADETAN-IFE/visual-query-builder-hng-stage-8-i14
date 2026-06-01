"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Copy,
  Check,
  Download,
  Upload,
  AlertCircle,
  Code,
  FileText,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { QueryGroup } from "@/lib/types";
import { downloadFile } from "@/lib/utils";

interface QueryJSONModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuery: QueryGroup;
  currentSchemaId: string;
  onImport: (schemaId: string, query: QueryGroup) => void;
  initialTab?: "export" | "import";
}

export default function QueryJSONModal({
  isOpen,
  onClose,
  currentQuery,
  currentSchemaId,
  onImport,
  initialTab = "export",
}: QueryJSONModalProps) {
  const [activeTab, setActiveTab] = useState<"export" | "import">(initialTab);
  const [jsonText, setJsonText] = useState("");
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "Unknown error.";
  };

  // Sync state when open or when active tab changes
  useEffect(() => {
    if (isOpen) {
      if (activeTab === "export") {
        const payload = JSON.stringify(
          { schemaId: currentSchemaId, query: currentQuery },
          null,
          2,
        );
        Promise.resolve().then(() => {
          setJsonText(payload);
          setValidationError(null);
        });
      } else {
        // If switching to import and it's empty, set a placeholder schema template
        if (!jsonText || jsonText.includes(currentSchemaId)) {
          const template = {
            schemaId: currentSchemaId,
            query: {
              id: "root",
              type: "group",
              logicalOperator: "AND",
              children: [],
              collapsed: false,
            },
          };
          Promise.resolve().then(() => {
            setJsonText(JSON.stringify(template, null, 2));
            setValidationError(null);
          });
        }
      }
    }
  }, [isOpen, activeTab, currentQuery, currentSchemaId]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy JSON to clipboard.");
    }
  };

  const handleDownload = () => {
    try {
      // Validate before download (optional, but good practice)
      JSON.parse(jsonText);
      downloadFile(
        jsonText,
        `querycraft-${currentSchemaId}-${Date.now()}.json`,
      );
    } catch (error: unknown) {
      setValidationError(`Invalid JSON structure: ${getErrorMessage(error)}`);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        // Check if valid JSON
        JSON.parse(content);
        setJsonText(content);
        setValidationError(null);
      } catch (error: unknown) {
        setValidationError(
          `Failed to parse file JSON: ${getErrorMessage(error)}`,
        );
      }
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset
  };

  const handleTextAreaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      // Insert 2 spaces
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      setJsonText(newValue);
      setValidationError(null);

      // Defer resetting selection to prevent rendering race
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleApplyImport = () => {
    try {
      const data = JSON.parse(jsonText);

      // Validate structure
      if (!data || typeof data !== "object") {
        throw new Error("JSON must be a valid object.");
      }
      if (!data.schemaId || typeof data.schemaId !== "string") {
        throw new Error("JSON must contain a valid string 'schemaId'.");
      }
      if (
        !data.query ||
        typeof data.query !== "object" ||
        data.query.type !== "group"
      ) {
        throw new Error("JSON must contain a valid query group object.");
      }

      // Check schemaId exists
      const validSchemas = ["users", "products", "orders"];
      if (!validSchemas.includes(data.schemaId)) {
        throw new Error(
          `Unsupported schemaId: '${data.schemaId}'. Must be one of: ${validSchemas.join(", ")}`,
        );
      }

      onImport(data.schemaId, data.query);
      onClose();
    } catch (error: unknown) {
      setValidationError(getErrorMessage(error) || "Invalid JSON structure.");
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-bg-surface border border-border-default rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-accent-primary" />
            <h2
              id="modal-title"
              className="text-base font-bold text-text-primary"
            >
              JSON Workspace
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-default bg-bg-inset/40 p-1">
          <button
            onClick={() => {
              setActiveTab("export");
              setValidationError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "export"
                ? "bg-bg-surface text-text-primary shadow-sm"
                : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Preview & Export</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("import");
              setValidationError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "import"
                ? "bg-bg-surface text-text-primary shadow-sm"
                : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Edit & Import</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto min-h-0">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="json-editor-textarea"
              className="text-xs font-bold text-text-secondary uppercase tracking-wider"
            >
              {activeTab === "export"
                ? "Generated Query JSON"
                : "Paste or upload JSON query"}
            </label>
            <p className="text-[0.6875rem] text-text-tertiary">
              {activeTab === "export"
                ? "You can view, edit, or copy the live representation of your query builder tree."
                : "Import a JSON query schema file or edit template below to load custom structures."}
            </p>
          </div>

          <div className="relative flex-1 min-h-62.5 flex flex-col font-mono text-xs rounded-lg border border-border-default overflow-hidden bg-bg-inset">
            <textarea
              id="json-editor-textarea"
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setValidationError(null);
              }}
              onKeyDown={handleTextAreaKeyDown}
              placeholder='{ "schemaId": "users", "query": { ... } }'
              className="w-full flex-1 p-4 bg-transparent text-text-primary resize-none outline-none overflow-y-auto leading-relaxed"
              spellCheck="false"
            />
          </div>

          {/* Validation Error Message */}
          {validationError && (
            <div className="flex items-start gap-2.5 rounded-lg border border-accent-danger/20 bg-accent-danger/10 px-4 py-3 text-xs text-accent-danger animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Validation Error</span>
                <p className="mt-0.5 leading-relaxed font-mono text-[0.6875rem]">
                  {validationError}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-default bg-bg-inset/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {activeTab === "import" && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Upload className="w-3.5 h-3.5" />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload File
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              icon={
                copied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )
              }
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleDownload}
            >
              Download
            </Button>
          </div>

          <div className="flex gap-2 ml-auto">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            {activeTab === "import" ? (
              <Button variant="primary" size="sm" onClick={handleApplyImport}>
                Import Query
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={handleApplyImport}>
                Apply Changes
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
