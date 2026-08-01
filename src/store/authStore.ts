import { create } from 'zustand'
import { User } from '../types'
import * as authService from '../services/auth'

interface AuthStore {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isGuest: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  continueAsGuest: () => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'totalBookings'>) => Promise<void>
  logout: () => Promise<void>
  hydrate: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isGuest: false,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isGuest: false }),

  setLoading: (isLoading) =>
    set({ isLoading }),

  continueAsGuest: () =>
    set({ isGuest: true, isAuthenticated: false, user: null }),

  signIn: async (email, password) => {
    const user = await authService.signIn(email, password)
    set({ user, isAuthenticated: true, isGuest: false })
    authService.updateUserLocation(user.id)
  },

  signUp: async (email, password, userData) => {
    const user = await authService.signUp(email, password, userData)
    set({ user, isAuthenticated: true, isGuest: false })
    authService.updateUserLocation(user.id)
  },

  logout: async () => {
    await authService.logout()
    set({ user: null, isAuthenticated: false, isGuest: false })
  },

  hydrate: async () => {
    try {
      const user = await authService.getCurrentUser()
      set({ user, isAuthenticated: !!user, isLoading: false })
      if (user) authService.updateUserLocation(user.id)
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
