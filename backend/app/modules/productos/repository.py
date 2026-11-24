from typing import Sequence

from sqlalchemy import func
from sqlmodel import col, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    model = Producto

    def get_for_update(self, producto_id: int) -> Producto | None:
        """Lee el producto bloqueando la fila (en PostgreSQL) para descontar stock sin carreras."""
        statement = select(Producto).where(Producto.id == producto_id).with_for_update()
        return self.session.exec(statement).first()

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, Sequence[Producto]]:
        filtros = [Producto.activo == True]  # noqa: E712
        if search:
            filtros.append(col(Producto.nombre).ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total_stmt = select(func.count()).select_from(Producto).where(*filtros)
        total = self.session.exec(total_stmt).one()

        items_stmt = (
            select(Producto).where(*filtros).order_by(col(Producto.nombre)).offset(skip).limit(limit)
        )
        items = self.session.exec(items_stmt).all()
        return total, items
