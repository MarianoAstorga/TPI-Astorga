const precioFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
})

const fechaFormatter = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function formatPrecio(valor: number): string {
  return precioFormatter.format(valor)
}

export function formatFecha(iso: string): string {
  return fechaFormatter.format(new Date(iso))
}
