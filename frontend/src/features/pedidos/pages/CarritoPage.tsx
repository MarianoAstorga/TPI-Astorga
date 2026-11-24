import { Link, useNavigate } from 'react-router-dom'

import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatPrecio } from '../../../shared/utils/format'
import { useAuthStore } from '../../../store/authStore'
import { useCartStore } from '../../../store/cartStore'

export function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const quitar = useCartStore((s) => s.quitar)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.total())
  const usuario = useAuthStore((s) => s.usuario)
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        mensaje="Agregá productos desde el catálogo para armar tu pedido."
        accion={
          <Link to="/" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
            Ver catálogo
          </Link>
        }
      />
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Carrito</h1>
          <Button variant="ghost" size="sm" onClick={vaciar}>
            Vaciar carrito
          </Button>
        </div>

        {items.map((item) => (
          <Card key={item.producto_id} className="flex items-center gap-4 p-3">
            <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
              {item.imagen_url && <img src={item.imagen_url} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.nombre}</p>
              <p className="text-sm text-stone-500">{formatPrecio(item.precio_unitario)} c/u</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="secondary"
                aria-label="Restar uno"
                disabled={item.cantidad <= 1}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
              >
                −
              </Button>
              <span className="w-8 text-center text-sm font-medium">{item.cantidad}</span>
              <Button
                size="sm"
                variant="secondary"
                aria-label="Sumar uno"
                disabled={item.cantidad >= item.stock}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
              >
                +
              </Button>
            </div>
            <p className="w-28 text-right font-semibold">{formatPrecio(item.precio_unitario * item.cantidad)}</p>
            <Button size="sm" variant="ghost" aria-label={`Quitar ${item.nombre}`} onClick={() => quitar(item.producto_id)}>
              ✕
            </Button>
          </Card>
        ))}
      </section>

      <aside>
        <Card className="sticky top-20 space-y-4 p-5">
          <h2 className="font-semibold">Resumen</h2>
          <div className="space-y-1 text-sm">
            {items.map((i) => (
              <div key={i.producto_id} className="flex justify-between text-stone-600">
                <span className="truncate pr-2">
                  {i.cantidad} × {i.nombre}
                </span>
                <span>{formatPrecio(i.precio_unitario * i.cantidad)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-3 text-lg font-bold">
            <span>Total</span>
            <span>{formatPrecio(total)}</span>
          </div>
          <p className="text-xs text-stone-500">El precio final se confirma al crear el pedido.</p>
          <Button className="w-full" onClick={() => navigate('/checkout')}>
            {usuario ? 'Confirmar pedido' : 'Ingresar para confirmar'}
          </Button>
        </Card>
      </aside>
    </div>
  )
}
