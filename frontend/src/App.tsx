import { useEffect } from 'react'

import { AppRouter } from './routes/AppRouter'
import { useAuthStore } from './store/authStore'

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession)

  // Única llamada a la API dentro de un useEffect: confirmar la sesión al cargar la app
  useEffect(() => {
    void checkSession()
  }, [checkSession])

  return <AppRouter />
}
