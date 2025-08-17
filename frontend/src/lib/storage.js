const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export const storage = {
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token)
    }
  },

  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY)
    }
    return null
  },

  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
    }
  },

  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
  },

  getUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(USER_KEY)
      try {
        return user ? JSON.parse(user) : null
      } catch {
        return null
      }
    }
    return null
  },

  removeUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_KEY)
    }
  },

  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  }
}