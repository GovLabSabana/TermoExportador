import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const API_BASE_URL = "https://merry-courage-production.up.railway.app"

export class AuthTokens {
  static ACCESS_TOKEN = 'access_token'
  static USER_DATA = 'user_data'
  
  static cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  }
}

export async function setAuthCookies(accessToken, userData) {
  const cookieStore = await cookies()
  
  cookieStore.set(AuthTokens.ACCESS_TOKEN, accessToken, {
    ...AuthTokens.cookieOptions,
    maxAge: 24 * 60 * 60 // 24 hours
  })
  
  cookieStore.set(AuthTokens.USER_DATA, JSON.stringify(userData), {
    ...AuthTokens.cookieOptions,
    maxAge: 24 * 60 * 60 // 24 hours
  })
}

export async function clearAuthCookies() {
  const cookieStore = await cookies()
  
  cookieStore.delete(AuthTokens.ACCESS_TOKEN)
  cookieStore.delete(AuthTokens.USER_DATA)
}

export async function getAuthSession() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(AuthTokens.ACCESS_TOKEN)?.value
    const userDataCookie = cookieStore.get(AuthTokens.USER_DATA)?.value
    
    if (!accessToken || !userDataCookie) {
      return null
    }
    
    const userData = JSON.parse(userDataCookie)
    
    return {
      accessToken,
      user: userData,
      isAuthenticated: true
    }
  } catch (error) {
    console.error('Error getting auth session:', error)
    return null
  }
}

export async function makeBackendRequest(endpoint, options = {}) {
  const session = await getAuthSession()
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers
  }
  
  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    })
    
    return response
  } catch (error) {
    console.error('Backend request error:', error)
    throw error
  }
}

export function createErrorResponse(message, status = 400) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  )
}

export function createSuccessResponse(data, status = 200) {
  return NextResponse.json(
    { success: true, ...data },
    { status }
  )
}