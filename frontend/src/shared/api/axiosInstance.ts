import axios, { AxiosError } from 'axios'

const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'

// Rutas en las que un 401 es esperable y no significa "sesión vencida"
const RUTAS_SIN_LIMPIEZA = ['/auth/token', '/auth/me']

type SessionExpiredHandler = () => void

let onSessionExpired: SessionExpiredHandler | null = null

/** El authStore registra aquí cómo limpiar la sesión (evita una dependencia circular). */
export function registerSessionExpiredHandler(handler: SessionExpiredHandler): void {
  onSessionExpired = handler
}

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: unknown }>) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    const detail = error.response?.data?.detail

    const sesionVencida = status === 401 && !RUTAS_SIN_LIMPIEZA.some((ruta) => url.includes(ruta))
    const cuentaDesactivada = status === 400 && detail === CUENTA_DESACTIVADA

    if ((sesionVencida || cuentaDesactivada) && onSessionExpired) {
      onSessionExpired()
    }
    return Promise.reject(error)
  },
)
