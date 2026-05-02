"""FinSentinel FastAPI application – main entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database.mongo import connect_to_mongo, close_mongo_connection
from routes.transaction import router as transaction_router
from routes.api import router as api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(title="FinSentinel API", version="2.4.1", lifespan=lifespan)

# CORS middleware must be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(transaction_router, prefix="/api")
app.include_router(api_router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "healthy"}
