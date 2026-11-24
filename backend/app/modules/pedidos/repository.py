from datetime import datetime
from typing import Sequence

from sqlalchemy import func
from sqlmodel import col, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import EstadoPedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    model = Pedido

    def list_by_usuario(
        self,
        usuario_id: int | None,
        estado: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[int, Sequence[Pedido]]:
        """Lista pedidos de un usuario; con usuario_id=None lista todos (admin)."""
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filtros.append(Pedido.estado == estado)

        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        statement = (
            select(Pedido)
            .where(*filtros)
            .order_by(col(Pedido.created_at).desc(), col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        )
        return total, self.session.exec(statement).all()

    def count_by_estado(self) -> dict[str, int]:
        statement = select(Pedido.estado, func.count(col(Pedido.id))).group_by(Pedido.estado)
        conteos = {estado.value: 0 for estado in EstadoPedido}
        for estado, cantidad in self.session.exec(statement).all():
            conteos[estado] = cantidad
        return conteos

    def count_desde(self, desde: datetime) -> int:
        statement = select(func.count(col(Pedido.id))).where(Pedido.created_at >= desde)
        return self.session.exec(statement).one()

    def sum_total_by_estado(self, estado: str) -> float:
        statement = select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)
        return float(self.session.exec(statement).one())
