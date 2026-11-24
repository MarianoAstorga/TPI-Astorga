import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { handleApiError } from '../../../shared/api/handleApiError'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { TablaSkeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import { formatPrecio } from '../../../shared/utils/format'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoForm } from '../components/ProductoForm'
import { StockForm } from '../components/StockForm'
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '../hooks/useProductos'
import type { Producto } from '../types/producto'

type ModalState =
  | { tipo: 'crear' }
  | { tipo: 'editar'; producto: Producto }
  | { tipo: 'stock'; producto: Producto }
  | { tipo: 'eliminar'; producto: Producto }
  | null

export function AdminProductosPage() {
  // El panel trae hasta 100 productos y pagina del lado del cliente
  const { data, isLoading, isError, error, refetch } = useProductos({ skip: 0, limit: 100 })
  const { data: categorias = [] } = useCategorias()
  const [modal, setModal] = useState<ModalState>(null)
  const [filtro, setFiltro] = useState('')

  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const actualizarStock = useActualizarStock()
  const eliminar = useEliminarProducto()

  const cerrar = () => {
    setModal(null)
    eliminar.reset()
  }

  const columns = useMemo<ColumnDef<Producto>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      {
        accessorKey: 'nombre',
        header: 'Nombre',
        cell: ({ row }) => <span className="font-medium text-stone-900">{row.original.nombre}</span>,
      },
      { id: 'categoria', accessorFn: (p) => p.categoria.nombre, header: 'Categoría' },
      {
        accessorKey: 'precio_base',
        header: 'Precio',
        cell: ({ row }) => formatPrecio(row.original.precio_base),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => (
          <span className={row.original.stock === 0 ? 'font-semibold text-red-600' : ''}>{row.original.stock}</span>
        ),
      },
      {
        accessorKey: 'disponible',
        header: 'Disponible',
        cell: ({ row }) =>
          row.original.disponible ? (
            <span className="text-emerald-700">Sí</span>
          ) : (
            <span className="text-stone-400">No</span>
          ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button size="sm" variant="secondary" onClick={() => setModal({ tipo: 'editar', producto: row.original })}>
              Editar
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setModal({ tipo: 'stock', producto: row.original })}>
              Stock
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setModal({ tipo: 'eliminar', producto: row.original })}>
              <span className="text-red-600">Eliminar</span>
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  const productos = useMemo(() => {
    const items = data?.items ?? []
    const q = filtro.trim().toLowerCase()
    return q ? items.filter((p) => p.nombre.toLowerCase().includes(q)) : items
  }, [data, filtro])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-full max-w-xs">
          <Input id="filtro-productos" placeholder="Filtrar por nombre…" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
        </div>
        <Button onClick={() => setModal({ tipo: 'crear' })} disabled={categorias.length === 0}>
          + Nuevo producto
        </Button>
      </div>

      {isLoading ? (
        <TablaSkeleton />
      ) : isError ? (
        <EstadoError error={error} onRetry={() => void refetch()} />
      ) : (
        <DataTable data={productos} columns={columns} emptyMessage="No hay productos cargados" />
      )}

      <Modal
        open={modal?.tipo === 'crear' || modal?.tipo === 'editar'}
        title={modal?.tipo === 'editar' ? 'Editar producto' : 'Nuevo producto'}
        onClose={cerrar}
      >
        {(modal?.tipo === 'crear' || modal?.tipo === 'editar') && (
          <ProductoForm
            key={modal.tipo === 'editar' ? modal.producto.id : 'nuevo'}
            producto={modal.tipo === 'editar' ? modal.producto : undefined}
            categorias={categorias}
            onCancel={cerrar}
            onSubmit={async (payload) => {
              if (modal.tipo === 'editar') {
                await actualizar.mutateAsync({ id: modal.producto.id, payload })
              } else {
                await crear.mutateAsync(payload)
              }
              cerrar()
            }}
          />
        )}
      </Modal>

      <Modal open={modal?.tipo === 'stock'} title="Stock y disponibilidad" onClose={cerrar}>
        {modal?.tipo === 'stock' && (
          <StockForm
            producto={modal.producto}
            onCancel={cerrar}
            onSubmit={async (payload) => {
              await actualizarStock.mutateAsync({ id: modal.producto.id, payload })
              cerrar()
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={modal?.tipo === 'eliminar'}
        titulo="Eliminar producto"
        mensaje={
          modal?.tipo === 'eliminar'
            ? `¿Dar de baja "${modal.producto.nombre}"? Dejará de mostrarse en el catálogo.`
            : ''
        }
        textoConfirmar="Eliminar"
        peligroso
        cargando={eliminar.isPending}
        error={eliminar.isError ? handleApiError(eliminar.error) : null}
        onClose={cerrar}
        onConfirm={() => {
          if (modal?.tipo === 'eliminar') eliminar.mutate(modal.producto.id, { onSuccess: cerrar })
        }}
      />
    </div>
  )
}
