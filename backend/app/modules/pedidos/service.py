from datetime import datetime, timezone

from app.core.utils import utc_now
from app.modules.pedidos.models import DetallePedido, EstadoPedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic


# --- Excepciones de dominio -------------------------------------------------

class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ReglaDeNegocio(Exception):
    """Base de las violaciones de reglas que responden 400."""


class StockInsuficiente(ReglaDeNegocio):
    pass


class ProductoNoDisponible(ReglaDeNegocio):
    pass


class ProductoRepetido(ReglaDeNegocio):
    pass


class TransicionInvalida(ReglaDeNegocio):
    pass


# --- Máquina de estados (RN-02) ---------------------------------------------

TRANSICIONES: dict[EstadoPedido, set[EstadoPedido]] = {
    EstadoPedido.PENDIENTE: {EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO},
    EstadoPedido.EN_PREPARACION: {EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO},
    EstadoPedido.ENTREGADO: set(),
    EstadoPedido.CANCELADO: set(),
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # RN-01
    def crear(self, data: PedidoCreate, usuario: UserPublic) -> PedidoRead:
        ids = [item.producto_id for item in data.items]
        if len(ids) != len(set(ids)):
            raise ProductoRepetido("Un producto no puede repetirse en el pedido")

        with self.uow as uow:
            pedido = Pedido(
                usuario_id=usuario.id,
                estado=EstadoPedido.PENDIENTE.value,
                forma_pago=data.forma_pago.value,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_for_update(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"Producto {item.producto_id} no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto '{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}' "
                        f"(disponible: {producto.stock}, pedido: {item.cantidad})"
                    )

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.flush()
            return PedidoRead.model_validate(pedido)

    def listar(
        self, usuario: UserPublic, estado: EstadoPedido | None, skip: int, limit: int
    ) -> PedidosPaginados:
        # El admin ve todos; el cliente solo los propios (RN-04)
        usuario_id = None if usuario.role == "admin" else usuario.id
        with self.uow as uow:
            total, pedidos = uow.pedidos.list_by_usuario(
                usuario_id, estado.value if estado else None, skip, limit
            )
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("No tiene permiso para ver este pedido")
            return PedidoRead.model_validate(pedido)

    # RN-02 / RN-03 (admin)
    def cambiar_estado(self, pedido_id: int, data: CambioEstado) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            self._aplicar_transicion(uow, pedido, data.estado)
            return PedidoRead.model_validate(pedido)

    # RN-03 / RN-04 (dueño)
    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("No puede cancelar un pedido de otro usuario")
            if pedido.estado != EstadoPedido.PENDIENTE.value:
                raise TransicionInvalida("Solo se pueden cancelar pedidos en estado PENDIENTE")
            self._aplicar_transicion(uow, pedido, EstadoPedido.CANCELADO)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        inicio_dia_local = datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
        inicio_dia_utc = inicio_dia_local.astimezone(timezone.utc)

        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            return ResumenPedidos(
                pendientes=conteos[EstadoPedido.PENDIENTE.value],
                en_preparacion=conteos[EstadoPedido.EN_PREPARACION.value],
                entregados=conteos[EstadoPedido.ENTREGADO.value],
                cancelados=conteos[EstadoPedido.CANCELADO.value],
                pedidos_hoy=uow.pedidos.count_desde(inicio_dia_utc),
                ingresos_entregados=round(uow.pedidos.sum_total_by_estado(EstadoPedido.ENTREGADO.value), 2),
            )

    # --- helpers ---

    @staticmethod
    def _get(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    @staticmethod
    def _aplicar_transicion(uow: PedidoUnitOfWork, pedido: Pedido, nuevo: EstadoPedido) -> None:
        actual = EstadoPedido(pedido.estado)
        if nuevo not in TRANSICIONES[actual]:
            raise TransicionInvalida(f"Transición inválida: {actual.value} → {nuevo.value}")

        if nuevo == EstadoPedido.CANCELADO:
            # Se devuelve el stock en la misma transacción que el cambio de estado
            for item in pedido.items:
                producto = uow.productos.get_for_update(item.producto_id)
                if producto is not None:
                    producto.stock += item.cantidad
                    uow.productos.add(producto)

        pedido.estado = nuevo.value
        pedido.updated_at = utc_now()
        uow.pedidos.add(pedido)
        uow.flush()
