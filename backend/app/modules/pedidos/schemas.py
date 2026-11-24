from datetime import datetime

from pydantic import field_validator
from sqlmodel import Field, SQLModel

from app.core.utils import ensure_utc
from app.modules.pedidos.models import EstadoPedido, FormaPago


class ItemPedidoCreate(SQLModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: str | None = Field(default=None, max_length=500)

    @field_validator("direccion_entrega")
    @classmethod
    def _sin_espacios(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 5:
            raise ValueError("La dirección debe tener al menos 5 caracteres")
        return value


class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class UsuarioPedidoRead(SQLModel):
    id: int
    username: str
    full_name: str


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: str | None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]
    usuario: UsuarioPedidoRead | None = None

    @field_validator("created_at", "updated_at")
    @classmethod
    def _utc(cls, value: datetime) -> datetime:
        return ensure_utc(value)


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


class CambioEstado(SQLModel):
    estado: EstadoPedido


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
