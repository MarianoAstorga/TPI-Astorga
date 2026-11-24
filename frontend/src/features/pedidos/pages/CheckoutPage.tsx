import { Link, useNavigate } from 'react-router-dom'

import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Card } from '../../../shared/ui/Card'
import { formatPrecio } from '../../../shared/utils/format'
import { useCartStore } from '../../../store/cartStore'
import { CheckoutForm, type CheckoutValues } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/usePedidos'

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="No hay productos para confirmar"
        mensaje="Tu carrito está vacío."
        accion={
          <Link to="/" className="text-sm font-medium text-orange-700 hover:underline">
            Volver al catálogo
          </Link>
        }
      />
    )
  }

  const handleSubmit = async (values: CheckoutValues) => {
    await crearPedido.mutateAsync({
      items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      forma_pago: values.forma_pago,
      direccion_entrega: values.direccion_entrega.trim(),
      notas: values.notas.trim() || null,
    })
    vaciar()
    navigate('/mis-pedidos', { replace: true, state: { pedidoCreado: true } })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card className="p-6">
        <h1 className="mb-5 text-2xl font-bold">Confirmar pedido</h1>
        <CheckoutForm onSubmit={handleSubmit} />
      </Card>

      <aside>
        <Card className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Tu pedido</h2>
            <Link to="/carrito" className="text-xs font-medium text-orange-700 hover:underline">
              Editar
            </Link>
          </div>
          <ul className="space-y-1 text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between text-stone-600">
                <span className="truncate pr-2">
                  {i.cantidad} × {i.nombre}
                </span>
                <span>{formatPrecio(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-stone-200 pt-3 text-lg font-bold">
            <span>Total</span>
            <span>{formatPrecio(total)}</span>
          </div>
        </Card>
      </aside>
    </div>
  )
}
