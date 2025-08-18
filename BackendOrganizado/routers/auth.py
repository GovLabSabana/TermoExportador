from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.auth_utils import supabase

router = APIRouter()

# 📌 Modelos para recibir JSON en el body
class AuthRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
async def register(data: AuthRequest):
    try:
        resp = supabase.auth.sign_up({"email": data.email, "password": data.password})
        if resp.user is None:
            raise HTTPException(400, "No se pudo registrar el usuario")
        return {"exito": True, "usuario": resp.user}
    except Exception as e:
        raise HTTPException(500, f"Error al registrar: {str(e)}")


@router.post("/login")
async def login(data: AuthRequest):
    try:
        resp = supabase.auth.sign_in_with_password({"email": data.email, "password": data.password})
        if not resp.session:
            raise HTTPException(400, "Credenciales inválidas")
        return {
            "exito": True,
            "access_token": resp.session.access_token,
            "refresh_token": resp.session.refresh_token,
            "usuario": resp.user
        }
    except Exception as e:
        raise HTTPException(500, f"Error al iniciar sesión: {str(e)}")


@router.post("/logout")
async def logout():
    try:
        supabase.auth.sign_out()
        return {"exito": True, "mensaje": "Sesión cerrada"}
    except Exception as e:
        raise HTTPException(500, f"Error al cerrar sesión: {str(e)}")
