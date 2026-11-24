import { useState } from 'react'

import { useCartStore } from '../../../store/cartStore'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatPrecio } from '../../../shared/utils/format'
import type { Producto } from '../types/producto'

interface ProductoCardProps {
  producto: Producto
}

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)
  const [imgError, setImgError] = useState(false)
  const [agregado, setAgregado] = useState(false)

  const sinStock = producto.stock <= 0
  const vendible = producto.disponible && !sinStock
  const alcanzoMaximo = enCarrito >= producto.stock

  const handleAgregar = () => {
    agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      imagen_url: producto.imagen_url,
      stock: producto.stock,
    })
    setAgregado(true)
    window.setTimeout(() => setAgregado(false), 1200)
  }

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-[3/2] bg-stone-100">
        {producto.imagen_url && !imgError ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-stone-300">🍔</div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-stone-700">
          {producto.categoria.nombre}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-stone-900">{producto.nombre}</h3>
        {producto.descripcion && <p className="mt-1 line-clamp-2 text-sm text-stone-500">{producto.descripcion}</p>}

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between">
            <p className="text-lg font-bold text-stone-900">{formatPrecio(producto.precio_base)}</p>
            <p className={`text-xs ${vendible ? 'text-stone-500' : 'text-red-600'}`}>
              {!producto.disponible ? 'No disponible' : sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
            </p>
          </div>
          <Button
            className="mt-3 w-full"
            disabled={!vendible || alcanzoMaximo}
            onClick={handleAgregar}
            variant={agregado ? 'secondary' : 'primary'}
          >
            {agregado ? '✓ Agregado' : alcanzoMaximo && vendible ? 'Máximo en carrito' : 'Agregar al carrito'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
