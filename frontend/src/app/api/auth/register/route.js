import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookies, createErrorResponse, createSuccessResponse } from '@/lib/server-auth'
import { validateEmail, validatePassword, authErrorMessages } from '@/lib/auth-utils'

const API_BASE_URL = "https://merry-courage-production.up.railway.app"

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return createErrorResponse("Email and password are required")
    }

    if (!validateEmail(email)) {
      return createErrorResponse("Invalid email format")
    }

    if (!validatePassword(password)) {
      return createErrorResponse("Password must be at least 6 characters")
    }

    // Call the backend API
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (response.ok && data.exito !== false) {
      // Registration successful
      const usuario = data.usuario || { email }
      
      // If the backend returns a token, set cookies for auto-login after registration
      if (data.access_token) {
        await setAuthCookies(data.access_token, usuario)
      }
      
      return createSuccessResponse({
        exito: true,
        mensaje: data.mensaje || 'Registration successful',
        usuario,
        autoLogin: !!data.access_token
      })
    } else {
      const errorMessage = data.mensaje || data.detail || authErrorMessages.SERVER_ERROR
      return createErrorResponse(errorMessage, response.status || 400)
    }
  } catch (error) {
    console.error('Register API error:', error)
    return createErrorResponse(authErrorMessages.NETWORK_ERROR, 500)
  }
}