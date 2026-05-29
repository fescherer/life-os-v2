"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumn?: string;
  filterPlaceholder?: string;
  minHeightClassName?: string;
  onRowDoubleClick?: (row: TData) => void;
  renderMobileRow?: (row: Row<TData>) => React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  filterPlaceholder = "Filter...",
  minHeightClassName = "min-h-[42rem]",
  onRowDoubleClick,
  renderMobileRow,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  // TanStack Table returns methods that React Compiler cannot safely memoize.
  // Keep this table instance local to the component.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    enableMultiSort: true,
    isMultiSortEvent: () => true,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const filter = filterColumn ? table.getColumn(filterColumn) : undefined;
  const totalItems = table.getFilteredRowModel().rows.length;
  const visibleItems = table.getRowModel().rows.length;
  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const currentPage = totalItems > 0 ? pageIndex + 1 : 0;
  const firstVisibleItem = totalItems > 0 ? pageIndex * pageSize + 1 : 0;
  const lastVisibleItem =
    totalItems > 0 ? Math.min(firstVisibleItem + visibleItems - 1, totalItems) : 0;
  const hasMobileRows = Boolean(renderMobileRow);

  return (
    <div>
      {filter ? (
        <div className="flex items-center py-4">
          <Input
            placeholder={filterPlaceholder}
            value={(filter.getFilterValue() as string) ?? ""}
            onChange={(event) => filter.setFilterValue(event.target.value)}
            className="w-full sm:max-w-sm"
          />
        </div>
      ) : null}

      <div
        className={cn(
          "bg-background flex flex-col overflow-hidden rounded-md border",
          !hasMobileRows && minHeightClassName,
          hasMobileRows && "min-h-[28rem] md:min-h-[42rem]",
        )}
      >
        {renderMobileRow ? (
          <div className="md:hidden">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <div key={row.id} className="border-t first:border-t-0">
                  {renderMobileRow(row)}
                </div>
              ))
            ) : (
              <div className="text-muted-foreground px-4 py-12 text-center text-sm">
                No results.
              </div>
            )}
          </div>
        ) : null}

        <div className={cn("flex-1 overflow-hidden", hasMobileRows && "hidden md:block")}>
          <Table className="table-fixed">
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-muted/40 hover:bg-muted/40"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onDoubleClick={(event) => {
                      if (!onRowDoubleClick) {
                        return;
                      }

                      const target = event.target;

                      if (
                        target instanceof HTMLElement &&
                        target.closest(
                          "button, a, input, select, textarea, [role='button']",
                        )
                      ) {
                        return;
                      }

                      onRowDoubleClick(row.original);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border-border bg-muted/40 flex flex-col gap-3 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>{`Page ${currentPage} of ${pageCount}`}</span>
            <span>{`${firstVisibleItem}-${lastVisibleItem} of ${totalItems}`}</span>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="First page"
              title="First page"
            >
              <ChevronsLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
              title="Previous page"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
              title="Next page"
            >
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Last page"
              title="Last page"
            >
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
