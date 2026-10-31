import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  OnChangeFn,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";

export interface PaginationState {
  page: number; // 1-indexed
  pageSize: number;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total?: number;
  isLoading?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  total = 0,
  isLoading = false,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  emptyMessage = "No results found.",
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: pagination ? Math.ceil(total / pagination.pageSize) : -1,
    state: {
      sorting,
    },
    onSortingChange,
  });

  const currentPage = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? 20;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const fromRecord = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toRecord = Math.min(currentPage * pageSize, total);

  return (
    <div className="space-y-4">
      <div className="rounded-container border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-recessed text-ink-secondary text-xs font-medium border-b border-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();
                    const meta = header.column.columnDef.meta as { align?: "left" | "right" | "center" } | undefined;
                    const align = meta?.align;

                    return (
                      <th
                        key={header.id}
                        className={cn(
                          "px-4 py-3 select-none font-medium",
                          align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
                          canSort && "cursor-pointer hover:bg-muted transition-colors"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-1.5",
                            align === "right" && "justify-end",
                            align === "center" && "justify-center"
                          )}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {canSort && (
                            <span className="text-muted-foreground/70">
                              {sortDirection === "asc" ? (
                                <ChevronUp className="w-3.5 h-3.5 text-primary" />
                              ) : sortDirection === "desc" ? (
                                <ChevronDown className="w-3.5 h-3.5 text-primary" />
                              ) : (
                                <ChevronsUpDown className="w-3.5 h-3.5" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-border">
              {isLoading ? (
                // Skeleton loading rows
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                    {columns.map((col, cIdx) => {
                      const meta = col.meta as { align?: "left" | "right" | "center" } | undefined;
                      return (
                        <td
                          key={`sc-${cIdx}`}
                          className={cn("px-4 py-3.5", meta?.align === "right" && "text-right")}
                        >
                          <div
                            className={cn(
                              "h-4 bg-muted rounded-control w-3/4",
                              meta?.align === "right" && "ml-auto"
                            )}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center">
                    <EmptyState description={emptyMessage} />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick && onRowClick(row.original)}
                    className={cn(
                      "hover:bg-muted/40 transition-colors",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as { align?: "left" | "right" | "center" } | undefined;
                      return (
                        <td
                          key={cell.id}
                          className={cn(
                            "px-4 py-3 text-foreground",
                            meta?.align === "right"
                              ? "text-right"
                              : meta?.align === "center"
                              ? "text-center"
                              : "text-left"
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {pagination && onPaginationChange && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-ink-secondary px-1">
          <div>
            Showing <span className="font-medium text-foreground">{fromRecord}</span> to{" "}
            <span className="font-medium text-foreground">{toRecord}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) =>
                onPaginationChange({ page: 1, pageSize: Number(e.target.value) })
              }
              className="text-xs bg-card border border-border rounded-control px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>

            <button
              disabled={currentPage <= 1 || isLoading}
              onClick={() =>
                onPaginationChange({ page: currentPage - 1, pageSize })
              }
              className="p-1.5 rounded-control border border-border bg-card text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs px-2 font-mono tabular-nums font-medium text-foreground">
              {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages || isLoading}
              onClick={() =>
                onPaginationChange({ page: currentPage + 1, pageSize })
              }
              className="p-1.5 rounded-control border border-border bg-card text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
