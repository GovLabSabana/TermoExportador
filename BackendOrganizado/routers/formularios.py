from fastapi import APIRouter, Depends, HTTPException
from utils.auth_utils import supabase, token_required

router = APIRouter()

@router.get("/")
async def obtener_formularios(current_user: dict = Depends(token_required)):
    try:
        respuesta = supabase.table('forms').select('*').eq('is_active', True).execute()
        return {"exito": True, "formularios": respuesta.data}
    except Exception as e:
        raise HTTPException(500, f"Error al obtener formularios: {str(e)}")

@router.get("/{form_id}/preguntas")
async def obtener_preguntas(form_id: str, current_user: dict = Depends(token_required)):
    try:
        respuesta = supabase.table('questions')\
            .select('*').eq('form_id', form_id).order('order_index').execute()
        return {"exito": True, "preguntas": respuesta.data}
    except Exception as e:
        raise HTTPException(500, f"Error al obtener preguntas: {str(e)}")
