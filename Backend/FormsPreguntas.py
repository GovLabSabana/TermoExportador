from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from supabase import create_client, Client
from functools import wraps
from datetime import datetime

app = Flask(__name__)
CORS(app)

# CONFIGURACIÓN
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=dotenv_path)

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
SECRET_KEY = os.getenv('SECRET_KEY')
if not url or not key:
    raise RuntimeError("No se cargaron las variables de entorno de Supabase")

# AUTENTICACIÓN

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token requerido'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            user = supabase.auth.get_user(token)
            if not user or not user.user:
                return jsonify({'error': 'Token inválido'}), 401
                
            request.current_user = user.user
            
        except Exception as e:
            return jsonify({'error': 'Token inválido'}), 401
        
        return f(*args, **kwargs)
    return decorated


# TERMÓMETRO EXPORTADOR - LÓGICA PRINCIPAL


def calcular_nivel_exportador(porcentaje):
    """
    Determina el nivel del termómetro exportador basado en el porcentaje
    """
    if porcentaje >= 85:
        return {
            "nivel": "excelente",
            "color": "green", 
            "puede_exportar": True,
            "mensaje": "¡Listo para exportar! Tienes todas las capacidades",
            "descripcion": "Cuentas con todos los requisitos necesarios"
        }
    elif porcentaje >= 70:
        return {
            "nivel": "bueno",
            "color": "light-green",
            "puede_exportar": True, 
            "mensaje": "Casi listo - Solo algunos detalles por mejorar",
            "descripcion": "Tienes la mayoría de requisitos cubiertos"
        }
    elif porcentaje >= 50:
        return {
            "nivel": "moderado",
            "color": "yellow",
            "puede_exportar": False,
            "mensaje": "Necesitas mejorar varias áreas",
            "descripcion": "Estás en buen camino pero faltan cosas importantes"
        }
    elif porcentaje >= 30:
        return {
            "nivel": "bajo",
            "color": "orange", 
            "puede_exportar": False,
            "mensaje": "Te falta bastante preparación",
            "descripcion": "Necesitas trabajar en muchos aspectos básicos"
        }
    else:
        return {
            "nivel": "crítico",
            "color": "red",
            "puede_exportar": False,
            "mensaje": "No estás preparado para exportar",
            "descripcion": "Te faltan la mayoría de requisitos fundamentales"
        }

def calcular_puntaje_pregunta(pregunta, respuesta):
    """
    Calcula puntos por pregunta según la respuesta
    """
    puntos_si = pregunta.get('points_for_yes', 1)
    puntos_no = pregunta.get('points_for_no', 0) 
    peso = pregunta.get('weight', 1)
    
    if str(respuesta).lower() == 'yes':
        return puntos_si * peso
    else:
        return puntos_no * peso


# ENDPOINTS - FORMULARIOS


@app.route('/api/formularios', methods=['GET'])
@token_required
def obtener_formularios():
    """Ver todos los formularios disponibles"""
    try:
        respuesta = supabase.table('forms').select('*').eq('is_active', True).execute()
        
        return jsonify({
            'exito': True,
            'formularios': respuesta.data
        })
        
    except Exception as e:
        return jsonify({
            'exito': False,
            'error': f'Error al obtener formularios: {str(e)}'
        }), 500

@app.route('/api/formularios/<form_id>/preguntas', methods=['GET'])
@token_required  
def obtener_preguntas(form_id):
    """Ver preguntas de un formulario específico"""
    try:
        respuesta = supabase.table('questions')\
            .select('*')\
            .eq('form_id', form_id)\
            .order('order_index')\
            .execute()
        
        return jsonify({
            'exito': True,
            'preguntas': respuesta.data
        })
        
    except Exception as e:
        return jsonify({
            'exito': False,
            'error': f'Error al obtener preguntas: {str(e)}'
        }), 500


# ENDPOINTS - TERMÓMETRO EXPORTADOR


