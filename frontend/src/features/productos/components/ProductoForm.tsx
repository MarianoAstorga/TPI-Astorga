import { useState } from 'react'
import { useForm } from '@tanstack/react-form'

import { handleApiError } from '../../../shared/api/handleApiError'
import { MensajeError } from '../../../shared/components/EstadoError'
import { Button } from '../../../shared/ui/Button'
import { Input, Select, Textarea } from '../../../shared/ui/Input'
import { fieldError } from '../../../shared/utils/fieldError'
import type { Categoria } from '../../categorias/types/categoria'
import type { Producto, ProductoCreate } from '../types/producto'

interface ProductoFormProps {
  producto?: Producto
  categorias: Categoria[]
  onSubmit: (data: ProductoCreate) => Promise<unknown>
  onCancel: () => void
}

function numeroValido(valor: number, entero: boolean): string | undefined {
  if (Number.isNaN(valor)) return 'Ingresá un número'
  if (valor < 0) return 'No puede ser negativo'
  if (entero && !Number.isInteger(valor)) return 'Debe ser un número entero'
  return undefined
}

export function ProductoForm({ producto, categorias, onSubmit, onCancel }: ProductoFormProps) {
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto?.precio_base ?? 0,
      imagen_url: producto?.imagen_url ?? '',
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
      categoria_id: producto?.categoria_id ?? categorias[0]?.id ?? 0,
    },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await onSubmit({
          nombre: value.nombre.trim(),
          descripcion: value.descripcion.trim() || null,
          precio_base: value.precio_base,
          imagen_url: value.imagen_url.trim() || null,
          stock: value.stock,
          disponible: value.disponible,
          categoria_id: value.categoria_id,
        })
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
      <form.Field
        name="nombre"
        validators={{ onChange: ({ value }) => (value.trim().length < 2 ? 'Mínimo 2 caracteres' : undefined) }}
      >
        {(field) => (
          <Input
            id={field.name}
            label="Nombre"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={fieldError(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <Textarea
            id={field.name}
            label="Descripción"
            rows={2}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-3">
        <form.Field name="precio_base" validators={{ onChange: ({ value }) => numeroValido(value, false) }}>
          {(field) => (
            <Input
              id={field.name}
              label="Precio"
              type="number"
              min={0}
              step="0.01"
              value={Number.isNaN(field.state.value) ? '' : field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              error={fieldError(field.state.meta)}
            />
          )}
        </form.Field>

        <form.Field name="stock" validators={{ onChange: ({ value }) => numeroValido(value, true) }}>
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
      </div>

      <form.Field
        name="categoria_id"
        validators={{ onChange: ({ value }) => (value > 0 ? undefined : 'Elegí una categoría') }}
      >
        {(field) => (
          <Select
            id={field.name}
            label="Categoría"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(Number(e.target.value))}
            error={fieldError(field.state.meta)}
          >
            {categorias.length === 0 && <option value={0}>No hay categorías</option>}
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        )}
      </form.Field>

      <form.Field name="imagen_url">
        {(field) => (
          <Input
            id={field.name}
            label="URL de la imagen"
            type="url"
            placeholder="https://…"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
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

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit} loading={isSubmitting}>
              {producto ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
