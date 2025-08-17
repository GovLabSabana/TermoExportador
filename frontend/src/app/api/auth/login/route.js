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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (response.ok && data.success && data.access_token && data.user) {
      // Set httpOnly cookies
      await setAuthCookies(data.access_token, data.user)
      
      return createSuccessResponse({
        message: 'Login successful',
        user: data.user
      })
    } else {
      const errorMessage = data.message || data.detail || authErrorMessages.INVALID_CREDENTIALS
      return createErrorResponse(errorMessage, response.status || 401)
    }
  } catch (error) {
    console.error('Login API error:', error)
    return createErrorResponse(authErrorMessages.NETWORK_ERROR, 500)
  }
}