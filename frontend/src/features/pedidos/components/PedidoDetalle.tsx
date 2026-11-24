import { EstadoError } from '../../../shared/components/EstadoError'
import { TablaSkeleton } from '../../../shared/components/Skeleton'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { formatFecha, formatPrecio } from '../../../shared/utils/format'
import { usePedido } from '../hooks/usePedidos'

const FORMA_PAGO_LABEL = { EFECTIVO: 'Efectivo', TRANSFERENCIA: 'Transferencia' } as const

export function PedidoDetalle({ pedidoId }: { pedidoId: number }) {
  const { data: pedido, isLoading, isError, error, refetch } = usePedido(pedidoId)

  if (isLoading) return <TablaSkeleton filas={4} />
  if (isError || !pedido) return <EstadoError error={error} onRetry={() => void refetch()} />

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <BadgeEstado estado={pedido.estado} />
        <span className="text-stone-500">Creado: {formatFecha(pedido.created_at)}</span>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {pedido.usuario && (
          <>
            <dt className="text-stone-500">Cliente</dt>
            <dd>
              {pedido.usuario.full_name} (@{pedido.usuario.username})
            </dd>
          </>
        )}
        <dt className="text-stone-500">Dirección</dt>
        <dd>{pedido.direccion_entrega}</dd>
        <dt className="text-stone-500">Forma de pago</dt>
        <dd>{FORMA_PAGO_LABEL[pedido.forma_pago]}</dd>
        {pedido.notas && (
          <>
            <dt className="text-stone-500">Notas</dt>
            <dd className="whitespace-pre-line">{pedido.notas}</dd>
          </>
        )}
        <dt className="text-stone-500">Última actualización</dt>
        <dd>{formatFecha(pedido.updated_at)}</dd>
      </dl>

      <table className="w-full text-left">
        <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
          <tr>
            <th className="py-2">Producto</th>
            <th className="py-2 text-right">Precio</th>
            <th className="py-2 text-right">Cant.</th>
            <th className="py-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {pedido.items.map((item) => (
            <tr key={item.producto_id}>
              <td className="py-2">{item.nombre_producto}</td>
              <td className="py-2 text-right">{formatPrecio(item.precio_unitario)}</td>
              <td className="py-2 text-right">{item.cantidad}</td>
              <td className="py-2 text-right">{formatPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-stone-200 font-bold">
            <td colSpan={3} className="py-2">
              Total
            </td>
            <td className="py-2 text-right">{formatPrecio(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
