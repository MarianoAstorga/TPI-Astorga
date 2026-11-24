import { NavLink, Outlet } from 'react-router-dom'

const secciones = [
  { to: '/admin/resumen', label: 'Resumen' },
  { to: '/admin/pedidos', label: 'Pedidos' },
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/categorias', label: 'Categorías' },
  { to: '/admin/usuarios', label: 'Usuarios' },
]

export function AdminLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Panel de administración</h1>
        <div className="mt-3 flex flex-wrap gap-1 border-b border-stone-200">
          {secciones.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              className={({ isActive }) =>
                `-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'border-orange-600 text-orange-700'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`
              }
            >
              {s.label}
            </NavLink>
          ))}
        </div>
      </div>
      <Outlet />
    </div>
  )
}
