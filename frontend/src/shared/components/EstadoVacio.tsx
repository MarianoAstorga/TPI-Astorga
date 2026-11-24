import type { ReactNode } from 'react'

interface EstadoVacioProps {
  titulo: string
  mensaje?: string
  accion?: ReactNode
}

export function EstadoVacio({ titulo, mensaje, accion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
      <div className="mb-3 text-4xl" aria-hidden="true">
        🍽️
      </div>
      <h3 className="font-semibold text-stone-700">{titulo}</h3>
      {mensaje && <p className="mt-1 max-w-sm text-sm text-stone-500">{mensaje}</p>}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  )
}
