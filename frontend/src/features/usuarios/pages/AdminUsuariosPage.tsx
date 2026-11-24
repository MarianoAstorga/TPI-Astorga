import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError, MensajeError } from '../../../shared/components/EstadoError'
import { TablaSkeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { useAuthStore } from '../../../store/authStore'
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '../hooks/useUsuarios'
import type { UserPublic } from '../types/usuario'

export function AdminUsuariosPage() {
  const { data = [], isLoading, isError, error, refetch } = useUsuarios()
  const usuarioSesionId = useAuthStore((s) => s.usuario?.id)
  const activar = useActivarUsuario()
  const desactivar = useDesactivarUsuario()
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<UserPublic>[]>(
    () => [
      {
        accessorKey: 'username',
        header: 'Usuario',
        cell: ({ row }) => <span className="font-medium text-stone-900">@{row.original.username}</span>,
      },
      { accessorKey: 'full_name', header: 'Nombre' },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'role',
        header: 'Rol',
        cell: ({ row }) =>
          row.original.role === 'admin' ? (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">admin</span>
          ) : (
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700">user</span>
          ),
      },
      {
        accessorKey: 'disabled',
        header: 'Estado',
        cell: ({ row }) =>
          row.original.disabled ? (
            <span className="text-red-600">Desactivado</span>
          ) : (
            <span className="text-emerald-700">Activo</span>
          ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => {
          const u = row.original
          const onError = (err: unknown) => setErrorAccion(handleApiError(err))
          if (u.disabled) {
            return (
              <Button
                size="sm"
                variant="secondary"
                loading={activar.isPending && activar.variables === u.id}
                onClick={() => {
                  setErrorAccion(null)
                  activar.mutate(u.id, { onError })
                }}
              >
                Activar
              </Button>
            )
          }
          // No se ofrece desactivar al usuario de la sesión actual
          if (u.id === usuarioSesionId) return <span className="text-xs text-stone-400">(vos)</span>
          return (
            <Button
              size="sm"
              variant="danger"
              loading={desactivar.isPending && desactivar.variables === u.id}
              onClick={() => {
                setErrorAccion(null)
                desactivar.mutate(u.id, { onError })
              }}
            >
              Desactivar
            </Button>
          )
        },
      },
    ],
    [activar, desactivar, usuarioSesionId],
  )

  return (
    <div className="space-y-4">
      <MensajeError mensaje={errorAccion} />
      {isLoading ? (
        <TablaSkeleton />
      ) : isError ? (
        <EstadoError error={error} onRetry={() => void refetch()} />
      ) : (
        <DataTable data={data} columns={columns} emptyMessage="No hay usuarios" />
      )}
    </div>
  )
}
