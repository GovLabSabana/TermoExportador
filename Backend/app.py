import streamlit as st
from supabase import create_client, Client
import os   
from dotenv import load_dotenv


load_dotenv()
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")    
supabase: Client = create_client(supabase_url, supabase_key)

def sign_up(email, password):
    try:
        response = supabase.auth.sign_up({"email": email, "password": password})
        if response.user:
            return response
        else:
            st.error("Error al registrar usuario")
            return None
    except Exception as e:
        st.error(f"Error signing up: {e}")
        return None

def sign_in(email, password):
    try:
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if response.user:
            return response
        else:
            st.error("Credenciales incorrectas")
            return None
    except Exception as e:
        st.error(f"Error signing in: {e}")
        return None

def sign_out():
    try:
        supabase.auth.sign_out()
        st.success("Sesión cerrada exitosamente")
        st.session_state.user_email = None
        st.session_state.user_id = None
    except Exception as e:
        st.error(f"Error signing out: {e}")

def get_current_user():
    try:
        user = supabase.auth.get_user()
        if user and user.user:
            return user.user
        return None
    except:
        return None

def main_app(user_email):
    st.title("TERMO Exportador")
    st.write(f"¡Bienvenido, {user_email}!")
    
 
    current_user = get_current_user()
    if current_user:
        st.info(f"**Usuario ID:** {current_user.id}")
        st.info(f"**Email:** {current_user.email}")
        if current_user.email_confirmed_at:
            st.success("Email confirmado")
        else:
            st.warning("Email pendiente de confirmación")
    
    st.markdown("---")
    st.write("Aquí puedes agregar el contenido principal de tu aplicación.")
    
  
    if st.button("Cerrar Sesión", type="secondary"):
        sign_out()
        st.rerun() 

def auth_screen():
    st.title("Autenticación")
    
    tab1, tab2 = st.tabs(["Iniciar Sesión", "Registrarse"])
    
    with tab1:
        st.header("Iniciar Sesión")
        with st.form("signin_form"):
            email_signin = st.text_input("Email", key="signin_email")
            password_signin = st.text_input("Contraseña", type="password", key="signin_password")
            submit_signin = st.form_submit_button("Iniciar Sesión", type="primary")
            
            if submit_signin:
                if email_signin and password_signin:
                    user = sign_in(email_signin, password_signin)
                    if user:
                        st.success("¡Sesión iniciada exitosamente!")
                        st.session_state.user_email = email_signin
                        st.session_state.user_id = user.user.id
                        st.rerun()
                else:
                    st.warning("Por favor completa todos los campos")
    
    with tab2:
        st.header("Registrarse")
        with st.form("signup_form"):
            email_signup = st.text_input("Email", key="signup_email")
            password_signup = st.text_input("Contraseña", type="password", key="signup_password")
            password_confirm = st.text_input("Confirmar Contraseña", type="password", key="confirm_password")
            submit_signup = st.form_submit_button("Crear Cuenta", type="primary")
            
            if submit_signup:
                if email_signup and password_signup and password_confirm:
                    if password_signup == password_confirm:
                        if len(password_signup) >= 6:
                            user = sign_up(email_signup, password_signup)
                            if user:
                                st.success("¡Usuario registrado exitosamente! Revisa tu email para confirmar.")
                                st.info("Después de confirmar tu email, podrás iniciar sesión.")
                        else:
                            st.warning("a contraseña debe tener al menos 6 caracteres")
                    else:
                        st.error("Las contraseñas no coinciden")
                else:
                    st.warning("Por favor completa todos los campos")


if "user_email" not in st.session_state:
    st.session_state.user_email = None
if "user_id" not in st.session_state:
    st.session_state.user_id = None


if not st.session_state.user_email:
    current_user = get_current_user()
    if current_user:
        st.session_state.user_email = current_user.email
        st.session_state.user_id = current_user.id

if st.session_state.user_email:
    main_app(st.session_state.user_email)
else:
    auth_screen()