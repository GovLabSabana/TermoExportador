from fastapi import APIRouter, Depends, HTTPException, Request
from utils.auth_utils import supabase, token_required
from datetime import datetime

router = APIRouter()

def calcular_nivel_exportador(porcentaje: float):
    if porcentaje >= 85:
        return {"nivel": "excelente", "color": "green", "puede_exportar": True}
    elif porcentaje >= 70:
        return {"nivel": "bueno", "color": "light-green", "puede_exportar": True}
    elif porcentaje >= 50:
        return {"nivel": "moderado", "color": "yellow", "puede_exportar": False}
    elif porcentaje >= 30:
        return {"nivel": "bajo", "color": "orange", "puede_exportar": False}
    else:
        return {"nivel": "crítico", "color": "red", "puede_exportar": False}

@router.post("/{form_id}/responder")
async def responder_termometro(form_id: str, request: Request, current_user: dict = Depends(token_required)):
    try:
        datos = await request.json()
        user_id = current_user.id
        respuestas = datos.get("respuestas")

        if not respuestas:
            raise HTTPException(400, "Se requieren las respuestas")

        preguntas_resp = supabase.table('questions').select('*').eq('form_id', form_id).execute()
        preguntas_dict = {p['id']: p for p in preguntas_resp.data}

        puntaje_total, puntaje_maximo = 0, 0
        for respuesta in respuestas:
            qid = respuesta.get("question_id")
            val = respuesta.get("response_value")
            if qid not in preguntas_dict:
                continue
            peso = preguntas_dict[qid].get("weight", 1)
            puntaje_maximo += peso
            puntaje_total += peso if str(val).lower() == "yes" else 0

        porcentaje = (puntaje_total / puntaje_maximo * 100) if puntaje_maximo > 0 else 0
        info_nivel = calcular_nivel_exportador(porcentaje)

        # Guardar resultado en supabase
        datos_puntaje = {
            "user_id": user_id,
            "form_id": form_id,
            "total_score": puntaje_total,
            "max_possible_score": puntaje_maximo,
            "percentage": round(porcentaje, 2),
            "readiness_level": info_nivel["nivel"],
            "readiness_color": info_nivel["color"],
            "can_export": info_nivel["puede_exportar"],
            "completion_status": "complete",
            "completed_at": datetime.utcnow().isoformat()
        }
        supabase.table("user_form_scores").upsert(datos_puntaje, on_conflict="user_id,form_id").execute()

        return {"exito": True, "termometro": {
            "puntaje_total": puntaje_total,
            "puntaje_maximo": puntaje_maximo,
            "porcentaje": round(porcentaje, 2),
            **info_nivel
        }}
    except Exception as e:
        raise HTTPException(500, f"Error al procesar respuestas: {str(e)}")

@router.get("/{form_id}/estado")
async def ver_estado_termometro(form_id: str, current_user: dict = Depends(token_required)):
    try:
        user_id = current_user.id
        puntaje = supabase.table("user_form_scores")\
            .select("*").eq("user_id", user_id).eq("form_id", form_id).execute()
        if not puntaje.data:
            return {"exito": True, "termometro": {
                "porcentaje": 0, "nivel": "sin_evaluar", "color": "gray",
                "puede_exportar": False, "mensaje": "Aún no has completado la evaluación"
            }}
        datos = puntaje.data[0]
        return {"exito": True, "termometro": {
            "porcentaje": datos["percentage"],
            "nivel": datos["readiness_level"],
            "color": datos["readiness_color"],
            "puede_exportar": datos["can_export"],
            "puntaje_total": datos["total_score"],
            "puntaje_maximo": datos["max_possible_score"],
            "completado_en": datos["completed_at"]
        }}
    except Exception as e:
        raise HTTPException(500, f"Error al obtener estado del termómetro: {str(e)}")

@router.get("/mis-resultados")
async def ver_mis_resultados(current_user: dict = Depends(token_required)):
    try:
        user_id = current_user.id
        resultados = supabase.table("user_form_scores")\
            .select("*, forms(title, description)").eq("user_id", user_id).execute()
        return {"exito": True, "resultados": resultados.data}
    except Exception as e:
        raise HTTPException(500, f"Error al obtener resultados: {str(e)}")
