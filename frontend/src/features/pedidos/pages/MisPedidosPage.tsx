import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { handleApiError } from '../../../shared/api/handleApiError'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { BadgeEstado, ETIQUETA_ESTADO } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Select } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import { formatFecha, formatPrecio } from '../../../shared/utils/format'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import { ESTADOS_PEDIDO, type EstadoPedido, type Pedido, type PedidosFiltros } from '../types/pedido'

const LIMIT = 10

export function MisPedidosPage() {
  const location = useLocation()
  const pedidoCreado = (location.state as { pedidoCreado?: boolean } | null)?.pedidoCreado ?? false

  const [pagina, setPagina] = useState(0)
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)

  const filtros: PedidosFiltros = { skip: pagina * LIMIT, limit: LIMIT, ...(estado ? { estado } : {}) }
  const { data, isLoading, isError, error, refetch } = usePedidos(filtros)
  const cancelar = useCancelarPedido()

  const cerrarCancelar = () => {
    setACancelar(null)
    cancelar.reset()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold">Mis pedidos</h1>
        <div className="w-52">
          <Select
            id="estado"
            value={estado ?? ''}
            onChange={(e) => {
              setEstado(e.target.value ? (e.target.value as EstadoPedido) : undefined)
              setPagina(0)
            }}
          >
            <option value="">Todos los estados</option>
            {ESTADOS_PEDIDO.map((e) => (
              <option key={e} value={e}>
                {ETIQUETA_ESTADO[e]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {pedidoCreado && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ¡Pedido confirmado! Podés seguir su estado desde esta pantalla.
        </p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError error={error} onRetry={() => void refetch()} />
      ) : !data || data.items.length === 0 ? (
        <EstadoVacio
          titulo={estado ? 'No hay pedidos con ese estado' : 'Todavía no hiciste pedidos'}
          accion={
            <Link to="/" className="text-sm font-medium text-orange-700 hover:underline">
              Ir al catálogo
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {data.items.map((pedido) => (
              <Card key={pedido.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-[140px]">
                  <p className="font-semibold">Pedido #{pedido.id}</p>
                  <p className="text-xs text-stone-500">{formatFecha(pedido.created_at)}</p>
                </div>
                <BadgeEstado estado={pedido.estado} />
                <p className="flex-1 truncate text-sm text-stone-500">
                  {pedido.items.map((i) => `${i.cantidad}× ${i.nombre_producto}`).join(', ')}
                </p>
                <p className="font-bold">{formatPrecio(pedido.total)}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setDetalleId(pedido.id)}>
                    Ver detalle
                  </Button>
                  {pedido.estado === 'PENDIENTE' && (
                    <Button size="sm" variant="danger" onClick={() => setACancelar(pedido)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <Paginacion
            pagina={pagina}
            totalPaginas={Math.ceil(data.total / LIMIT)}
            total={data.total}
            onChange={setPagina}
          />
        </>
      )}

      <Modal open={detalleId !== null} title={`Pedido #${detalleId ?? ''}`} onClose={() => setDetalleId(null)} size="lg">
        {detalleId !== null && <PedidoDetalle pedidoId={detalleId} />}
      </Modal>

      <ConfirmDialog
        open={aCancelar !== null}
        titulo="Cancelar pedido"
        mensaje={`¿Seguro que querés cancelar el pedido #${aCancelar?.id ?? ''}? Esta acción no se puede deshacer.`}
        textoConfirmar="Sí, cancelar"
        peligroso
        cargando={cancelar.isPending}
        error={cancelar.isError ? handleApiError(cancelar.error) : null}
        onClose={cerrarCancelar}
        onConfirm={() => {
          if (aCancelar) cancelar.mutate(aCancelar.id, { onSuccess: cerrarCancelar })
        }}
      />
    </div>
  )
}
