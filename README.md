# Food Store: sistema de pedidos de comida

Trabajo Práctico Integrador · Programación 4 · Tecnicatura Universitaria en Programación a Distancia

Aplicación web para un negocio de comidas: los clientes se registran, recorren el catálogo, arman un carrito y confirman pedidos indicando dirección y forma de pago. El administrador gestiona categorías, productos, stock, pedidos y usuarios desde un panel.

- **Repositorio:** https://github.com/MarianoAstorga/TPI-Astorga

- **Video de demostración:** [https://youtu.be/cLBxVsGzohU]

---

## Tecnologías

| Backend  | Python 3.11–3.13, FastAPI, SQLModel, PostgreSQL (o SQLite en desarrollo), JWT en cookie HttpOnly, Passlib + bcrypt |
| Frontend | React 19 + TypeScript (strict), Vite 7, Tailwind CSS 4, TanStack Query / Form / Table, Zustand, Axios, React Router 7 |

## Requisitos

- **Python** 3.11, 3.12 o 3.13 (SQLModel no funciona con 3.14)
- **PostgreSQL** 15 o superior (opcional: se puede usar SQLite para desarrollo)
- **Node.js** 20.19 o superior
- **pnpm** 9 o superior (`npm install -g pnpm`)

## Estructura del proyecto

```
food-store/
├── backend/
│   ├── app/
│   │   ├── main.py               # App FastAPI, CORS y routers bajo /api/v1
│   │   ├── core/                 # config, database, security, deps, unit_of_work, base_repository
│   │   ├── modules/              # auth, usuarios, categorias, productos, pedidos
│   │   │   └── <modulo>/         # models, schemas, repository, unit_of_work, service, router
│   │   └── db/seed.py            # Carga inicial 
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── shared/               # api (axios, errores, queryClient), ui, components, layout
    │   ├── features/             # auth, categorias, productos, usuarios, pedidos
    │   │   └── <feature>/        # pages, components, hooks, api, types
    │   ├── store/                # authStore y cartStore (Zustand + persist)
    │   └── routes/               # AppRouter y ProtectedRoute
    ├── package.json
    └── .env.example
```

---

## Backend

### 1. Base de datos

Con PostgreSQL, crear la base (ajustar usuario y contraseña):

```sql
CREATE DATABASE foodstore_db;
```

Para desarrollo rápido se puede usar SQLite: alcanza con poner `DATABASE_URL=sqlite:///./foodstore.db` en el `.env` y no hace falta crear nada.

### 2. Instalación

```bash
cd backend
python -m venv venv

# Linux / macOS
source venv/bin/activate
# Windows (PowerShell)
venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

### 3. Variables de entorno

Copiar el archivo de ejemplo y completar los valores:

```bash
# Linux / macOS
cp .env.example .env
# Windows
copy .env.example .env
```

| `DATABASE_URL` | Conexión a la base | `postgresql://user:pass@localhost:5432/foodstore_db` (desarrollo: `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Clave para firmar el JWT, **mínimo 32 caracteres** | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |

### 4. Datos iniciales (seed)

```bash
python -m app.db.seed
```

Crea las tablas y carga usuarios, 5 categorías y 10 productos con stock. Se puede ejecutar más de una vez sin duplicar datos.

### 5. Ejecución

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación Swagger: http://localhost:8000/docs
- Documentación ReDoc: http://localhost:8000/redoc

---

## Frontend

### 1. Instalación

```bash
cd frontend
pnpm install
```

### 2. Variables de entorno

```bash
# Linux / macOS
cp .env.example .env
# Windows
copy .env.example .env
```


| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

### 3. Ejecución

```bash
pnpm build   # compila y verifica los tipos
pnpm dev     # servidor de desarrollo
```

Abrir http://localhost:5173

> **Importante:** usar `localhost` tanto en el navegador como en `VITE_API_URL` y `FRONTEND_ORIGIN`. Si se mezcla `localhost` con `127.0.0.1` el navegador los toma como sitios distintos y no envía la cookie de sesión.

---

## Usuarios del seed

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | `admin` | `Admin1234!` |
| Cliente | `cliente` | `Cliente1234!` |

También se puede crear un cliente nuevo desde la pantalla de registro.

---

## Funcionalidades

**Cliente**
- Registro e inicio de sesión (la sesión viaja en una cookie HttpOnly; el frontend nunca maneja el token).
- Catálogo paginado en el servidor, con búsqueda por nombre, filtro por categoría y por disponibilidad.
- Carrito persistido en el navegador.
- Checkout con dirección de entrega, forma de pago (efectivo o transferencia) y notas.
- "Mis pedidos": listado con filtro por estado, detalle y cancelación mientras el pedido está pendiente.

**Administrador**
- Resumen con pedidos del día, ingresos de pedidos entregados y cantidad por estado.
- ABM de categorías y productos, cambio de stock y disponibilidad.
- Gestión de pedidos: avanzar o cancelar según la máquina de estados.
- Gestión de usuarios: activar y desactivar (un admin no puede desactivarse a sí mismo).

## Reglas de negocio

| RN-01 Crear pedido | Al menos un ítem, sin productos repetidos; cada producto debe estar activo, disponible y con stock. Se descuenta el stock y se copian nombre y precio a cada línea, todo en una única transacción (Unit of Work). |
| RN-02 Transiciones | `PENDIENTE → EN_PREPARACION / CANCELADO`, `EN_PREPARACION → ENTREGADO / CANCELADO`. `ENTREGADO` y `CANCELADO` son terminales. Transición inválida: 400. |
| RN-03 Cancelar | Se restituye el stock de cada línea en la misma transacción del cambio de estado. |
| RN-04 Permisos | El cliente solo ve y cancela sus pedidos (y solo en `PENDIENTE`); el admin ve todos y los gestiona. |
| RN-05 Inmutabilidad | No existen endpoints para editar ni borrar pedidos; líneas y total quedan fijos. |
| RN-06 Datos del pedido | `forma_pago` ∈ {`EFECTIVO`, `TRANSFERENCIA`} y `direccion_entrega` de 5 a 200 caracteres (validado en el schema). |

## Endpoints principales

Todos bajo el prefijo `/api/v1`.


| POST | `/auth/register` · `/auth/token` · `/auth/logout` | Público |
| GET | `/auth/me` | Sesión |
| GET / POST | `/admin/usuarios` · `/admin/usuarios/{id}/activar` · `/admin/usuarios/{id}/desactivar` | admin |
| GET | `/categorias` · `/categorias/{id}` | Público |
| POST / PUT / DELETE | `/categorias` · `/categorias/{id}` | admin |
| GET | `/productos` (skip, limit, search, categoria_id, disponible) · `/productos/{id}` | Público |
| POST / PUT / PATCH / DELETE | `/productos` · `/productos/{id}` · `/productos/{id}/stock` | admin |
| POST / GET | `/pedidos` | Sesión |
| GET | `/pedidos/resumen` | admin |
| GET | `/pedidos/{id}` | Dueño o admin |
| PATCH | `/pedidos/{id}/estado` | admin |
| PATCH | `/pedidos/{id}/cancelar` | Dueño |

