import { NextResponse } from 'next/server'
import { getAuthSession, createSuccessResponse, createErrorResponse } from '@/lib/server-auth'

export async function GET() {
  try {
    const session = await getAuthSession()
    
    if (session) {
      return createSuccessResponse({
        user: session.user,
        isAuthenticated: true
      })
    } else {
      return createSuccessResponse({
        user: null,
        isAuthenticated: false
      })
    }
  } catch (error) {
    console.error('Session API error:', error)
    return createErrorResponse('Failed to get session', 500)
  }
}