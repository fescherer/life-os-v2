import { Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  FINANCE_FORMAT_LOCALE,
  financeFullDateFormat,
} from "@/lib/finance-format";

export type RowData = Record<string, string | number | null | undefined>;

export type Column<T extends RowData> = {
  key: keyof T;
  label: string;
};

type FinanceDataTableProps<T extends RowData> = {
  columns: Column<T>[];
  data: RowData[];
  highlightedRowId?: number | null;
  onHighlightComplete?: () => void;
  onEditRow?: (row: T) => void;
  search: string;
};

function formatFullDate(value: string | number | null | undefined) {
  if (typeof value !== "string") return undefined;

  const [year, month, day] = value.slice(0, 10).split("-");

  if (!year || !month || !day) return undefined;

  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return new Intl.DateTimeFormat(
    FINANCE_FORMAT_LOCALE,
    financeFullDateFormat
  ).format(date);
}

function getCellTitle<T extends RowData>(row: RowData, column: Column<T>) {
  if (column.key !== "date") return undefined;

  return formatFullDate(row.rawDate);
}

function getCellClassName<T extends RowData>(row: RowData, column: Column<T>) {
  const classNames = ["whitespace-nowrap"];

  if (column.key === "amount" && typeof row.rawValue === "number") {
    if (row.rawValue > 0) classNames.push("py-2 px-4 flex w-26  text-center rounded-full bg-success/75");
    if (row.rawValue < 0) classNames.push("py-2 px-4 flex w-26  text-center rounded-full bg-error/75");
  }

  return classNames.join(" ");
}

export default function FinanceDataTable<T extends RowData>({
  columns,
  data,
  highlightedRowId,
  onHighlightComplete,
  onEditRow,
  search,
}: FinanceDataTableProps<T>) {
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const highlightedRowIndex =
    highlightedRowId === null || highlightedRowId === undefined
      ? -1
      : filtered.findIndex((row) => row.id === highlightedRowId);
  const activePage =
    highlightedRowIndex === -1
      ? page
      : Math.floor(highlightedRowIndex / pageSize) + 1;
  const hasHighlightedRow = highlightedRowIndex !== -1;

  const paginated = filtered.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize
  );

  const visiblePages = useMemo(() => {
    const pages: Array<number | "..."> = [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    pages.push(1);

    if (activePage > 4) pages.push("...");

    const start = Math.max(2, activePage - 1);
    const end = Math.min(totalPages - 1, activePage + 1);

    for (let current = start; current <= end; current++) {
      pages.push(current);
    }

    if (activePage < totalPages - 3) pages.push("...");

    pages.push(totalPages);

    return pages;
  }, [activePage, totalPages]);

  useEffect(() => {
    if (!hasHighlightedRow) return;

    const timeoutId = window.setTimeout(() => {
      onHighlightComplete?.();
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [hasHighlightedRow, highlightedRowId, onHighlightComplete]);

  return (
    <div className="bg-base-100 flex h-full flex-1 flex-col">
      <div className="flex-1 overflow-x-auto">
        <table className="table">
          <thead className="bg-base-200 text-base-content">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="font-semibold">
                  {column.label}
                </th>
              ))}
              {onEditRow && <th className="text-right font-semibold">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {paginated.map((row, index) => {
              const isHighlighted =
                highlightedRowId !== null &&
                highlightedRowId !== undefined &&
                String(row.id) === String(highlightedRowId);
              
              return (
                <tr
                  key={String(row.id ?? index)}
                  className={isHighlighted ? "animate-row-highlight" : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      title={getCellTitle(row, column)}
                    >
                      <span className={getCellClassName(row, column)}>{String(row[column.key as string] ?? "")}</span>
                    </td>
                  ))}
                  {onEditRow && (
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => onEditRow(row as T)}
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}

            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (onEditRow ? 1 : 0)}
                  className="text-base-content/60 py-12 text-center"
                >
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base-content/60 text-sm">
          Showing {paginated.length} of {filtered.length} results
        </p>

        <div className="join self-end overflow-x-auto sm:self-auto">
          <button
            className="btn join-item btn-sm"
            disabled={activePage === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            «
          </button>

          {visiblePages.map((pageItem, index) =>
            pageItem === "..." ? (
              <button
                key={`ellipsis-${index}`}
                className="btn join-item btn-sm btn-disabled"
              >
                ...
              </button>
            ) : (
              <button
                key={pageItem}
                className={`btn join-item btn-sm ${
                  activePage === pageItem ? "btn-active" : ""
                }`}
                onClick={() => setPage(pageItem)}
              >
                {pageItem}
              </button>
            )
          )}

          <button
            className="btn join-item btn-sm"
            disabled={activePage === totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
