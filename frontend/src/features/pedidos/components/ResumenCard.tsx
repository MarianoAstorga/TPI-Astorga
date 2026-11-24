import { Card } from '../../../shared/ui/Card'

interface ResumenCardProps {
  titulo: string
  valor: string | number
  descripcion?: string
  acento?: 'amber' | 'sky' | 'emerald' | 'stone' | 'orange'
}

const acentos = {
  amber: 'border-l-amber-400',
  sky: 'border-l-sky-400',
  emerald: 'border-l-emerald-500',
  stone: 'border-l-stone-400',
  orange: 'border-l-orange-500',
} as const

export function ResumenCard({ titulo, valor, descripcion, acento = 'stone' }: ResumenCardProps) {
  return (
    <Card className={`border-l-4 p-5 ${acentos[acento]}`}>
      <p className="text-sm font-medium text-stone-500">{titulo}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-stone-900">{valor}</p>
      {descripcion && <p className="mt-1 text-xs text-stone-400">{descripcion}</p>}
    </Card>
  )
}
