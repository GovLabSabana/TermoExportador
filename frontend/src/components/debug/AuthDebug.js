'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { cookieUtils } from '@/lib/cookies'
import { useAuthStore } from '@/store/authStore'

export default function AuthDebug() {
  const authContext = useAuthContext()
  const authStore = useAuthStore()
  const [cookieToken, setCookieToken] = useState(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setCookieToken(cookieUtils.getToken())
  }, [])

  if (process.env.NODE_ENV !== 'development' || !isMounted) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 text-xs font-mono max-w-md">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div>Context isAuth: {String(authContext.isAuthenticated)}</div>
      <div>Context isLoading: {String(authContext.isLoading)}</div>
      <div>Context isHydrated: {String(authContext.isHydrated)}</div>
      <div>Store isAuth: {String(authStore.isAuthenticated)}</div>
      <div>Store isHydrated: {String(authStore.isHydrated)}</div>
      <div>Cookie exists: {String(!!cookieToken)}</div>
      <div>User email: {authContext.user?.email || 'None'}</div>
      <div>Token match: {String(authStore.token === cookieToken)}</div>
    </div>
  )
}