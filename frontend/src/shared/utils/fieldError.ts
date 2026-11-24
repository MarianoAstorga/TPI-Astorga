interface FieldMetaLike {
  isTouched: boolean
  errors: unknown[]
}

/** Primer error de un campo de TanStack Form, solo si el usuario ya lo tocó. */
export function fieldError(meta: FieldMetaLike): string | undefined {
  if (!meta.isTouched) return undefined
  const primero = meta.errors.find((e) => typeof e === 'string' && e.length > 0)
  return typeof primero === 'string' ? primero : undefined
}
