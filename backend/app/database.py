"""
Database configuration using SQLAlchemy with SQLite.

Path strategy:
  - Local dev: DATABASE_URL env var or ./meetly.db
  - Render free tier: /tmp/meetly.db  (/tmp is always writable, even without a disk)
    Note: /tmp is ephemeral — data resets on redeploy. This is fine for a demo
    because seed() runs automatically on every startup via the lifespan hook.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

_raw_url = os.getenv("DATABASE_URL", "").strip()

if _raw_url:
    DATABASE_URL = _raw_url
else:
    # On Render free tier the project directory may not be writable,
    # but /tmp always is.
    is_render = os.getenv("RENDER", "") != ""
    db_path = "/tmp/meetly.db" if is_render else "./meetly.db"
    DATABASE_URL = f"sqlite:///{db_path}"

# connect_args is SQLite-specific (allows multi-threaded FastAPI access)
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
