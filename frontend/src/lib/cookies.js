import Cookies from 'js-cookie'

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export const cookieConfig = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  expires: 7, // 7 days
  path: '/'
}

export const secureCookieConfig = {
  ...cookieConfig,
  httpOnly: false, // js-cookie can't set httpOnly, we'll handle this in middleware
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' // Changed from 'strict' to 'lax' for better compatibility
}

export const cookieUtils = {
  setToken: (token) => {
    if (typeof window === 'undefined') return
    
    try {
      Cookies.set(TOKEN_KEY, token, secureCookieConfig)
      
      // Verify cookie was set
      const verifyToken = Cookies.get(TOKEN_KEY)
      if (!verifyToken) {
        console.warn('Warning: Cookie may not have been set properly')
      }
    } catch (error) {
      console.error('Error setting auth token:', error)
    }
  },

  getToken: () => {
    if (typeof window === 'undefined') return null
    
    try {
      return Cookies.get(TOKEN_KEY) || null
    } catch (error) {
      console.error('Error getting auth token:', error)
      return null
    }
  },

  removeToken: () => {
    if (typeof window === 'undefined') return
    
    try {
      // Remove with different path configurations to ensure complete removal
      const removeConfigs = [
        { path: '/' },
        { path: '/', domain: window.location.hostname },
        { path: '/', domain: `.${window.location.hostname}` },
        {} // Default config
      ];
      
      removeConfigs.forEach(config => {
        Cookies.remove(TOKEN_KEY, config)
        Cookies.remove(REFRESH_TOKEN_KEY, config)
      });
      
      // Verify removal
      const tokenAfterRemoval = Cookies.get(TOKEN_KEY)
      if (tokenAfterRemoval) {
        console.warn('Warning: Cookie may still exist after removal attempt');
      }
      
    } catch (error) {
      console.error('Error removing auth token:', error)
    }
  },

  setRefreshToken: (refreshToken) => {
    if (typeof window === 'undefined') return
    
    try {
      Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
        ...secureCookieConfig,
        expires: 30 // 30 days for refresh token
      })
    } catch (error) {
      console.error('Error setting refresh token:', error)
    }
  },

  getRefreshToken: () => {
    if (typeof window === 'undefined') return null
    
    try {
      return Cookies.get(REFRESH_TOKEN_KEY) || null
    } catch (error) {
      console.error('Error getting refresh token:', error)
      return null
    }
  }
}

export const isTokenExpired = (token) => {
  if (!token) return true
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    
    return payload.exp < currentTime
  } catch (error) {
    console.error('Error checking token expiration:', error)
    return true
  }
}

export const getTokenPayload = (token) => {
  if (!token) return null
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch (error) {
    console.error('Error parsing token payload:', error)
    return null
  }
}

export const getUserFromToken = (token) => {
  const payload = getTokenPayload(token)
  if (!payload) return null
  
  // Try to extract user info from common JWT payload fields
  return {
    id: payload.sub || payload.user_id || payload.id,
    email: payload.email,
    created_at: payload.created_at || payload.iat ? new Date(payload.iat * 1000).toISOString() : null
  }
}