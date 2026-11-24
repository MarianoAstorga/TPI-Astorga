import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { DataTable } from '../../../shared/components/DataTable'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { formatFecha, formatPrecio } from '../../../shared/utils/format'
import { TRANSICIONES, type EstadoPedido, type Pedido } from '../types/pedido'

const TEXTO_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'Preparar',
  ENTREGADO: 'Entregar',
  CANCELADO: 'Cancelar',
}

interface PedidosTableProps {
  pedidos: Pedido[]
  onVer: (pedido: Pedido) => void
  onCambiarEstado: (pedido: Pedido, estado: EstadoPedido) => void
  pedidoEnProceso: number | null
}

export function PedidosTable({ pedidos, onVer, onCambiarEstado, pedidoEnProceso }: PedidosTableProps) {
  const columns = useMemo<ColumnDef<Pedido>[]>(
    () => [
      { accessorKey: 'id', header: '#' },
      {
        accessorKey: 'created_at',
        header: 'Fecha',
        cell: ({ row }) => formatFecha(row.original.created_at),
      },
      {
        id: 'cliente',
        header: 'Cliente',
        accessorFn: (p) => p.usuario?.username ?? String(p.usuario_id),
        cell: ({ row }) => (row.original.usuario ? `@${row.original.usuario.username}` : `#${row.original.usuario_id}`),
      },
      {
        accessorKey: 'forma_pago',
        header: 'Pago',
        cell: ({ row }) => (row.original.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'),
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => <span className="font-semibold">{formatPrecio(row.original.total)}</span>,
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => <BadgeEstado estado={row.original.estado} />,
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => {
          const pedido = row.original
          const enProceso = pedidoEnProceso === pedido.id
          return (
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => onVer(pedido)}>
                Ver
              </Button>
              {TRANSICIONES[pedido.estado].map((destino) => (
                <Button
                  key={destino}
                  size="sm"
                  variant={destino === 'CANCELADO' ? 'danger' : 'primary'}
                  disabled={enProceso}
                  onClick={() => onCambiarEstado(pedido, destino)}
                >
                  {TEXTO_ACCION[destino]}
                </Button>
              ))}
            </div>
          )
        },
      },
    ],
    [onVer, onCambiarEstado, pedidoEnProceso],
  )

  return (
    <DataTable data={pedidos} columns={columns} paginacionCliente={false} emptyMessage="No hay pedidos" />
  )
}