@app.route('/api/termometro/<form_id>/responder', methods=['POST'])
@token_required
def responder_termometro(form_id):
    """
    Enviar respuestas y calcular nivel del termómetro exportador
    """
    try:
        datos = request.get_json()
        user_id = request.current_user.id
        
        if not datos or not datos.get('respuestas'):
            return jsonify({
                'exito': False,
                'error': 'Se requieren las respuestas'
            }), 400
        
        respuestas = datos.get('respuestas')  # [{question_id, response_value}]
        
        # Obtener información de las preguntas
        preguntas_resp = supabase.table('questions')\
            .select('*')\
            .eq('form_id', form_id)\
            .execute()
        
        preguntas_dict = {p['id']: p for p in preguntas_resp.data}
        
        # Calcular puntajes
        puntaje_total = 0
        puntaje_maximo = 0
        registros_respuestas = []
        
        for respuesta in respuestas:
            question_id = respuesta.get('question_id')
            valor_respuesta = respuesta.get('response_value')
            
            if question_id not in preguntas_dict:
                continue
                
            pregunta = preguntas_dict[question_id]
            peso_pregunta = pregunta.get('weight', 1)
            puntaje_maximo += peso_pregunta
            
            # Calcular puntos de esta respuesta
            puntos = calcular_puntaje_pregunta(pregunta, valor_respuesta)
            puntaje_total += puntos
            
            registros_respuestas.append({
                'user_id': user_id,
                'form_id': form_id,
                'question_id': question_id,
                'response_value': str(valor_respuesta),
                'score': puntos
            })
        
        # Guardar respuestas en base de datos
        if registros_respuestas:
            supabase.table('user_responses')\
                .upsert(registros_respuestas, on_conflict='user_id,question_id')\
                .execute()
        
        # Calcular porcentaje y nivel del termómetro
        porcentaje = (puntaje_total / puntaje_maximo * 100) if puntaje_maximo > 0 else 0
        info_nivel = calcular_nivel_exportador(porcentaje)
        
        # Guardar resultado general
        datos_puntaje = {
            'user_id': user_id,
            'form_id': form_id,
            'total_score': puntaje_total,
            'max_possible_score': puntaje_maximo,
            'percentage': round(porcentaje, 2),
            'readiness_level': info_nivel['nivel'],
            'readiness_color': info_nivel['color'],
            'can_export': info_nivel['puede_exportar'],
            'completion_status': 'complete',
            'completed_at': datetime.utcnow().isoformat()
        }
        
        supabase.table('user_form_scores')\
            .upsert(datos_puntaje, on_conflict='user_id,form_id')\
            .execute()
        
        return jsonify({
            'exito': True,
            'mensaje': 'Evaluación completada',
            'termometro': {
                'puntaje_total': puntaje_total,
                'puntaje_maximo': puntaje_maximo, 
                'porcentaje': round(porcentaje, 2),
                'nivel': info_nivel['nivel'],
                'color': info_nivel['color'],
                'puede_exportar': info_nivel['puede_exportar'],
                'mensaje': info_nivel['mensaje'],
                'descripcion': info_nivel['descripcion']
            }
        })
        
    except Exception as e:
        return jsonify({
            'exito': False,
            'error': f'Error al procesar respuestas: {str(e)}'
        }), 500

@app.route('/api/termometro/<form_id>/estado', methods=['GET'])
@token_required
def ver_estado_termometro(form_id):
    """Ver el estado actual del termómetro exportador del usuario"""
    try:
        user_id = request.current_user.id
        
        # Buscar puntaje del usuario
        puntaje = supabase.table('user_form_scores')\
            .select('*')\
            .eq('user_id', user_id)\
            .eq('form_id', form_id)\
            .execute()
        
        if not puntaje.data:
            return jsonify({
                'exito': True,
                'termometro': {
                    'porcentaje': 0,
                    'nivel': 'sin_evaluar',
                    'color': 'gray',
                    'puede_exportar': False,
                    'mensaje': 'Aún no has completado la evaluación',
                    'descripcion': 'Completa el formulario para conocer tu nivel'
                }
            })
        
        datos = puntaje.data[0]
        
        return jsonify({
            'exito': True,
            'termometro': {
                'porcentaje': datos['percentage'],
                'nivel': datos['readiness_level'],
                'color': datos['readiness_color'],
                'puede_exportar': datos['can_export'],
                'puntaje_total': datos['total_score'],
                'puntaje_maximo': datos['max_possible_score'],
                'completado_en': datos['completed_at']
            }
        })
        
    except Exception as e:
        return jsonify({
            'exito': False,
            'error': f'Error al obtener estado del termómetro: {str(e)}'
        }), 500

