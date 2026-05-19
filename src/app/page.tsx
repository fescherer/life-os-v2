"use client";

import { useState } from "react";
import { SELECT_OPTIONS } from "@/lib/selects-options";
import { DB_TABLES, POSSIBLE_TYPES } from "@/lib/schema";
import { DB_ROWS } from "@/lib/rows";

type DatabaseId = (typeof DB_TABLES)[number]["id"];
type CellValue = string | number | null;

function getReadableTextColor(backgroundColor: string) {
  const hex = backgroundColor.replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return "#18181b";
  }

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness < 140 ? "#ffffff" : "#18181b";
}

function SelectOptionCell({
  selectId,
  value,
}: {
  selectId: string;
  value: CellValue;
}) {
  if (value === null) {
    return null;
  }

  const option = SELECT_OPTIONS.find(
    (selectOption) =>
      selectOption.selectIdentifier === selectId && selectOption.id === value,
  );

  if (!option) {
    return value;
  }

  return (
    <span
      className="inline-flex min-w-16 items-center justify-center rounded px-2 py-1 text-xs font-medium"
      style={{
        backgroundColor: option.color,
        color: getReadableTextColor(option.color),
      }}
    >
      {option.value}
    </span>
  );
}

// eslint-disable-next-line react/no-multi-comp
export default function Home() {
  const [activeId, setActiveId] = useState<DatabaseId>(DB_TABLES[0].id);

  const active = DB_TABLES.find((db) => db.id === activeId) ?? DB_TABLES[0];

  const tableRows = DB_ROWS.filter((cell) => cell.table_id === active.id).reduce<
    Record<number, Record<string, CellValue>>
  >((acc, cell) => {
    acc[cell.row_id] ??= {};

    acc[cell.row_id][cell.column_id] =
      cell.value_string ?? cell.value_numeric;

    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-zinc-100 p-6 text-zinc-950">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold">Life OS</h1>

        <div className="mt-6 flex gap-2 border-b border-zinc-300">
          {DB_TABLES.map((db) => (
            <button
              key={db.id}
              onClick={() => setActiveId(db.id)}
              className={`px-3 py-2 text-sm font-medium ${
                activeId === db.id
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {db.label}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-300 bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                {active.columns.map((column) => (
                  <th key={column.id} className="px-4 py-3 font-medium">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {Object.entries(tableRows).map(([rowId, row]) => (
                <tr key={rowId} className="border-t border-zinc-200">
                  {active.columns.map((column) => {
                    const value = row[column.id] ?? null;

                    return (
                      <td key={column.id} className="px-4 py-3">
                        {column.type === POSSIBLE_TYPES.SELECT &&
                        "config" in column ? (
                            <SelectOptionCell
                              selectId={column.config.selectId}
                              value={value}
                            />
                          ) : (
                            value ?? ""
                          )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
