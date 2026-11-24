import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { formatPrecio } from '../../../shared/utils/format'
import { ResumenCard } from '../components/ResumenCard'
import { useResumenPedidos } from '../hooks/usePedidos'

export function AdminResumenPage() {
  const { data, isLoading, isError, error, refetch } = useResumenPedidos()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    )
  }

  if (isError || !data) return <EstadoError error={error} onRetry={() => void refetch()} />

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ResumenCard titulo="Pedidos de hoy" valor={data.pedidos_hoy} descripcion="Creados desde las 00:00" acento="orange" />
      <ResumenCard
        titulo="Ingresos (entregados)"
        valor={formatPrecio(data.ingresos_entregados)}
        descripcion="Suma de pedidos entregados"
        acento="emerald"
      />
      <ResumenCard titulo="Pendientes" valor={data.pendientes} descripcion="Esperando preparación" acento="amber" />
      <ResumenCard titulo="En preparación" valor={data.en_preparacion} acento="sky" />
      <ResumenCard titulo="Entregados" valor={data.entregados} acento="emerald" />
      <ResumenCard titulo="Cancelados" valor={data.cancelados} acento="stone" />
    </div>
  )
}
