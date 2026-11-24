import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { UserPublic } from '../../usuarios/types/usuario'
import type { LoginData, MensajeResponse, RegisterData } from '../types/auth'

export async function login({ username, password }: LoginData): Promise<MensajeResponse> {
  // El endpoint espera un formulario OAuth2 (application/x-www-form-urlencoded)
  const body = new URLSearchParams({ username, password })
  const { data } = await axiosInstance.post<MensajeResponse>('/auth/token', body)
  return data
}

export async function register(payload: RegisterData): Promise<UserPublic> {
  const { data } = await axiosInstance.post<UserPublic>('/auth/register', payload)
  return data
}

export async function logout(): Promise<MensajeResponse> {
  const { data } = await axiosInstance.post<MensajeResponse>('/auth/logout')
  return data
}

export async function getMe(): Promise<UserPublic> {
  const { data } = await axiosInstance.get<UserPublic>('/auth/me')
  return data
}
