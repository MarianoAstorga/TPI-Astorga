import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  cambiarEstadoPedido,
  cancelarPedido,
  createPedido,
  getPedido,
  getPedidos,
  getResumenPedidos,
} from '../api/pedidos'
import type { EstadoPedido, PedidoCreate, PedidosFiltros } from '../types/pedido'

export const pedidosKeys = {
  all: ['pedidos'] as const,
  list: (filtros: PedidosFiltros) => ['pedidos', 'lista', filtros] as const,
  detail: (id: number) => ['pedidos', 'detalle', id] as const,
  resumen: ['pedidos', 'resumen'] as const,
}

export function usePedidos(filtros: PedidosFiltros) {
  return useQuery({
    queryKey: pedidosKeys.list(filtros),
    queryFn: () => getPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function usePedido(id: number | null) {
  return useQuery({
    queryKey: pedidosKeys.detail(id ?? 0),
    queryFn: () => getPedido(id ?? 0),
    enabled: id !== null,
  })
}

export function useResumenPedidos() {
  return useQuery({
    queryKey: pedidosKeys.resumen,
    queryFn: getResumenPedidos,
  })
}

/** Un cambio en un pedido afecta listados, resumen y stock de productos. */
function useInvalidarPedidos() {
  const queryClient = useQueryClient()
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: pedidosKeys.all }),
      queryClient.invalidateQueries({ queryKey: ['productos'] }),
    ])
  }
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({
    mutationFn: (payload: PedidoCreate) => createPedido(payload),
    onSuccess: invalidar,
  })
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: invalidar,
  })
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: invalidar,
  })
}