@app.route('/api/termometro/<form_id>/recomendaciones', methods=['GET'])
@token_required
def obtener_recomendaciones(form_id):
    """Obtener recomendaciones para mejorar capacidades exportadoras"""
    try:
        user_id = request.current_user.id
        
        # Buscar respuestas "No" para dar recomendaciones
        respuestas_no = supabase.table('user_responses')\
            .select('*, questions(question_text, category)')\
            .eq('user_id', user_id)\
            .eq('form_id', form_id)\
            .eq('response_value', 'no')\
            .execute()
        
        # Recomendaciones por categoría
        recomendaciones_por_categoria = {
            'documentation': [
                'Obtén tu RUC de exportador',
                'Regulariza tus documentos legales',
                'Actualiza certificados comerciales'
            ],
            'certificates': [
                'Consigue certificación ISO 9001',
                'Tramita registros sanitarios',
                'Busca certificaciones internacionales'
            ],
            'experience': [
                'Participa en ferias comerciales',
                'Busca socios con experiencia', 
                'Contacta cámaras de comercio'
            ],
            'knowledge': [
                'Investiga mercados objetivo',
                'Estudia aranceles del país destino',
                'Conoce tratados comerciales'
            ],
            'production': [
                'Evalúa tu capacidad productiva',
                'Mejora control de calidad',
                'Adapta productos a estándares internacionales'
            ],
            'finance': [
                'Calcula costos de exportación',
                'Explora financiamiento',
                'Considera seguros de exportación'
            ],
            'logistics': [
                'Encuentra operadores logísticos',
                'Analiza rutas de transporte',
                'Calcula costos de envío'
            ],
            'communication': [
                'Mejora idiomas extranjeros',
                'Crea materiales promocionales',
                'Desarrolla presencia digital'
            ]
        }
        
        # Generar recomendaciones específicas
        recomendaciones = []
        areas_debiles = []
        
        for respuesta in respuestas_no.data:
            categoria = respuesta['questions']['category']
            areas_debiles.append(categoria)
            
            if categoria in recomendaciones_por_categoria:
                recomendaciones.extend(recomendaciones_por_categoria[categoria])
        
        return jsonify({
            'exito': True,
            'recomendaciones': list(set(recomendaciones)),  # Sin duplicados
            'areas_a_mejorar': list(set(areas_debiles)),
            'total_areas_debiles': len(set(areas_debiles))
        })
        
    except Exception as e:
        return jsonify({
            'exito': False,
            'error': f'Error al obtener recomendaciones: {str(e)}'
        }), 500

# ENDPOINTS - MIS RESULTADOS


@app.route('/api/mis-resultados', methods=['GET'])
@token_required
def ver_mis_resultados():
    """Ver todos los resultados de evaluaciones del usuario"""
    try:
        user_id = request.current_user.id
        
        resultados = supabase.table('user_form_scores')\
            .select('*, forms(title, description)')\
            .eq('user_id', user_id)\
            .execute()
        
        return jsonify({
            'exito': True,
            'resultados': resultados.data
        })
        
    except Exception as e:
        return jsonify({
            'exito': False,
            'error': f'Error al obtener resultados: {str(e)}'
        }), 500

# ENDPOINT DE SALUD


@app.route('/api/salud', methods=['GET'])
def verificar_salud():
    return jsonify({
        'estado': 'OK',
        'mensaje': 'API del Termómetro Exportador funcionando',
        'timestamp': datetime.utcnow().isoformat()
    })

# EJECUTAR APLICACIÓN


if __name__ == '__main__':
    print("Termómetro Exportador API iniciada")
    print("Endpoints principales:")
    print("   GET  /api/formularios - Ver formularios disponibles")
    print("   GET  /api/formularios/<id>/preguntas - Ver preguntas")
    print("   POST /api/termometro/<id>/responder - Enviar respuestas")
    print("   GET  /api/termometro/<id>/estado - Ver estado actual") 
    print("   GET  /api/termometro/<id>/recomendaciones - Ver recomendaciones")
    print("   GET  /api/mis-resultados - Ver mis evaluaciones")
    
    app.run(debug=True, host='0.0.0.0', port=5000)