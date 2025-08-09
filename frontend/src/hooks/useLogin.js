import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { authApi, validateEmail, validatePassword } from '@/lib/api'

export const useLogin = () => {
  const router = useRouter()
  const { login: loginStore, setError, clearError } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const validateForm = useCallback((email, password) => {
    const errors = {}

    if (!email) {
      errors.email = 'El email es requerido'
    } else if (!validateEmail(email)) {
      errors.email = 'El formato del email no es válido'
    }

    if (!password) {
      errors.password = 'La contraseña es requerida'
    } else if (!validatePassword(password)) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    return errors
  }, [])

  const login = useCallback(async (email, password, redirectTo = '/dashboard') => {
    setIsSubmitting(true)
    clearError()
    setFormErrors({})

    try {
      const errors = validateForm(email, password)
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        setIsSubmitting(false)
        return { success: false, errors }
      }

      const result = await authApi.login(email, password)

      if (result.success) {
        // Store login updates both cookies and store
        loginStore(result.user, result.token)
        
        // Small delay to ensure state is updated
        setTimeout(() => {
          router.push(redirectTo)
        }, 100)
        
        return { 
          success: true, 
          user: result.user, 
          message: result.message 
        }
      } else {
        const errorMessage = result.error || 'Error al iniciar sesión'
        setError(errorMessage)
        
        if (result.status === 401) {
          setFormErrors({ 
            general: 'Credenciales incorrectas. Verifica tu email y contraseña.' 
          })
        } else if (result.status === 403) {
          setFormErrors({ 
            general: 'Tu cuenta no ha sido verificada. Revisa tu email.' 
          })
        } else {
          setFormErrors({ general: errorMessage })
        }
        
        return { 
          success: false, 
          error: errorMessage,
          errors: formErrors
        }
      }
    } catch (error) {
      const errorMessage = error.message || 'Error inesperado al iniciar sesión'
      setError(errorMessage)
      setFormErrors({ general: errorMessage })
      
      return { 
        success: false, 
        error: errorMessage,
        errors: { general: errorMessage }
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [loginStore, setError, clearError, validateForm, router])

  const clearFormErrors = useCallback(() => {
    setFormErrors({})
    clearError()
  }, [clearError])

  return {
    login,
    isSubmitting,
    formErrors,
    clearFormErrors,
    validateForm
  }
}