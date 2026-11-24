import { useState } from 'react'
import { useForm } from '@tanstack/react-form'

import { handleApiError } from '../../../shared/api/handleApiError'
import { MensajeError } from '../../../shared/components/EstadoError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { fieldError } from '../../../shared/utils/fieldError'
import type { Producto, ProductoStockUpdate } from '../types/producto'

interface StockFormProps {
  producto: Producto
  onSubmit: (data: ProductoStockUpdate) => Promise<unknown>
  onCancel: () => void
}

export function StockForm({ producto, onSubmit, onCancel }: StockFormProps) {
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await onSubmit(value)
      } catch (err) {
        setError(handleApiError(err))
      }
    },
  })

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <p className="text-sm text-stone-600">
        Producto: <span className="font-medium text-stone-900">{producto.nombre}</span>
      </p>

      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) =>
            Number.isNaN(value)
              ? 'Ingresá un número'
              : value < 0
                ? 'No puede ser negativo'
                : !Number.isInteger(value)
                  ? 'Debe ser entero'
                  : undefined,
        }}
      >
        {(field) => (
          <Input
            id={field.name}
            label="Stock"
            type="number"
            min={0}
            step="1"
            value={Number.isNaN(field.state.value) ? '' : field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.valueAsNumber)}
            error={fieldError(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              className="h-4 w-4 accent-orange-600"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>

      <MensajeError mensaje={error} />

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit} loading={isSubmitting}>
              Guardar
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
