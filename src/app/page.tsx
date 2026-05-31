"use client";

import { useState } from "react";
import {
  Database,
  Sparkles,
  Play,
  Sun,
  Moon,
  FolderOpen,
  ArrowRight,
  Download,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SchemaSelector from "@/components/query-builder/SchemaSelector";
import QueryBuilder from "@/components/query-builder/QueryBuilder";
import QueryPreview from "@/components/query-builder/QueryPreview";
import ResultsTable from "@/components/query-builder/ResultsTable";
import { useQueryStore } from "@/store/query-store";
import { downloadFile } from "@/lib/utils";

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const schemaId = useQueryStore((state) => state.schemaId);
  const setSchemaId = useQueryStore((state) => state.setSchemaId);
  const runValidation = useQueryStore((state) => state.runValidation);
  const rootGroup = useQueryStore((state) => state.rootGroup);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("querycraft-theme", nextTheme);
  };

  const handleExport = () => {
    const payload = JSON.stringify({ schemaId, query: rootGroup }, null, 2);
    downloadFile(payload, `querycraft-${schemaId}-${Date.now()}.json`);
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-bg-primary text-text-primary">
      <header className="sticky top-0 z-50 glass border-b border-border-default">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-inverse"
              style={{ backgroundColor: "var(--accent-primary)" }}
            >
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">QueryCraft</h1>
              <p className="text-[0.6875rem] text-text-tertiary -mt-0.5">
                Visual Query Builder & Simulator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-secondary/10 text-accent-secondary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Workspace</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-9 h-9 p-0 flex items-center justify-center rounded-lg border border-border-default"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-text-primary" />
              ) : (
                <Moon className="w-4 h-4 text-text-primary" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        <SchemaSelector
          selectedSchemaId={schemaId}
          onSchemaChange={setSchemaId}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <QueryBuilder />

            <ResultsTable schemaId={schemaId} rootGroup={rootGroup} />
          </div>

          <div className="flex flex-col gap-6">
            <QueryPreview />

            <div className="panel p-5">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-border-default pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                  Saved Presets
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Download className="w-3.5 h-3.5" />}
                    onClick={handleExport}
                  >
                    Export
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<FolderOpen className="w-3.5 h-3.5" />}
                  >
                    Load Preset
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center p-2.5 bg-bg-elevated hover:bg-bg-inset transition-colors rounded-lg border border-border-default cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold block text-text-primary">
                      Adult Active Users
                    </span>
                    <span className="text-[0.625rem] text-text-tertiary">
                      users schema • 2 rules
                    </span>
                  </div>
                  <Badge variant="sql">SQL</Badge>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-bg-elevated hover:bg-bg-inset transition-colors rounded-lg border border-border-default cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold block text-text-primary">
                      Premium Customers
                    </span>
                    <span className="text-[0.625rem] text-text-tertiary">
                      orders schema • 3 rules
                    </span>
                  </div>
                  <Badge variant="mongo">MONGO</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border-default bg-bg-surface/90 backdrop-blur px-6 py-4 mt-12">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-text-tertiary">
          <div className="flex items-center gap-2 text-text-primary">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border-default bg-bg-elevated">
              <Sparkles className="h-3.5 w-3.5 text-accent-secondary" />
            </span>
            <span className="font-semibold tracking-wide">QueryCraft</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-[0.28em]">
              Sharper queries, cleaner workflows
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-accent-secondary" />
          </div>
        </div>
      </footer>
    </div>
  );
}
