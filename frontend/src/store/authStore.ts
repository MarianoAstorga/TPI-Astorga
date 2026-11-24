import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import * as authApi from '../features/auth/api/auth'
import type { LoginData } from '../features/auth/types/auth'
import type { UserPublic } from '../features/usuarios/types/usuario'
import { registerSessionExpiredHandler } from '../shared/api/axiosInstance'
import { queryClient } from '../shared/api/queryClient'

interface AuthState {
  usuario: UserPublic | null
  cargando: boolean
  login: (data: LoginData) => Promise<UserPublic>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiar: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (data) => {
        await authApi.login(data)
        // La cookie la guarda el navegador; con /me se obtienen los datos del usuario
        const usuario = await authApi.getMe()
        set({ usuario, cargando: false })
        return usuario
      },

      logout: async () => {
        try {
          await authApi.logout()
        } finally {
          set({ usuario: null })
          queryClient.removeQueries({ queryKey: ['pedidos'] })
          queryClient.removeQueries({ queryKey: ['usuarios'] })
        }
      },

      checkSession: async () => {
        set({ cargando: true })
        try {
          const usuario = await authApi.getMe()
          set({ usuario, cargando: false })
        } catch {
          set({ usuario: null, cargando: false })
        }
      },

      limpiar: () => {
        set({ usuario: null, cargando: false })
        queryClient.removeQueries({ queryKey: ['pedidos'] })
        queryClient.removeQueries({ queryKey: ['usuarios'] })
      },
    }),
    {
      name: 'food-store-auth',
      storage: createJSONStorage(() => localStorage),
      // Solo se persisten los datos del usuario; el token vive en la cookie HttpOnly
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)

registerSessionExpiredHandler(() => useAuthStore.getState().limpiar())
