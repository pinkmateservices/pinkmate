import { create } from 'zustand'
import { User } from '../types'
import * as authService from '../services/auth'

interface AuthStore {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'totalBookings'>) => Promise<void>
  logout: () => Promise<void>
  hydrate: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user }),

  setLoading: (isLoading) =>
    set({ isLoading }),

  signIn: async (email, password) => {
    const user = await authService.signIn(email, password)
    set({ user, isAuthenticated: true })
  },

  signUp: async (email, password, userData) => {
    const user = await authService.signUp(email, password, userData)
    set({ user, isAuthenticated: true })
  },

  logout: async () => {
    await authService.logout()
    set({ user: null, isAuthenticated: false })
  },

  hydrate: async () => {
    try {
      const user = await authService.getCurrentUser()
      set({ user, isAuthenticated: !!user, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
