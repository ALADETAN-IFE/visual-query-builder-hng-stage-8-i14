"use client";

import { useState, useMemo } from "react";
import { Copy, Check, Code2 } from "lucide-react";
import { useQueryStore } from "@/store/query-store";
import { getSchemaById } from "@/lib/schemas";
import { generateQuery, QueryFormat } from "@/lib/query-engine";
import { copyToClipboard } from "@/lib/utils";
import Button from "@/components/ui/Button";

const SQL_KEYWORDS = new Set([
  "SELECT","FROM","WHERE","AND","OR","NOT","NULL","IS","LIKE","IN","BETWEEN",
  "REGEXP","ORDER","BY","LIMIT","GROUP","HAVING","JOIN","ON","AS",
]);

function highlightSQL(code: string): React.ReactNode[] {
  const tokens = code.split(/(\s+|[(),]|'[^']*'|\b\w+\b)/g).filter(Boolean);
  return tokens.map((tok, i) => {
    if (/^'.*'$/.test(tok)) return <span key={i} className="token-string">{tok}</span>;
    if (/^-?\d+(\.\d+)?$/.test(tok)) return <span key={i} className="token-number">{tok}</span>;
    if (SQL_KEYWORDS.has(tok.toUpperCase())) return <span key={i} className="token-keyword">{tok}</span>;
    if (/^[(),*]$/.test(tok)) return <span key={i} className="token-punctuation">{tok}</span>;
    if (/^(!=|=|>|<)$/.test(tok)) return <span key={i} className="token-operator">{tok}</span>;
    if (/^--.*/.test(tok)) return <span key={i} className="token-comment">{tok}</span>;
    return <span key={i}>{tok}</span>;
  });
}

function highlightMongo(code: string): React.ReactNode[] {
  const lines = code.split("\n");
  return lines.flatMap((line, li) => {
    const parts: React.ReactNode[] = [];
    if (/^\s*\/\//.test(line)) {
      parts.push(<span key={`${li}-comment`} className="token-comment">{line}</span>);
    } else {
      const keyMatch = line.match(/^(\s*)"(\$?\w+)"(\s*:\s*)(.*)/);
      if (keyMatch) {
        const [, ws, key, colon, rest] = keyMatch;
        const isOperator = key.startsWith("$");
        parts.push(
          <span key={`${li}-ws`}>{ws}</span>,
          <span key={`${li}-key`} className={isOperator ? "token-keyword" : "token-field"}>{`"${key}"`}</span>,
          <span key={`${li}-colon`} className="token-punctuation">{colon}</span>,
          highlightMongoValue(rest, li),
        );
      } else {
        parts.push(<span key={`${li}-raw`}>{line}</span>);
      }
    }
    if (li < lines.length - 1) parts.push(<br key={`${li}-br`} />);
    return parts;
  });
}

function highlightMongoValue(val: string, key: number): React.ReactNode {
  const trimmed = val.trim();
  if (/^".*"$/.test(trimmed)) return <span key={key} className="token-string">{val}</span>;
  if (/^-?\d/.test(trimmed)) return <span key={key} className="token-number">{val}</span>;
  if (trimmed === "null") return <span key={key} className="token-keyword">{val}</span>;
  return <span key={key}>{val}</span>;
}

function highlightGraphQL(code: string): React.ReactNode[] {
  const GQL_KEYWORDS = new Set(["query","mutation","subscription","fragment","on","true","false","null"]);
  const lines = code.split("\n");
  return lines.flatMap((line, li) => {
    const commentIdx = line.indexOf("#");
    let main = line;
    let comment = "";
    if (commentIdx !== -1) {
      main = line.slice(0, commentIdx);
      comment = line.slice(commentIdx);
    }
    const toks = main.split(/(\s+|[{}():,]|"[^"]*"|\b\w+\b)/g).filter(Boolean).map((tok, i) => {
      if (/^".*"$/.test(tok)) return <span key={`${li}-${i}`} className="token-string">{tok}</span>;
      if (/^-?\d/.test(tok)) return <span key={`${li}-${i}`} className="token-number">{tok}</span>;
      if (GQL_KEYWORDS.has(tok)) return <span key={`${li}-${i}`} className="token-keyword">{tok}</span>;
      if (/^[{}():,]$/.test(tok)) return <span key={`${li}-${i}`} className="token-punctuation">{tok}</span>;
      return <span key={`${li}-${i}`}>{tok}</span>;
    });
    const result: React.ReactNode[] = [...toks];
    if (comment) result.push(<span key={`${li}-cm`} className="token-comment">{comment}</span>);
    if (li < lines.length - 1) result.push(<br key={`${li}-br`} />);
    return result;
  });
}

const FORMATS: { id: QueryFormat; label: string }[] = [
  { id: "sql", label: "SQL" },
  { id: "mongo", label: "MongoDB" },
  { id: "graphql", label: "GraphQL" },
];


export default function QueryPreview() {
  const [format, setFormat] = useState<QueryFormat>("sql");
  const [copied, setCopied] = useState(false);

  const rootGroup = useQueryStore((s) => s.rootGroup);
  const schemaId = useQueryStore((s) => s.schemaId);
  const schema = getSchemaById(schemaId);

  const queryText = useMemo(() => {
    if (!schema) return "";
    return generateQuery(rootGroup, schema, format);
  }, [rootGroup, schema, format]);

  const highlighted = useMemo(() => {
    if (format === "sql") return highlightSQL(queryText);
    if (format === "mongo") return highlightMongo(queryText);
    return highlightGraphQL(queryText);
  }, [queryText, format]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(queryText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="panel p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-border-default">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-accent-secondary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
            Live Preview
          </h3>
        </div>

        <div className="flex bg-bg-elevated rounded-lg p-0.5 gap-0.5">
          {FORMATS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFormat(id)}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all duration-150 cursor-pointer ${
                format === id
                  ? "bg-accent-primary text-text-inverse shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative group">
        <div className="query-preview min-h-40 max-h-75 overflow-y-auto text-[0.8rem] leading-relaxed">
          {highlighted}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 border border-border-default hover:bg-bg-elevated opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Copy query"
        >
          {copied
            ? <Check className="w-3.5 h-3.5 text-accent-success" />
            : <Copy className="w-3.5 h-3.5" />
          }
        </Button>
      </div>

      <div className="flex items-center justify-between text-[0.6875rem] text-text-tertiary">
        <span>{queryText.split("\n").length} lines · {queryText.length} chars</span>
        <span className="uppercase tracking-wider">
          {format === "sql" ? "SQL-92" : format === "mongo" ? "MongoDB Filter" : "GraphQL Query"}
        </span>
      </div>
    </div>
  );
}
