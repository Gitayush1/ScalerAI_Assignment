"""
Meetly — FastAPI application entry point.

Startup sequence:
  1. Create all DB tables (if they don't exist yet).
  2. Mount routers.
  3. Configure CORS so the Next.js dev server can reach the API.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.database import engine, Base
from app.routers import meetings_router, participants_router

# Import models so SQLAlchemy knows about them before create_all
import app.models  # noqa: F401

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app = FastAPI(
    title="Meetly API",
    description="Backend for the Meetly video conferencing application",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS — allow the Next.js dev server (and any configured origin) to call us
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Create tables on startup (idempotent — safe to call every time)
# ---------------------------------------------------------------------------
Base.metadata.create_all(bind=engine)

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
