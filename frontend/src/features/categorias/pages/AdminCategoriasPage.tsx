import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { handleApiError } from '../../../shared/api/handleApiError'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { TablaSkeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { CategoriaForm } from '../components/CategoriaForm'
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from '../hooks/useCategorias'
import type { Categoria } from '../types/categoria'

type ModalState =
  | { tipo: 'crear' }
  | { tipo: 'editar'; categoria: Categoria }
  | { tipo: 'eliminar'; categoria: Categoria }
  | null

export function AdminCategoriasPage() {
  const { data = [], isLoading, isError, error, refetch } = useCategorias()
  const [modal, setModal] = useState<ModalState>(null)

  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const eliminar = useEliminarCategoria()

  const cerrar = () => {
    setModal(null)
    eliminar.reset()
  }

  const columns = useMemo<ColumnDef<Categoria>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      {
        accessorKey: 'nombre',
        header: 'Nombre',
        cell: ({ row }) => <span className="font-medium text-stone-900">{row.original.nombre}</span>,
      },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        cell: ({ row }) => (
          <span className="block max-w-md truncate text-stone-500">{row.original.descripcion ?? '—'}</span>
        ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button size="sm" variant="secondary" onClick={() => setModal({ tipo: 'editar', categoria: row.original })}>
              Editar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setModal({ tipo: 'eliminar', categoria: row.original })}>
              <span className="text-red-600">Eliminar</span>
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setModal({ tipo: 'crear' })}>+ Nueva categoría</Button>
      </div>

      {isLoading ? (
        <TablaSkeleton />
      ) : isError ? (
        <EstadoError error={error} onRetry={() => void refetch()} />
      ) : (
        <DataTable data={data} columns={columns} emptyMessage="No hay categorías cargadas" />
      )}

      <Modal
        open={modal?.tipo === 'crear' || modal?.tipo === 'editar'}
        title={modal?.tipo === 'editar' ? 'Editar categoría' : 'Nueva categoría'}
        onClose={cerrar}
      >
        {(modal?.tipo === 'crear' || modal?.tipo === 'editar') && (
          <CategoriaForm
            key={modal.tipo === 'editar' ? modal.categoria.id : 'nueva'}
            categoria={modal.tipo === 'editar' ? modal.categoria : undefined}
            onCancel={cerrar}
            onSubmit={async (payload) => {
              if (modal.tipo === 'editar') {
                await actualizar.mutateAsync({ id: modal.categoria.id, payload })
              } else {
                await crear.mutateAsync(payload)
              }
              cerrar()
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={modal?.tipo === 'eliminar'}
        titulo="Eliminar categoría"
        mensaje={
          modal?.tipo === 'eliminar'
            ? `¿Dar de baja "${modal.categoria.nombre}"? Sus productos seguirán visibles; si querés retirarlos del catálogo, dalos de baja también. El nombre no podrá reutilizarse.`
            : ''
        }
        textoConfirmar="Eliminar"
        peligroso
        cargando={eliminar.isPending}
        error={eliminar.isError ? handleApiError(eliminar.error) : null}
        onClose={cerrar}
        onConfirm={() => {
          if (modal?.tipo === 'eliminar') eliminar.mutate(modal.categoria.id, { onSuccess: cerrar })
        }}
      />
    </div>
  )
}
