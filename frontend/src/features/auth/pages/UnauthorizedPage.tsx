import { Link } from 'react-router-dom'

export function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-5xl font-bold text-orange-600">403</p>
      <h1 className="mt-3 text-xl font-semibold">No tenés permiso para ver esta página</h1>
      <p className="mt-2 text-sm text-stone-500">Esta sección está reservada para otro tipo de usuario.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
