"""
Database configuration using SQLAlchemy with SQLite.
The engine, session factory, and Base declarative class are all defined here
so every other module can import from a single place.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Fall back to a local SQLite file if DATABASE_URL is not set or is empty.
# On Render with a persistent disk, set DATABASE_URL=sqlite:////data/meetly.db
# (4 slashes = sqlite:/// prefix + /data/meetly.db absolute path on Linux).
_raw_url = os.getenv("DATABASE_URL", "").strip()
DATABASE_URL = _raw_url if _raw_url else "sqlite:///./meetly.db"

# connect_args is SQLite-specific — allows multi-threaded FastAPI access.
# If you later switch to PostgreSQL, remove connect_args entirely.
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=_connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency: yields a DB session and ensures it is closed after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
