import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isHydrated: false
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => set({ token }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      login: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true, 
        error: null 
      }),
      
      logout: () => set({ 
        ...initialState,
        isHydrated: true
      }),
      
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),

      // Mark as hydrated when store is initialized
      setHydrated: () => set({ isHydrated: true }),
      
      // Sync state with cookie data
      syncWithCookies: (cookieToken, cookieUser) => {
        const currentState = get()
        
        // If no cookie token but we think we're authenticated, logout
        if (!cookieToken && currentState.isAuthenticated) {
          set({ 
            ...initialState,
            isHydrated: true
          })
          return
        }
        
        // If we have cookie data but store doesn't match, update store
        if (cookieToken && (!currentState.token || currentState.token !== cookieToken)) {
          set({
            user: cookieUser,
            token: cookieToken,
            isAuthenticated: true,
            error: null
          })
        }
      },

      hydrate: () => {
        const state = get()
        if (state.token && state.user) {
          set({ isAuthenticated: true })
        }
      }
    }),
    {
      name: 'termoexportador-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated()
          
          // Quick sync check on rehydration
          if (typeof window !== 'undefined') {
            const cookieToken = document.cookie
              .split('; ')
              .find(row => row.startsWith('auth_token='))
              ?.split('=')[1]
              
            if (!cookieToken && state.isAuthenticated) {
              // Cookie was deleted while app was closed, logout
              state.logout()
            }
          }
        }
      }
    }
  )
)