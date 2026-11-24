import { useCallback, useState, type ReactNode } from 'react'

import { handleApiError } from '../../../shared/api/handleApiError'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { EstadoError, MensajeError } from '../../../shared/components/EstadoError'
import { Paginacion } from '../../../shared/components/Paginacion'
import { TablaSkeleton } from '../../../shared/components/Skeleton'
import { ETIQUETA_ESTADO } from '../../../shared/ui/BadgeEstado'
import { Modal } from '../../../shared/ui/Modal'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { PedidosTable } from '../components/PedidosTable'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { ESTADOS_PEDIDO, type EstadoPedido, type Pedido, type PedidosFiltros } from '../types/pedido'

const LIMIT = 15

export function AdminPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const filtros: PedidosFiltros = { skip: pagina * LIMIT, limit: LIMIT, ...(estado ? { estado } : {}) }
  const { data, isLoading, isError, error, refetch } = usePedidos(filtros)
  const cambiarEstado = useCambiarEstadoPedido()

  const handleCambiarEstado = useCallback(
    (pedido: Pedido, destino: EstadoPedido) => {
      setErrorAccion(null)
      // Cancelar devuelve stock: se pide confirmación
      if (destino === 'CANCELADO') {
        setACancelar(pedido)
        return
      }
      cambiarEstado.mutate(
        { id: pedido.id, estado: destino },
        { onError: (err) => setErrorAccion(handleApiError(err)) },
      )
    },
    [cambiarEstado],
  )

  const handleVer = useCallback((pedido: Pedido) => setDetalle(pedido), [])

  const cerrarCancelar = () => {
    setACancelar(null)
    cambiarEstado.reset()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <FiltroBoton activo={estado === undefined} onClick={() => { setEstado(undefined); setPagina(0) }}>
          Todos
        </FiltroBoton>
        {ESTADOS_PEDIDO.map((e) => (
          <FiltroBoton key={e} activo={estado === e} onClick={() => { setEstado(e); setPagina(0) }}>
            {ETIQUETA_ESTADO[e]}
          </FiltroBoton>
        ))}
      </div>

      <MensajeError mensaje={errorAccion} />

      {isLoading ? (
        <TablaSkeleton />
      ) : isError ? (
        <EstadoError error={error} onRetry={() => void refetch()} />
      ) : (
        <>
          <PedidosTable
            pedidos={data?.items ?? []}
            onVer={handleVer}
            onCambiarEstado={handleCambiarEstado}
            pedidoEnProceso={cambiarEstado.isPending ? (cambiarEstado.variables?.id ?? null) : null}
          />
          {data && data.total > 0 && (
            <Paginacion
              pagina={pagina}
              totalPaginas={Math.ceil(data.total / LIMIT)}
              total={data.total}
              onChange={setPagina}
            />
          )}
        </>
      )}

      <Modal open={detalle !== null} title={`Pedido #${detalle?.id ?? ''}`} onClose={() => setDetalle(null)} size="lg">
        {detalle && <PedidoDetalle pedidoId={detalle.id} />}
      </Modal>

      <ConfirmDialog
        open={aCancelar !== null}
        titulo="Cancelar pedido"
        mensaje={`¿Cancelar el pedido #${aCancelar?.id ?? ''}? Se devolverá el stock de sus productos.`}
        textoConfirmar="Cancelar pedido"
        peligroso
        cargando={cambiarEstado.isPending}
        error={cambiarEstado.isError && aCancelar ? handleApiError(cambiarEstado.error) : null}
        onClose={cerrarCancelar}
        onConfirm={() => {
          if (aCancelar) {
            cambiarEstado.mutate({ id: aCancelar.id, estado: 'CANCELADO' }, { onSuccess: cerrarCancelar })
          }
        }}
      />
    </div>
  )
}

interface FiltroBotonProps {
  activo: boolean
  onClick: () => void
  children: ReactNode
}

function FiltroBoton({ activo, onClick, children }: FiltroBotonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${
        activo ? 'bg-orange-600 text-white ring-orange-600' : 'bg-white text-stone-600 ring-stone-300 hover:bg-stone-50'
      }`}
    >
      {children}
    </button>
  )
}
