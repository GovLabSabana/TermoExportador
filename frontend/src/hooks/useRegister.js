import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, validateEmail, validatePassword } from '@/lib/api'

export const useRegister = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [registeredUser, setRegisteredUser] = useState(null)

  const validateForm = useCallback((email, password, confirmPassword) => {
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

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden'
    }

    return errors
  }, [])

  const register = useCallback(async (email, password, confirmPassword) => {
    setIsSubmitting(true)
    setFormErrors({})

    try {
      const errors = validateForm(email, password, confirmPassword)
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        setIsSubmitting(false)
        return { success: false, errors }
      }

      const result = await authApi.register(email, password)

      if (result.success) {
        setRegisteredUser(result.user)
        setShowVerificationModal(true)
        
        return { 
          success: true, 
          user: result.user, 
          message: result.message 
        }
      } else {
        const errorMessage = result.error || 'Error al registrar usuario'
        
        if (result.status === 400) {
          if (errorMessage.toLowerCase().includes('email')) {
            setFormErrors({ 
              email: 'Este email ya está registrado' 
            })
          } else {
            setFormErrors({ general: errorMessage })
          }
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
      const errorMessage = error.message || 'Error inesperado al registrar usuario'
      setFormErrors({ general: errorMessage })
      
      return { 
        success: false, 
        error: errorMessage,
        errors: { general: errorMessage }
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [validateForm])

  const handleVerificationModalClose = useCallback(() => {
    setShowVerificationModal(false)
    setRegisteredUser(null)
    router.push('/login')
  }, [router])

  const clearFormErrors = useCallback(() => {
    setFormErrors({})
  }, [])

  return {
    register,
    isSubmitting,
    formErrors,
    showVerificationModal,
    registeredUser,
    handleVerificationModalClose,
    clearFormErrors,
    validateForm
  }
}