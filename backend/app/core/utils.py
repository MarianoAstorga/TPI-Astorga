from datetime import datetime, timezone


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def ensure_utc(value: datetime) -> datetime:
    """SQLite devuelve fechas sin zona horaria; se asume que están en UTC."""
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value
