import { useState } from 'react'
import { useForm } from '@tanstack/react-form'

import { handleApiError } from '../../../shared/api/handleApiError'
import { MensajeError } from '../../../shared/components/EstadoError'
import { Button } from '../../../shared/ui/Button'
import { Input, Textarea } from '../../../shared/ui/Input'
import { fieldError } from '../../../shared/utils/fieldError'
import type { FormaPago } from '../types/pedido'

export interface CheckoutValues {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string
}

interface CheckoutFormProps {
  onSubmit: (values: CheckoutValues) => Promise<unknown>
}

const FORMAS_PAGO: { value: FormaPago; label: string; detalle: string }[] = [
  { value: 'EFECTIVO', label: 'Efectivo', detalle: 'Pagás al recibir el pedido' },
  { value: 'TRANSFERENCIA', label: 'Transferencia', detalle: 'Te enviamos los datos de la cuenta' },
]

export function CheckoutForm({ onSubmit }: CheckoutFormProps) {
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
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
      className="space-y-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            if (largo < 5) return 'La dirección debe tener al menos 5 caracteres'
            if (largo > 200) return 'Máximo 200 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <Input
            id={field.name}
            label="Dirección de entrega"
            placeholder="Calle, número, piso/depto"
            autoComplete="street-address"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={fieldError(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-stone-700">Forma de pago</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {FORMAS_PAGO.map((fp) => (
                <label
                  key={fp.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                    field.state.value === fp.value ? 'border-orange-500 bg-orange-50' : 'border-stone-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={fp.value}
                    checked={field.state.value === fp.value}
                    onChange={() => field.handleChange(fp.value)}
                    className="mt-0.5 accent-orange-600"
                  />
                  <span>
                    <span className="block text-sm font-medium">{fp.label}</span>
                    <span className="block text-xs text-stone-500">{fp.detalle}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </form.Field>

      <form.Field
        name="notas"
        validators={{ onChange: ({ value }) => (value.length > 500 ? 'Máximo 500 caracteres' : undefined) }}
      >
        {(field) => (
          <Textarea
            id={field.name}
            label="Notas (opcional)"
            rows={3}
            placeholder="Ej: tocar timbre B, sin cebolla…"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={fieldError(field.state.meta)}
          />
        )}
      </form.Field>

      <MensajeError mensaje={error} />

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={!canSubmit} loading={isSubmitting}>
            Confirmar pedido
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
