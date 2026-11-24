import { useState } from 'react'

import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { Input, Select } from '../../../shared/ui/Input'
import { useDebounce } from '../../../shared/utils/useDebounce'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'
import type { ProductosFiltros } from '../types/producto'

const LIMIT = 8

export function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)
  const [soloDisponibles, setSoloDisponibles] = useState(false)

  const search = useDebounce(busqueda.trim())

  const filtros: ProductosFiltros = {
    skip: pagina * LIMIT,
    limit: LIMIT,
    ...(search ? { search } : {}),
    ...(categoriaId !== undefined ? { categoria_id: categoriaId } : {}),
    ...(soloDisponibles ? { disponible: true } : {}),
  }

  const { data, isLoading, isError, error, refetch, isFetching } = useProductos(filtros)
  const { data: categorias } = useCategorias()

  const totalPaginas = data ? Math.ceil(data.total / LIMIT) : 0
  const hayFiltros = Boolean(search) || categoriaId !== undefined || soloDisponibles

  const limpiarFiltros = () => {
    setBusqueda('')
    setCategoriaId(undefined)
    setSoloDisponibles(false)
    setPagina(0)
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-stone-900">Nuestro menú</h1>
        <p className="text-sm text-stone-500">Elegí tus productos y armá tu pedido.</p>
      </section>

      <section className="grid gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-[1fr_220px_auto] sm:items-end">
        <Input
          id="busqueda"
          label="Buscar"
          placeholder="Ej: pizza, empanada…"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value)
            setPagina(0)
          }}
        />
        <Select
          id="categoria"
          label="Categoría"
          value={categoriaId ?? ''}
          onChange={(e) => {
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined)
            setPagina(0)
          }}
        >
          <option value="">Todas</option>
          {categorias?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </Select>
        <label className="flex items-center gap-2 pb-2 text-sm text-stone-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-orange-600"
            checked={soloDisponibles}
            onChange={(e) => {
              setSoloDisponibles(e.target.checked)
              setPagina(0)
            }}
          />
          Solo disponibles
        </label>
      </section>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: LIMIT }, (_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-stone-200 bg-white">
              <Skeleton className="aspect-[3/2] rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <EstadoError error={error} onRetry={() => void refetch()} />
      ) : !data || data.items.length === 0 ? (
        <EstadoVacio
          titulo="No encontramos productos"
          mensaje={hayFiltros ? 'Probá con otra búsqueda o categoría.' : 'Todavía no hay productos cargados.'}
          accion={
            hayFiltros ? (
              <Button variant="secondary" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${isFetching ? 'opacity-70' : ''}`}>
            {data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} total={data.total} onChange={setPagina} />
        </>
      )}
    </div>
  )
}
