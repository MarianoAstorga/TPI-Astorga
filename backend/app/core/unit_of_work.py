from types import TracebackType
from typing import Callable, Self

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Abre la sesión al entrar y confirma o revierte al salir.

    Las subclases crean sus repositorios en `_init_repositories`, todos sobre
    la misma sesión, para que una operación de negocio sea una sola transacción.
    """

    def __init__(self, factory: Callable[[], Session] = session_factory) -> None:
        self._session_factory = factory
        self.session: Session

    def __enter__(self) -> Self:
        self.session = self._session_factory()
        self._init_repositories()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()

    def flush(self) -> None:
        """Envía los cambios pendientes sin confirmar (por ejemplo, para obtener ids)."""
        self.session.flush()

    def _init_repositories(self) -> None:
        pass
