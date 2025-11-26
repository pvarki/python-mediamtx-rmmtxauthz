import * as React from "react";
import {
  ColumnDef,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import NumberInput from "@/components/number-input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  defaultSortKey: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  defaultSortKey,
}: DataTableProps<TData, TValue>): React.JSX.Element {
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      desc: true,
      id: defaultSortKey,
    },
  ]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      pagination,
    },
  });
  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-center space-x-2 py-4">
        <nav className="flex items-center justify-center space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPagination((p) => ({
                ...p,
                pageIndex: Math.max(p.pageIndex - 1, 0),
              }))
            }
            disabled={pagination.pageIndex === 0}
          >
            {"<"}
          </Button>
          <span className="flex w-full items-center">
            <NumberInput
              value={pagination.pageIndex + 1}
              min={1}
              max={table.getPageCount()}
              onValueChange={(value) =>
                setPagination((p) => ({
                  ...p,
                  pageIndex: value ? value - 1 : p.pageIndex,
                }))
              }
              className="w-12"
            />
            / {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPagination((p) => ({
                ...p,
                pageIndex: Math.min(p.pageIndex + 1, table.getPageCount() - 1),
              }))
            }
            disabled={pagination.pageIndex >= table.getPageCount() - 1}
          >
            {">"}
          </Button>
        </nav>
      </div>
    </div>
  );
}
