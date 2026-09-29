"""
Meetly — FastAPI application entry point.

Startup sequence:
  1. Create all DB tables (if they don't exist yet).
  2. Run seed if the database is empty (safe for ephemeral filesystems like Render free tier).
  3. Mount routers.
  4. Configure CORS.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.database import engine, Base
from app.routers import meetings_router, participants_router

import app.models  # noqa: F401 — registers ORM classes with Base

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    Base.metadata.create_all(bind=engine)

    # Auto-seed if empty — works on ephemeral filesystems (Render free tier)
    try:
        from app.seed import seed
        seed()
    except Exception as e:
        print(f"Seed skipped or failed: {e}")

    yield
    # Nothing to clean up


app = FastAPI(
    title="Meetly API",
    description="Backend for the Meetly video conferencing application",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(meetings_router)
app.include_router(participants_router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "Meetly API"}


@app.get("/health")
def health():
    return {"status": "ok"}
