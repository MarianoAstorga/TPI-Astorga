import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createProducto, deleteProducto, getProductos, updateProducto, updateStock } from '../api/productos'
import type { ProductoCreate, ProductosFiltros, ProductoStockUpdate, ProductoUpdate } from '../types/producto'

export const productosKeys = {
  all: ['productos'] as const,
  list: (filtros: ProductosFiltros) => ['productos', filtros] as const,
}

export function useProductos(filtros: ProductosFiltros) {
  return useQuery({
    queryKey: productosKeys.list(filtros),
    queryFn: () => getProductos(filtros),
    placeholderData: keepPreviousData,
  })
}

function useInvalidarProductos() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: productosKeys.all })
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: (payload: ProductoCreate) => createProducto(payload),
    onSuccess: invalidar,
  })
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductoUpdate }) => updateProducto(id, payload),
    onSuccess: invalidar,
  })
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductoStockUpdate }) => updateStock(id, payload),
    onSuccess: invalidar,
  })
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: deleteProducto,
    onSuccess: invalidar,
  })
}
