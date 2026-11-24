from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Pedidos y productos comparten sesión: el descuento de stock y el pedido
    se confirman (o se revierten) juntos."""

    pedidos: PedidoRepository
    productos: ProductoRepository

    def _init_repositories(self) -> None:
        self.pedidos = PedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
