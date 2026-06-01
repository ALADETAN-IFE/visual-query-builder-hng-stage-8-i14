"use client";

import { useState, useEffect } from "react";
import {
  Database,
  Sparkles,
  Sun,
  Moon,
  FolderOpen,
  ArrowRight,
  Download,
  Trash2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SchemaSelector from "@/components/query-builder/SchemaSelector";
import QueryBuilder from "@/components/query-builder/QueryBuilder";
import QueryPreview from "@/components/query-builder/QueryPreview";
import ResultsTable from "@/components/query-builder/ResultsTable";
import QueryJSONModal from "@/components/query-builder/QueryJSONModal";
import { useQueryStore } from "@/store/query-store";
import { usePresetsStore } from "@/store/presets-store";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { QueryGroup } from "@/lib/types";

function countRules(group: QueryGroup): number {
  let count = 0;
  for (const child of group.children) {
    if (child.type === "rule") {
      count++;
    } else {
      count += countRules(child);
    }
  }
  return count;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const presets = usePresetsStore((state) => state.presets);
  const deletePreset = usePresetsStore((state) => state.deletePreset);

  const schemaId = useQueryStore((state) => state.schemaId);
  const setSchemaId = useQueryStore((state) => state.setSchemaId);
  const rootGroup = useQueryStore((state) => state.rootGroup);
  const importQuery = useQueryStore((state) => state.importQuery);

  const [isJSONModalOpen, setIsJSONModalOpen] = useState(false);
  const [jsonModalTab, setJsonModalTab] = useState<"export" | "import">("export");

  useKeyboardShortcuts();

  useEffect(() => {
    // Load persisted theme
    const savedTheme = localStorage.getItem("querycraft-theme") as
      | "dark"
      | "light";
    if (savedTheme) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }

    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("querycraft-theme", nextTheme);
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
        {!mounted ? (
          <div className="flex flex-col gap-6 w-full">
            {/* Schema Selector Skeleton */}
            <div className="w-full rounded-xl border border-border-default bg-bg-surface p-4 shadow-sm h-18.5 flex items-center justify-between gap-4 max-[750px]:flex-col max-[750px]:items-start max-[750px]:h-auto">
              <div className="flex items-center min-w-0 gap-4 flex-1 w-full">
                <div className="h-8 w-24 skeleton" />
                <div className="h-8 w-64 skeleton" />
              </div>
              <div className="h-10 w-96 skeleton hidden md:block" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 flex flex-col gap-4">
                {/* Query Builder Skeleton */}
                <div className="w-full rounded-xl border border-border-default bg-bg-surface p-5 shadow-sm h-62.5 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-border-default pb-3">
                    <div className="h-7 w-32 skeleton" />
                    <div className="h-7 w-20 skeleton" />
                  </div>
                  <div className="h-24 w-full skeleton" />
                </div>

                {/* Results Table Skeleton */}
                <div className="w-full rounded-xl border border-border-default bg-bg-surface p-5 shadow-sm h-80 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-border-default pb-3">
                    <div className="h-6 w-40 skeleton" />
                    <div className="h-8 w-24 skeleton" />
                  </div>
                  <div className="h-48 w-full skeleton" />
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {/* Query Preview Skeleton */}
                <div className="w-full rounded-xl border border-border-default bg-bg-surface p-5 shadow-sm h-70 flex flex-col gap-4">
                  <div className="h-6 w-32 skeleton" />
                  <div className="h-44 w-full skeleton" />
                </div>

                {/* Presets Skeleton */}
                <div className="w-full rounded-xl border border-border-default bg-bg-surface p-5 shadow-sm h-45 flex flex-col gap-4">
                  <div className="h-6 w-32 skeleton" />
                  <div className="h-24 w-full skeleton" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
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
                        onClick={() => {
                          setJsonModalTab("export");
                          setIsJSONModalOpen(true);
                        }}
                      >
                        Export
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<FolderOpen className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setJsonModalTab("import");
                          setIsJSONModalOpen(true);
                        }}
                      >
                        Load Preset
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {presets.length === 0 ? (
                      <div className="text-center py-6 px-4 border border-dashed border-border-default rounded-lg bg-bg-inset/30">
                        <p className="text-xs text-text-tertiary">No saved presets yet.</p>
                      </div>
                    ) : (
                      presets.map((preset) => (
                        <div
                          key={preset.id}
                          className="group/item flex justify-between items-center p-2.5 bg-bg-elevated hover:bg-bg-inset transition-colors rounded-lg border border-border-default cursor-pointer"
                          onClick={() => importQuery(preset.schemaId, preset.query)}
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-semibold block text-text-primary truncate">
                              {preset.title}
                            </span>
                            <span className="text-[0.625rem] text-text-tertiary">
                              {preset.schemaId} schema • {countRules(preset.query)} rule{countRules(preset.query) === 1 ? "" : "s"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={preset.schemaId === "users" ? "sql" : preset.schemaId === "orders" ? "mongo" : "graphql"}>
                              {preset.schemaId.toUpperCase()}
                            </Badge>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePreset(preset.id);
                              }}
                              className="opacity-0 group-hover/item:opacity-100 p-1 rounded hover:bg-accent-danger/10 text-text-tertiary hover:text-accent-danger transition-all cursor-pointer"
                              aria-label={`Delete preset ${preset.title}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
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

      <QueryJSONModal
        isOpen={isJSONModalOpen}
        onClose={() => setIsJSONModalOpen(false)}
        currentQuery={rootGroup}
        currentSchemaId={schemaId}
        onImport={importQuery}
        initialTab={jsonModalTab}
      />
    </div>
  );
}
