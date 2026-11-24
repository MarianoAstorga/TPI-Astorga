import axios from 'axios'

interface ValidationIssue {
  loc?: (string | number)[]
  msg?: string
}

function isValidationIssueList(value: unknown): value is ValidationIssue[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'object' && v !== null)
}

/** Convierte el error de la API en un mensaje legible para mostrar en pantalla. */
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError<{ detail?: unknown }>(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Verificá que la API esté en ejecución.'
    }
    const detail = error.response.data?.detail

    if (typeof detail === 'string') return detail

    // 422: FastAPI devuelve una lista con los campos inválidos
    if (isValidationIssueList(detail) && detail.length > 0) {
      return detail
        .map((issue) => {
          const campo = issue.loc?.filter((p) => p !== 'body').join('.')
          return campo ? `${campo}: ${issue.msg ?? 'inválido'}` : (issue.msg ?? 'Dato inválido')
        })
        .join(' · ')
    }
    return `Error ${error.response.status}`
  }
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado'
}
