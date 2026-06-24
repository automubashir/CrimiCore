"""
CrimiCore — FastAPI SPA integration (Vite build)
=================================================
Call mount_spa(app) AFTER all your API routers are registered.

Vite produces a single dist/index.html that boots the React app.
Any URL that is not a real static file gets that shell, and React
Router takes it from there — no per-route shell files needed.
"""

from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

FRONTEND_DIR = Path(__file__).parent / "dist"   # adjust if you deploy elsewhere


def mount_spa(app: FastAPI) -> None:
    """Register static-file serving + SPA fallback on *app*."""

    # Serve hashed JS/CSS/font bundles with a dedicated mount (fast path)
    assets = FRONTEND_DIR / "assets"
    if assets.is_dir():
        app.mount("/assets", StaticFiles(directory=assets), name="spa_assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_fallback(full_path: str) -> FileResponse:
        candidate = FRONTEND_DIR / full_path.strip("/")

        # Serve any real file (favicon, robots.txt, etc.)
        if candidate.is_file():
            return FileResponse(candidate)

        # Everything else → React Router handles it client-side
        return FileResponse(FRONTEND_DIR / "index.html")
