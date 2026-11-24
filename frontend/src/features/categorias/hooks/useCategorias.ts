import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createCategoria, deleteCategoria, getCategorias, updateCategoria } from '../api/categorias'
import type { CategoriaCreate, CategoriaUpdate } from '../types/categoria'

export const categoriasKeys = {
  all: ['categorias'] as const,
}

export function useCategorias() {
  return useQuery({
    queryKey: categoriasKeys.all,
    queryFn: getCategorias,
    staleTime: 5 * 60_000,
  })
}

export function useCrearCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CategoriaCreate) => createCategoria(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriasKeys.all }),
  })
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoriaUpdate }) => updateCategoria(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriasKeys.all })
      // Los productos muestran el nombre de su categoría
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCategoria,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriasKeys.all }),
  })
}
