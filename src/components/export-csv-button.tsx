"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

type ExportCsvButtonProps<TData extends object> = {
  data: TData[];
  excludeColumns?: string[];
  filename: string;
};

const preferredColumnOrder = ["id", "created_at", "updated_at"];

function getColumns<TData extends object>(
  data: TData[],
  excludeColumns: string[],
) {
  const columns = new Set<string>();
  const excludedColumns = new Set(excludeColumns);

  for (const row of data) {
    Object.keys(row).forEach((key) => {
      if (!excludedColumns.has(key)) {
        columns.add(key);
      }
    });
  }

  return [
    ...preferredColumnOrder.filter((column) => columns.delete(column)),
    ...columns,
  ];
}

function formatCsvValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  const serialized =
    typeof value === "object" ? JSON.stringify(value) : String(value);

  return `"${serialized.replaceAll('"', '""')}"`;
}

function buildCsv<TData extends object>(
  data: TData[],
  excludeColumns: string[],
) {
  const columns = getColumns(data, excludeColumns);
  const rows = data.map((row) => {
    const values = row as Record<string, unknown>;

    return columns.map((column) => formatCsvValue(values[column])).join(",");
  });

  return [
    columns.map(formatCsvValue).join(","),
    ...rows,
  ].join("\r\n");
}

function getSafeFilename(filename: string) {
  const safeName = filename
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9-_]+/g, "-")
    .replaceAll(/^-|-$/g, "");

  return `${safeName || "export"}.csv`;
}

export function ExportCsvButton<TData extends object>({
  data,
  excludeColumns = [],
  filename,
}: ExportCsvButtonProps<TData>) {
  function handleExport() {
    const csv = buildCsv(data, excludeColumns);
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = getSafeFilename(filename);
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleExport}
      disabled={data.length === 0}
    >
      <FileDown className="size-4" />
      Export CSV
    </Button>
  );
}
