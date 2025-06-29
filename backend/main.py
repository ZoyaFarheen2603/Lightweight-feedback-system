from fastapi import FastAPI
from routers import router
from models import Base
from database import engine
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount React build static files
#app.mount("/static", StaticFiles(directory="../frontend/build/static"), name="static")

# Include your API routes
app.include_router(router)

# Create DB tables on startup
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# Root URL returns backend status message
@app.get("/")
def read_root():
    return {"message": "Lightweight Feedback System Backend is running."}

# Serve React frontend for client-side routes
@app.get("/{full_path:path}")
def serve_react_app(full_path: str):
    file_path = "../frontend/build/index.html"
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"message": "Build not found. Please run 'npm run build' in frontend."}
