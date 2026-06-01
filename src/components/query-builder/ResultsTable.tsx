"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Play, ChevronLeft, ChevronRight, SearchX, ChevronsUpDown, ArrowUp, ArrowDown, Loader2, Star } from "lucide-react";
import { QueryGroup } from "@/lib/types";
import { getSchemaById } from "@/lib/schemas";
import { runQuerySimulator } from "@/lib/simulator";
import { formatDate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface ResultsTableProps {
  schemaId: string;
  rootGroup: QueryGroup;
}

type SortConfig = {
  key: string;
  direction: "asc" | "desc" | null;
};

export default function ResultsTable({ schemaId, rootGroup }: ResultsTableProps) {
  const schema = getSchemaById(schemaId);
  const [loading, setLoading] = useState(false);
  
  // Initialize results state with current simulated query to avoid mount/reload flashes
  const [results, setResults] = useState<any[]>(() => {
    return runQuerySimulator(rootGroup, schemaId);
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: null });

  // Automatically evaluate query ONLY when schema changes
  useEffect(() => {
    const matched = runQuerySimulator(rootGroup, schemaId);
    setResults(matched);
    setCurrentPage(1);
    setSortConfig({ key: "", direction: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemaId]);

  // Execute query simulator manually with loading shimmer
  const handleRunQuery = () => {
    setLoading(true);
    setCurrentPage(1);

    setTimeout(() => {
      const matched = runQuerySimulator(rootGroup, schemaId);
      setResults(matched);
      setLoading(false);
    }, 450);
  };

  // Handle header click to sort column
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  // Sort and process results
  const sortedResults = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return results;

    const key = sortConfig.key;
    const dir = sortConfig.direction;

    return [...results].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      // Handle numbers
      if (typeof aVal === "number" && typeof bVal === "number") {
        return dir === "asc" ? aVal - bVal : bVal - aVal;
      }

      // Handle boolean
      if (typeof aVal === "boolean" && typeof bVal === "boolean") {
        return dir === "asc"
          ? (aVal === bVal ? 0 : aVal ? -1 : 1)
          : (aVal === bVal ? 0 : aVal ? 1 : -1);
      }

      // Handle default strings
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return dir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [results, sortConfig]);

  // Paginated results
  const paginatedResults = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return sortedResults.slice(startIdx, startIdx + pageSize);
  }, [sortedResults, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedResults.length / pageSize);

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key || !sortConfig.direction) {
      return <ChevronsUpDown className="w-3.5 h-3.5 opacity-40 shrink-0" />;
    }
    return sortConfig.direction === "asc"
      ? <ArrowUp className="w-3.5 h-3.5 text-accent-primary shrink-0 animate-fade-in" />
      : <ArrowDown className="w-3.5 h-3.5 text-accent-primary shrink-0 animate-fade-in" />;
  };

  // Render record fields dynamically and prettily
  const renderCell = (fieldId: string, value: any) => {
    if (value === null || value === undefined) return <span className="text-text-tertiary font-mono">null</span>;

    // Formatting rules
    if (fieldId === "price" || fieldId === "totalAmount") {
      return <span className="font-semibold text-text-primary font-mono">${Number(value).toFixed(2)}</span>;
    }

    if (fieldId === "rating") {
      return (
        <span className="font-mono inline-flex items-center gap-1 font-semibold text-text-primary">
          <Star className="w-3 h-3 text-accent-warning fill-accent-warning shrink-0" />
          <span>{value}</span>
        </span>
      );
    }

    if (typeof value === "boolean") {
      return value ? (
        <Badge variant="success" className="px-2 py-0.5 text-[0.6875rem]">True</Badge>
      ) : (
        <Badge variant="danger" className="px-2 py-0.5 text-[0.6875rem]">False</Badge>
      );
    }

    if (fieldId === "createdAt" || fieldId === "orderDate") {
      return <span className="text-text-secondary">{formatDate(value)}</span>;
    }

    // Pretty enums/status tags
    if (fieldId === "status") {
      const valStr = String(value);
      if (valStr === "active" || valStr === "paid" || valStr === "shipped") {
        return <Badge variant="success" className="capitalize">{valStr}</Badge>;
      }
      if (valStr === "pending") {
        return <Badge variant="warning" className="capitalize">{valStr}</Badge>;
      }
      if (valStr === "cancelled") {
        return <Badge variant="danger" className="capitalize">{valStr}</Badge>;
      }
      return <Badge variant="default" className="capitalize">{valStr}</Badge>;
    }

    if (fieldId === "id" || fieldId === "orderId") {
      return <span className="font-mono text-text-secondary font-semibold select-all">{value}</span>;
    }

    return <span className="text-text-primary">{String(value)}</span>;
  };

  if (!schema) return null;

  return (
    <div className="panel p-5 animate-fade-in flex flex-col gap-4">
      {/* Header and Controls */}
      <div className="flex justify-between items-center pb-4 border-b border-border-default max-[500px]:flex-col max-[500px]:items-end max-[500px]:gap-3">
        <div className="flex items-center gap-2 max-[500px]:w-full">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
            Execution Results
          </h3>
          <Badge
            variant={results.length > 0 ? "success" : "default"}
            className="px-2.5 py-0.5 text-[0.7rem] font-bold"
          >
            {results.length} MATCH{results.length === 1 ? "" : "ES"}
          </Badge>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="bg-accent-primary flex items-center h-9 relative"
          icon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Play className="w-3.5 h-3.5 mr-1 text-text-inverse" />}
          onClick={handleRunQuery}
          disabled={loading}
        >
          {loading ? "Running..." : "Run Query"}
        </Button>
      </div>

      {/* Results Table */}
      {loading ? (
        <div className="w-full flex flex-col gap-3 py-10 animate-pulse">
          <div className="h-8 bg-bg-elevated/50 rounded-lg w-full" />
          <div className="h-10 bg-bg-elevated/30 rounded-lg w-full" />
          <div className="h-10 bg-bg-elevated/30 rounded-lg w-full" />
          <div className="h-10 bg-bg-elevated/30 rounded-lg w-full" />
          <div className="h-10 bg-bg-elevated/30 rounded-lg w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-lg border border-border-default bg-bg-surface/50">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-bg-elevated text-text-secondary border-b border-border-default select-none">
                  {schema.fields.map((field) => (
                    <th
                      key={field.id}
                      onClick={() => handleSort(field.id)}
                      className="p-3.5 font-bold cursor-pointer hover:bg-bg-inset transition-colors uppercase tracking-wider text-[0.6875rem]"
                    >
                      <div className="flex items-center gap-1.5 justify-between">
                        <span>{field.label}</span>
                        {getSortIcon(field.id)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedResults.length === 0 ? (
                  <tr className="hover:bg-transparent">
                    <td colSpan={schema.fields.length} className="p-8 text-center align-middle">
                      <div className="flex flex-col items-center justify-center py-4 text-center shrink-0 animate-fade-in">
                        <div className="p-2.5 bg-accent-warning/10 rounded-full mb-3 text-accent-warning">
                          <SearchX className="w-5 h-5 animate-pulse" />
                        </div>
                        <h4 className="text-xs font-semibold text-text-primary mb-1">
                          No matching records found
                        </h4>
                        <p className="text-[0.6875rem] text-text-tertiary max-w-xs mx-auto leading-relaxed">
                          Your query filter set did not match any documents in the <strong>{schema.label ?? schemaId}</strong> dataset. Check your rule values or operators.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedResults.map((record, ri) => (
                    <tr
                      key={record.id || record.orderId || ri}
                      className="border-b border-border-default last:border-0 hover:bg-bg-elevated/30 transition-colors duration-100"
                    >
                      {schema.fields.map((field) => (
                        <td key={field.id} className="p-3.5 align-middle">
                          {renderCell(field.id, record[field.id])}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination and Table controls - always rendered if there is data */}
          {sortedResults.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-[0.6875rem] text-text-tertiary">
                  Showing <span className="font-semibold text-text-secondary">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                  <span className="font-semibold text-text-secondary">
                    {Math.min(currentPage * pageSize, sortedResults.length)}
                  </span>{" "}
                  of <span className="font-semibold text-text-secondary">{sortedResults.length}</span> items
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-bg-elevated hover:bg-bg-inset text-text-secondary hover:text-text-primary px-1.5 py-0.5 rounded text-[0.6875rem] border border-border-default cursor-pointer font-semibold outline-none"
                >
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - currentPage) <= 1 || p === 1 || p === totalPages)
                    .map((p, index, array) => {
                      const showEllipsis = index > 0 && p - array[index - 1] > 1;
                      return (
                        <React.Fragment key={p}>
                          {showEllipsis && <span className="text-text-tertiary px-1 text-xs">...</span>}
                          <button
                            onClick={() => setCurrentPage(p)}
                            className={`w-8 h-8 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              currentPage === p
                                ? "bg-accent-primary text-text-inverse shadow-sm"
                                : "bg-bg-elevated hover:bg-bg-inset text-text-secondary hover:text-text-primary"
                            }`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
