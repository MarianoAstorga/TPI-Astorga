import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const baseControl =
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 disabled:bg-stone-100'

function controlClass(error?: string): string {
  return `${baseControl} ${error ? 'border-red-400' : 'border-stone-300 focus:border-orange-500'}`
}

interface FieldWrapperProps {
  id: string
  label?: string
  error?: string
  children: ReactNode
}

function FieldWrapper({ id, label, error, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label?: string
  error?: string
}

export function Input({ id, label, error, className = '', ...rest }: InputProps) {
  return (
    <FieldWrapper id={id} label={label} error={error}>
      <input id={id} name={id} className={`${controlClass(error)} ${className}`} {...rest} />
    </FieldWrapper>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string
  label?: string
  error?: string
}

export function Select({ id, label, error, className = '', children, ...rest }: SelectProps) {
  return (
    <FieldWrapper id={id} label={label} error={error}>
      <select id={id} name={id} className={`${controlClass(error)} ${className}`} {...rest}>
        {children}
      </select>
    </FieldWrapper>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string
  label?: string
  error?: string
}

export function Textarea({ id, label, error, className = '', ...rest }: TextareaProps) {
  return (
    <FieldWrapper id={id} label={label} error={error}>
      <textarea id={id} name={id} className={`${controlClass(error)} ${className}`} {...rest} />
    </FieldWrapper>
  )
}
