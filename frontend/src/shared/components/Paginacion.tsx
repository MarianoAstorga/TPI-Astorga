import { Button } from '../ui/Button'

interface PaginacionProps {
  pagina: number // base 0
  totalPaginas: number
  total: number
  onChange: (pagina: number) => void
}

export function Paginacion({ pagina, totalPaginas, total, onChange }: PaginacionProps) {
  if (totalPaginas <= 1) {
    return <p className="text-sm text-stone-500">{total} resultado{total === 1 ? '' : 's'}</p>
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-stone-500">
        Página {pagina + 1} de {totalPaginas} · {total} resultados
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={pagina === 0} onClick={() => onChange(pagina - 1)}>
          ← Anterior
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={pagina >= totalPaginas - 1}
          onClick={() => onChange(pagina + 1)}
        >
          Siguiente →
        </Button>
      </div>
    </div>
  )
}
