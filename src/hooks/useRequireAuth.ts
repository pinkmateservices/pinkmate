import { useRouter } from 'expo-router'
import { useAuthStore } from '../store'

/**
 * Returns a guard function. Call it before any action that requires a real account
 * (booking, profile updates, etc.). If the user is a guest, it redirects to login
 * and returns false so you can bail out early.
 *
 * Usage:
 *   const requireAuth = useRequireAuth()
 *   const handleBook = () => {
 *     if (!requireAuth()) return
 *     // proceed with booking
 *   }
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  return (): boolean => {
    if (isAuthenticated) return true
    router.push('/(auth)/login')
    return false
  }
}
