from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime
import os

# ==============================
# CONFIGURACIÓN
# ==============================
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=dotenv_path)

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
SECRET_KEY = os.getenv('SECRET_KEY')

if not url or not key:
    raise RuntimeError("No se cargaron las variables de entorno de Supabase")

supabase: Client = create_client(url, key)

# ==============================
# APP FASTAPI
# ==============================
app = FastAPI(title="API Termómetro Exportador")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# AUTENTICACIÓN
# ==============================
security = HTTPBearer()

async def token_required(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        return user.user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

# ==============================
# LÓGICA TERMÓMETRO
# ==============================
def calcular_nivel_exportador(porcentaje: float):
    if porcentaje >= 85:
        return {"nivel": "excelente", "color": "green", "puede_exportar": True,
                "mensaje": "¡Listo para exportar! Tienes todas las capacidades",
                "descripcion": "Cuentas con todos los requisitos necesarios"}
    elif porcentaje >= 70:
        return {"nivel": "bueno", "color": "light-green", "puede_exportar": True,
                "mensaje": "Casi listo - Solo algunos detalles por mejorar",
                "descripcion": "Tienes la mayoría de requisitos cubiertos"}
    elif porcentaje >= 50:
        return {"nivel": "moderado", "color": "yellow", "puede_exportar": False,
                "mensaje": "Necesitas mejorar varias áreas",
                "descripcion": "Estás en buen camino pero faltan cosas importantes"}
    elif porcentaje >= 30:
        return {"nivel": "bajo", "color": "orange", "puede_exportar": False,
                "mensaje": "Te falta bastante preparación",
                "descripcion": "Necesitas trabajar en muchos aspectos básicos"}
    else:
        return {"nivel": "crítico", "color": "red", "puede_exportar": False,
                "mensaje": "No estás preparado para exportar",
                "descripcion": "Te faltan la mayoría de requisitos fundamentales"}

def calcular_puntaje_pregunta(pregunta, respuesta):
    puntos_si = pregunta.get('points_for_yes', 1)
    puntos_no = pregunta.get('points_for_no', 0)
    peso = pregunta.get('weight', 1)
    return puntos_si * peso if str(respuesta).lower() == "yes" else puntos_no * peso

# ==============================
# ENDPOINTS FORMULARIOS
# ==============================
@app.get("/api/formularios")
async def obtener_formularios(current_user: dict = Depends(token_required)):
    try:
        respuesta = supabase.table('forms').select('*').eq('is_active', True).execute()
        return {"exito": True, "formularios": respuesta.data}
    except Exception as e:
        raise HTTPException(500, f"Error al obtener formularios: {str(e)}")

@app.get("/api/formularios/{form_id}/preguntas")
async def obtener_preguntas(form_id: str, current_user: dict = Depends(token_required)):
    try:
        respuesta = supabase.table('questions')\
            .select('*').eq('form_id', form_id).order('order_index').execute()
        return {"exito": True, "preguntas": respuesta.data}
    except Exception as e:
        raise HTTPException(500, f"Error al obtener preguntas: {str(e)}")

# ==============================
# ENDPOINTS TERMÓMETRO
# ==============================
@app.post("/api/termometro/{form_id}/responder")
async def responder_termometro(form_id: str, request: Request, current_user: dict = Depends(token_required)):
    try:
        datos = await request.json()
        user_id = current_user.id

        if not datos or not datos.get("respuestas"):
            raise HTTPException(400, "Se requieren las respuestas")

        respuestas = datos.get("respuestas")  # [{question_id, response_value}]

        preguntas_resp = supabase.table('questions').select('*').eq('form_id', form_id).execute()
        preguntas_dict = {p['id']: p for p in preguntas_resp.data}

        puntaje_total = 0
        puntaje_maximo = 0
        registros_respuestas = []

        for respuesta in respuestas:
            qid = respuesta.get("question_id")
            val = respuesta.get("response_value")
            if qid not in preguntas_dict:
                continue
            pregunta = preguntas_dict[qid]
            peso = pregunta.get("weight", 1)
            puntaje_maximo += peso
            puntos = calcular_puntaje_pregunta(pregunta, val)
            puntaje_total += puntos
            registros_respuestas.append({
                "user_id": user_id, "form_id": form_id,
                "question_id": qid, "response_value": str(val), "score": puntos
            })

        if registros_respuestas:
            supabase.table("user_responses").upsert(registros_respuestas, on_conflict="user_id,question_id").execute()

        porcentaje = (puntaje_total / puntaje_maximo * 100) if puntaje_maximo > 0 else 0
        info_nivel = calcular_nivel_exportador(porcentaje)

        datos_puntaje = {
            "user_id": user_id, "form_id": form_id,
            "total_score": puntaje_total, "max_possible_score": puntaje_maximo,
            "percentage": round(porcentaje, 2), "readiness_level": info_nivel["nivel"],
            "readiness_color": info_nivel["color"], "can_export": info_nivel["puede_exportar"],
            "completion_status": "complete", "completed_at": datetime.utcnow().isoformat()
        }
        supabase.table("user_form_scores").upsert(datos_puntaje, on_conflict="user_id,form_id").execute()

        return {"exito": True, "mensaje": "Evaluación completada", "termometro": {
            "puntaje_total": puntaje_total, "puntaje_maximo": puntaje_maximo,
            "porcentaje": round(porcentaje, 2), **info_nivel
        }}
    except Exception as e:
        raise HTTPException(500, f"Error al procesar respuestas: {str(e)}")

@app.get("/api/termometro/{form_id}/estado")
async def ver_estado_termometro(form_id: str, current_user: dict = Depends(token_required)):
    try:
        user_id = current_user.id
        puntaje = supabase.table("user_form_scores").select("*").eq("user_id", user_id).eq("form_id", form_id).execute()
        if not puntaje.data:
            return {"exito": True, "termometro": {
                "porcentaje": 0, "nivel": "sin_evaluar", "color": "gray",
                "puede_exportar": False, "mensaje": "Aún no has completado la evaluación",
                "descripcion": "Completa el formulario para conocer tu nivel"
            }}
        datos = puntaje.data[0]
        return {"exito": True, "termometro": {
            "porcentaje": datos["percentage"], "nivel": datos["readiness_level"],
            "color": datos["readiness_color"], "puede_exportar": datos["can_export"],
            "puntaje_total": datos["total_score"], "puntaje_maximo": datos["max_possible_score"],
            "completado_en": datos["completed_at"]
        }}
    except Exception as e:
        raise HTTPException(500, f"Error al obtener estado del termómetro: {str(e)}")

@app.get("/api/mis-resultados")
async def ver_mis_resultados(current_user: dict = Depends(token_required)):
    try:
        user_id = current_user.id
        resultados = supabase.table("user_form_scores").select("*, forms(title, description)").eq("user_id", user_id).execute()
        return {"exito": True, "resultados": resultados.data}
    except Exception as e:
        raise HTTPException(500, f"Error al obtener resultados: {str(e)}")

# ==============================
# ENDPOINT SALUD
# ==============================
@app.get("/api/salud")
async def verificar_salud():
    return {
        "estado": "OK",
        "mensaje": "API del Termómetro Exportador funcionando",
        "timestamp": datetime.utcnow().isoformat()
    }
