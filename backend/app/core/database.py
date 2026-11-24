from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, echo=False, connect_args=connect_args)


def create_all_tables() -> None:
    # Se importan los modelos para que queden registrados en la metadata
    from app.modules.usuarios import models as _usuarios  # noqa: F401
    from app.modules.categorias import models as _categorias  # noqa: F401
    from app.modules.productos import models as _productos  # noqa: F401
    from app.modules.pedidos import models as _pedidos  # noqa: F401

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    return Session(engine)
