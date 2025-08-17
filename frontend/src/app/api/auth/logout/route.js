import { NextResponse } from 'next/server'
import { clearAuthCookies, makeBackendRequest, createSuccessResponse, createErrorResponse } from '@/lib/server-auth'

export async function POST(request) {
  try {
    // Call backend logout if we have a session
    try {
      await makeBackendRequest('/auth/logout', {
        method: 'POST'
      })
    } catch (error) {
      // Backend logout failed, but we'll still clear cookies
      console.warn('Backend logout failed:', error)
    }

    // Clear auth cookies
    await clearAuthCookies()
    
    return createSuccessResponse({
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('Logout API error:', error)
    
    // Even if there's an error, try to clear cookies
    try {
      await clearAuthCookies()
    } catch (clearError) {
      console.error('Failed to clear cookies:', clearError)
    }
    
    return createErrorResponse('Logout failed', 500)
  }
}