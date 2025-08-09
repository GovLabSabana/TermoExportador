from matplotlib import typing
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import os
from dotenv import load_dotenv
from supabase._sync.client import SyncClient as Client, create_client
from datetime import datetime
from typing import Optional
from matplotlib import typing



# Cargar variables de entorno

dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=dotenv_path)

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    raise RuntimeError("No se cargaron las variables de entorno de Supabase")

from supabase._sync.client import create_client
supabase = create_client(url, key)

# Crear app FastAPI
app = FastAPI(
    title="TermoExportador API",
    description="API para autenticación de usuarios con Supabase",
    version="1.0.0"
)

# Configurar CORS para permitir requests desde el frontend


load_dotenv()
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

if ENVIRONMENT == "production":
    # Configuración segura para producción
    allowed_origins = [
        "https://tuapp.com",
        "https://www.tuapp.com",
        # Agrega aquí los dominios de tu frontend en producción
    ]
else:
    # Configuración permisiva para desarrollo
    allowed_origins = [
        "http://localhost:3000",    # React
        "http://localhost:3001",    # Vue
        "http://localhost:5173",    # Vite
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"  # Solo para desarrollo
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization", 
        "Accept",
        "X-Requested-With",
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Methods"
    ],
)

# Modelos de datos
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@ejemplo.com",
                "password": "mi_password_seguro"
            }
        }

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@ejemplo.com",
                "password": "mi_password_seguro"
            }
        }

class UserResponse(BaseModel):
    id: str
    email: str
    created_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
    
class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserResponse] = None
    access_token: Optional[str] = None

class ErrorResponse(BaseModel):
    success: bool
    message: str
    error: str = None

# Endpoint de salud
@app.get("/", tags=["Health"])
async def health_check():
    """Verificar que la API está funcionando"""
    return {"status": "ok", "message": "TermoExportador API está funcionando"}

# Endpoint de registro ----------------------------------------------------
@app.post("/auth/register", 
         response_model=AuthResponse, 
         tags=["Autenticación"],
         summary="Registrar nuevo usuario",
         description="Crea una nueva cuenta de usuario con email y contraseña")
async def register_user(user_data: UserRegister):
    """
    Registra un nuevo usuario en el sistema
    
    - **email**: Email válido del usuario
    - **password**: Contraseña segura (mínimo 6 caracteres)
    """
    try:
        response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password
        })
        
        if response.user:
            user_info = UserResponse(
                id=response.user.id,
                email=response.user.email,
                created_at=response.user.created_at
            )
            
            return AuthResponse(
                success=True,
                message="Usuario registrado exitosamente",
                user=user_info,
                access_token=response.session.access_token if response.session else None
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error en el registro. Verifica los datos."
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al registrar usuario: {str(e)}"
        )

# Endpoint de login ----------------------------------------------------
@app.post("/auth/login", 
         response_model=AuthResponse, 
         tags=["Autenticación"],
         summary="Iniciar sesión",
         description="Autentica un usuario existente")
async def login_user(user_data: UserLogin):
    """
    Inicia sesión con email y contraseña
    
    - **email**: Email del usuario registrado
    - **password**: Contraseña del usuario
    """
    try:
        response = supabase.auth.sign_in_with_password({
            "email": user_data.email,
            "password": user_data.password
        })
        
        if response.user:
            user_info = UserResponse(
                id=response.user.id,
                email=response.user.email,
                created_at=response.user.created_at
            )
            
                        # 🔹 Caso: usuario creado pero requiere confirmación por email
            if not response.session:
                return AuthResponse(
                    success=True,
                    message="Usuario registrado. Revisa tu correo para confirmar la cuenta.",
                    user=user_info,
                    access_token=None
                )

            # 🔹 Caso: usuario creado y ya logueado (no requiere confirmación)
            return AuthResponse(
                success=True,
                message="Usuario registrado exitosamente",
                user=user_info,
                access_token=response.session.access_token
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Error en el login: {str(e)}"
        )

# Endpoint de logout ----------------------------------------------------
@app.post("/auth/logout", 
         tags=["Autenticación"],
         summary="Cerrar sesión",
         description="Cierra la sesión del usuario actual")
async def logout_user():
    """
    Cierra la sesión del usuario actual
    """
    try:
        supabase.auth.sign_out()
        return {"success": True, "message": "Sesión cerrada exitosamente"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al cerrar sesión: {str(e)}"
        )

# Endpoint para obtener usuario actual -----------------------------------
@app.get("/auth/me", 
        response_model=UserResponse, 
        tags=["Usuario"],
        summary="Obtener usuario actual",
        description="Obtiene la información del usuario autenticado")
async def get_current_user():
    """
    Obtiene la información del usuario actualmente autenticado
    """
    try:
        user = supabase.auth.get_user()
        if user and user.user:
            return UserResponse(
                id=user.user.id,
                email=user.user.email,
                created_at=user.user.created_at
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no autenticado"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Error al obtener usuario: {str(e)}"
        )

# Endpoint de ejemplo para datos protegidos
@app.get("/protected/data", 
        tags=["Datos Protegidos"],
        summary="Ejemplo de endpoint protegido",
        description="Endpoint de ejemplo que requiere autenticación")
async def get_protected_data():
    """
    Endpoint de ejemplo que requiere autenticación
    """
    return {
        "message": "¡Datos protegidos obtenidos exitosamente!",
        "data": {
            "ejemplo": "Este es un endpoint protegido",
            "timestamp": "2024-01-01T00:00:00Z"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)