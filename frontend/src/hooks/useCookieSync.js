import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { cookieUtils, isTokenExpired } from '@/lib/cookies'

export const useCookieSync = () => {
  const { isAuthenticated, logout, token, syncWithCookies } = useAuthStore()
  const lastCheckedToken = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkCookieSync = () => {
      const cookieToken = cookieUtils.getToken()
      
      // Only proceed if something changed
      if (cookieToken === lastCheckedToken.current) return
      
      console.log('Cookie sync check - Cookie changed:', {
        old: lastCheckedToken.current ? 'exists' : 'null',
        new: cookieToken ? 'exists' : 'null',
        isAuthenticated,
        storeToken: token ? 'exists' : 'null'
      })
      
      lastCheckedToken.current = cookieToken

      // If no cookie token but we think we're authenticated, logout
      if (!cookieToken && isAuthenticated) {
        console.log('Cookie deleted manually, logging out')
        logout()
        return
      }

      // If we have a cookie token but we're not authenticated, sync
      if (cookieToken && !isAuthenticated) {
        // Check if token is expired
        if (!isTokenExpired(cookieToken)) {
          console.log('Found valid cookie token, syncing auth state')
          syncWithCookies(cookieToken, null) // Will trigger auth check
        }
      }

      // If token in cookie is different from store
      if (cookieToken && token && cookieToken !== token) {
        console.log('Token mismatch, syncing')
        if (!isTokenExpired(cookieToken)) {
          syncWithCookies(cookieToken, null)
        } else {
          logout()
        }
      }
    }

    // Check immediately
    checkCookieSync()

    // Check every 3 seconds for more responsive manual cookie deletion
    const interval = setInterval(checkCookieSync, 3000)

    // Listen for storage changes (for multi-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'termoexportador-auth') {
        checkCookieSync()
      }
    }

    // Listen for focus events to check when user comes back to tab
    const handleFocus = () => {
      checkCookieSync()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [isAuthenticated, token, logout, syncWithCookies])
}