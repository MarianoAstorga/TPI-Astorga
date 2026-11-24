"""Carga inicial de datos. Se puede ejecutar varias veces sin duplicar registros.

Uso:  python -m app.db.seed
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

USUARIOS = [
    {
        "username": "admin",
        "full_name": "Administrador",
        "email": "admin@foodstore.com",
        "password": "Admin1234!",
        "role": "admin",
    },
    {
        "username": "cliente",
        "full_name": "Cliente de Prueba",
        "email": "cliente@foodstore.com",
        "password": "Cliente1234!",
        "role": "user",
    },
]

CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas caseras con pan de papa"),
    ("Pizzas", "Pizzas a la piedra, 8 porciones"),
    ("Empanadas", "Empanadas al horno, por unidad"),
    ("Bebidas", "Gaseosas, aguas y jugos"),
    ("Postres", "Postres y dulces de la casa"),
]


def _img(texto: str) -> str:
    return f"https://placehold.co/600x400/f97316/ffffff?text={texto.replace(' ', '+')}"


# (categoria, nombre, descripcion, precio, stock)
PRODUCTOS = [
    ("Hamburguesas", "Hamburguesa Clásica", "Medallón de carne, lechuga, tomate y cheddar", 8500.0, 30),
    ("Hamburguesas", "Hamburguesa Doble Bacon", "Doble medallón, panceta crocante y cheddar", 11500.0, 20),
    ("Hamburguesas", "Hamburguesa Veggie", "Medallón de lentejas, rúcula y alioli", 9000.0, 15),
    ("Pizzas", "Pizza Muzzarella", "Salsa de tomate, muzzarella y aceitunas", 12000.0, 25),
    ("Pizzas", "Pizza Napolitana", "Muzzarella, rodajas de tomate y ajo", 13500.0, 18),
    ("Empanadas", "Empanada de Carne", "Carne cortada a cuchillo, al horno", 1500.0, 100),
    ("Empanadas", "Empanada de Jamón y Queso", "Jamón cocido y muzzarella", 1400.0, 80),
    ("Bebidas", "Gaseosa Cola 500 ml", "Botella individual", 2200.0, 60),
    ("Bebidas", "Agua Mineral 500 ml", "Sin gas", 1500.0, 60),
    ("Postres", "Flan Casero", "Con dulce de leche o crema", 3500.0, 12),
]


def seed() -> None:
    create_all_tables()

    with Session(engine) as session:
        for data in USUARIOS:
            existe = session.exec(select(Usuario).where(Usuario.username == data["username"])).first()
            if existe is None:
                session.add(
                    Usuario(
                        username=data["username"],
                        full_name=data["full_name"],
                        email=data["email"],
                        hashed_password=hash_password(data["password"]),
                        role=data["role"],
                    )
                )
                print(f"  + usuario {data['username']}")

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(categoria)
                session.flush()
                print(f"  + categoría {nombre}")
            categorias[nombre] = categoria

        for cat_nombre, nombre, descripcion, precio, stock in PRODUCTOS:
            existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if existe is None:
                session.add(
                    Producto(
                        categoria_id=categorias[cat_nombre].id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        imagen_url=_img(nombre),
                        stock=stock,
                    )
                )
                print(f"  + producto {nombre}")

        session.commit()

    print("Seed finalizado.")


if __name__ == "__main__":
    seed()
