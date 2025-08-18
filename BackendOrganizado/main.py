from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, formularios, termometro
from datetime import datetime

app = FastAPI(title="API Termómetro Exportador")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["Autenticación"])
app.include_router(formularios.router, prefix="/api/formularios", tags=["Formularios"])
app.include_router(termometro.router, prefix="/api/termometro", tags=["Termómetro"])

@app.get("/api/salud", tags=["Salud"])
async def verificar_salud():
    return {
        "estado": "OK",
        "mensaje": "API del Termómetro Exportador funcionando",
        "timestamp": datetime.utcnow().isoformat()
    }

