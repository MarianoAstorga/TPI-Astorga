import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'

import { Paginacion } from './Paginacion'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T, unknown>[]
  pageSize?: number
  /** Si es false, la paginación la resuelve el servidor y se muestra fuera de la tabla. */
  paginacionCliente?: boolean
  emptyMessage?: string
}

export function DataTable<T>({
  data,
  columns,
  pageSize = 10,
  paginacionCliente = true,
  emptyMessage = 'No hay registros',
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize })

  const table = useReactTable({
    data,
    columns,
    state: paginacionCliente ? { sorting, pagination } : { sorting },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(paginacionCliente ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    autoResetPageIndex: false,
  })

  const filas = table.getRowModel().rows

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="min-w-full divide-y divide-stone-200 text-sm">
          <thead className="bg-stone-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sort = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      className="px-4 py-2.5 text-left text-xs font-semibold text-stone-500"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-stone-800"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className="text-[10px]">{sort === 'asc' ? '▲' : sort === 'desc' ? '▼' : ''}</span>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filas.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-stone-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filas.map((row) => (
                <tr key={row.id} className="hover:bg-stone-50/70">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap px-4 py-2.5 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginacionCliente && data.length > 0 && (
        <Paginacion
          pagina={table.getState().pagination.pageIndex}
          totalPaginas={table.getPageCount()}
          total={data.length}
          onChange={(p) => table.setPageIndex(p)}
        />
      )}
    </div>
  )
}
