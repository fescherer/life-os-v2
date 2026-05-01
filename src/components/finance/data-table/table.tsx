import { Pencil } from "lucide-react";
import { useMemo, useState } from "react";

export type RowData = Record<string, string | number | null | undefined>;

export type Column<T extends RowData> = {
  key: keyof T;
  label: string;
};

type FinanceDataTableProps<T extends RowData> = {
  columns: Column<T>[];
  data: RowData[];
  onEditRow?: (row: T) => void;
  search: string;
};

export default function FinanceDataTable<T extends RowData>({
  columns,
  data,
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

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const visiblePages = useMemo(() => {
    const pages: Array<number | "..."> = [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    pages.push(1);

    if (page > 4) pages.push("...");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let current = start; current <= end; current++) {
      pages.push(current);
    }

    if (page < totalPages - 3) pages.push("...");

    pages.push(totalPages);

    return pages;
  }, [page, totalPages]);

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
              {onEditRow && <th className="font-semibold text-right">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {paginated.map((row, index) => (
              <tr key={String(row.id ?? index)} >
                {columns.map((column) => (
                  <td key={String(column.key)} className="whitespace-nowrap">
                    <span>{String(row[column.key as string] ?? "")}</span>
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
            ))}

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
            disabled={page === 1}
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
                  page === pageItem ? "btn-active" : ""
                }`}
                onClick={() => setPage(pageItem)}
              >
                {pageItem}
              </button>
            )
          )}

          <button
            className="btn join-item btn-sm"
            disabled={page === totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
