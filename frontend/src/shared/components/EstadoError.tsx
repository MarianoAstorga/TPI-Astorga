import { handleApiError } from '../api/handleApiError'
import { Button } from '../ui/Button'

interface EstadoErrorProps {
  error: unknown
  onRetry?: () => void
}

export function EstadoError({ error, onRetry }: EstadoErrorProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-6 text-center">
      <p className="font-medium text-red-700">No se pudieron cargar los datos</p>
      <p className="mt-1 text-sm text-red-600">{handleApiError(error)}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}

export function MensajeError({ mensaje }: { mensaje: string | null }) {
  if (!mensaje) return null
  return (
    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {mensaje}
    </p>
  )
}
