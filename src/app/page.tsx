"use client";

import { useState } from "react";
import {
  Database,
  Sparkles,
  Play,
  Copy,
  Sun,
  Moon,
  FolderOpen,
  Check,
  ArrowRight,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SchemaSelector from "@/components/query-builder/SchemaSelector";
import QueryBuilder from "@/components/query-builder/QueryBuilder";
import { useQueryStore } from "@/store/query-store";
import { copyToClipboard } from "@/lib/utils";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"sql" | "mongo" | "graphql">(
    "sql",
  );
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [copied, setCopied] = useState(false);
  const schemaId = useQueryStore((state) => state.schemaId);
  const setSchemaId = useQueryStore((state) => state.setSchemaId);
  const runValidation = useQueryStore((state) => state.runValidation);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("querycraft-theme", nextTheme);
  };

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getQueryString = () => {
    if (activeTab === "sql") {
      return `SELECT * FROM users\nWHERE age > 18\nAND status = 'active'`;
    }
    if (activeTab === "mongo") {
      return `{\n  "age": { "$gt": 18 },\n  "status": "active"\n}`;
    }
    return `{\n  filter: {\n    age: { gt: 18 }\n    status: "active"\n  }\n}`;
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

            {/* Simulated execution panel placeholder */}
            <div className="panel p-5 animate-fade-in">
              <div className="flex justify-between items-center pb-4 border-b border-border-default mb-4 max-[500px]:flex-col max-[500px]:items-end max-[500px]:gap-3">
                <div className="flex items-center gap-2 max-[500px]:w-full">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                    Execution Results
                  </h3>
                  <Badge
                    variant="success"
                    className="px-3 py-1 text-[0.75rem] normal-case"
                  >
                    24 MATCHES
                  </Badge>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-accent-primary flex items-center h-9"
                  icon={<Play className="w-3.5 h-3.5 text-text-inverse mr-1" />}
                  onClick={runValidation}
                >
                  Run Query
                </Button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border-default">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-bg-elevated text-text-secondary border-b border-border-default">
                      <th className="p-3 font-semibold">ID</th>
                      <th className="p-3 font-semibold">Name</th>
                      <th className="p-3 font-semibold">Age</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">Country</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border-default last:border-0 hover:bg-bg-elevated/40">
                      <td className="p-3 font-mono">1</td>
                      <td className="p-3 font-medium">Chidi Benson</td>
                      <td className="p-3">24</td>
                      <td className="p-3">
                        <Badge
                          variant="success"
                          className="px-3 py-1 text-[0.75rem]"
                        >
                          active
                        </Badge>
                      </td>
                      <td className="p-3">Nigeria</td>
                    </tr>
                    <tr className="border-b border-border-default last:border-0 hover:bg-bg-elevated/40">
                      <td className="p-3 font-mono">2</td>
                      <td className="p-3 font-medium">Amara Okafor</td>
                      <td className="p-3">31</td>
                      <td className="p-3">
                        <Badge variant="success">active</Badge>
                      </td>
                      <td className="p-3">Nigeria</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="panel p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-default">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                  Live Preview
                </h3>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setActiveTab("sql")}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      activeTab === "sql"
                        ? "bg-accent-primary text-text-inverse shadow-sm"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    SQL
                  </button>
                  <button
                    onClick={() => setActiveTab("mongo")}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      activeTab === "mongo"
                        ? "bg-accent-primary text-text-inverse shadow-sm"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    MongoDB
                  </button>
                  <button
                    onClick={() => setActiveTab("graphql")}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      activeTab === "graphql"
                        ? "bg-accent-primary text-text-inverse shadow-sm"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    GraphQL
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="query-preview h-48 select-all">
                  {activeTab === "sql" && (
                    <>
                      <span className="token-keyword">SELECT</span> *{" "}
                      <span className="token-keyword">FROM</span> users{"\n"}
                      <span className="token-keyword">WHERE</span> age &gt;{" "}
                      <span className="token-number">18</span>
                      {"\n"}
                      <span className="token-keyword">AND</span> status ={" "}
                      <span className="token-string">&apos;active&apos;</span>
                    </>
                  )}
                  {activeTab === "mongo" && (
                    <>
                      <span className="token-punctuation">{"{"}</span>
                      {"\n"}
                      {"  "}
                      <span className="token-field">&quot;age&quot;</span>
                      <span className="token-punctuation">:</span>{" "}
                      <span className="token-punctuation">{"{"}</span>{" "}
                      <span className="token-keyword">&quot;$gt&quot;</span>
                      <span className="token-punctuation">:</span>{" "}
                      <span className="token-number">18</span>{" "}
                      <span className="token-punctuation">{"}"}</span>
                      <span className="token-punctuation">,</span>
                      {"\n"}
                      {"  "}
                      <span className="token-field">&quot;status&quot;</span>
                      <span className="token-punctuation">:</span>{" "}
                      <span className="token-string">&quot;active&quot;</span>
                      {"\n"}
                      <span className="token-punctuation">{"}"}</span>
                    </>
                  )}
                  {activeTab === "graphql" && (
                    <>
                      <span className="token-punctuation">{"{"}</span>
                      {"\n"}
                      {"  "}filter<span className="token-punctuation">:</span>{" "}
                      <span className="token-punctuation">{"{"}</span>
                      {"\n"}
                      {"    "}age<span className="token-punctuation">:</span>{" "}
                      <span className="token-punctuation">{"{"}</span> gt
                      <span className="token-punctuation">:</span>{" "}
                      <span className="token-number">18</span>{" "}
                      <span className="token-punctuation">{"}"}</span>
                      {"\n"}
                      {"    "}status<span className="token-punctuation">:</span>{" "}
                      <span className="token-string">&quot;active&quot;</span>
                      {"\n"}
                      {"  "}
                      <span className="token-punctuation">{"}"}</span>
                      {"\n"}
                      <span className="token-punctuation">{"}"}</span>
                    </>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(getQueryString())}
                  className="absolute top-2 right-2 p-1.5 border border-border-default hover:bg-bg-elevated"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-accent-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>

            <div className="panel p-5">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-border-default pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                  Saved Presets
                </h3>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<FolderOpen className="w-3.5 h-3.5" />}
                >
                  Load Preset
                </Button>
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
