"""
AeroSmog.AI — Database Setup (SQLite via SQLModel)
Creates all tables on startup.
"""
from sqlmodel import SQLModel, create_engine, Session
from config import get_settings

settings = get_settings()

# SQLite engine (file-based, zero-setup)
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},  # required for SQLite + FastAPI
    echo=settings.debug,
)


def create_db_and_tables():
    """Called at app startup to create all tables."""
    SQLModel.metadata.create_all(engine)
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            for col in ["lat", "lon"]:
                try:
                    conn.execute(text(f"ALTER TABLE alert_history ADD COLUMN {col} FLOAT"))
                    conn.commit()
                except Exception:
                    pass
    except Exception:
        pass


def get_session():
    """FastAPI dependency — yields a DB session per request."""
    with Session(engine) as session:
        yield session
