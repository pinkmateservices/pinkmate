import { Stack } from 'expo-router'
import { useEffect, useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '../src/store'
import { onAuthChanged, getCurrentUser, getCachedUser } from '../src/services/auth'
import * as SplashScreen from 'expo-splash-screen'
import './global.css'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    },
  },
})

function AuthGate({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore()
  const splashHidden = useRef(false)

  const hideSplash = async () => {
    if (splashHidden.current) return
    splashHidden.current = true
    try {
      await SplashScreen.hideAsync()
    } catch {}
  }

  useEffect(() => {
    // Load cached user immediately so the app doesn't flash to login on restart
    getCachedUser().then((cached) => {
      if (cached) setUser(cached)
    })

    const unsubscribe = onAuthChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getCurrentUser()
          setUser(userData)
        } catch {
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
      await hideSplash()
    })

    return unsubscribe
  }, [])

  return <>{children}</>
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="category/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="category/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="services/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="service-details/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="booking/index" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
          <Stack.Screen name="booking/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="booking/chat/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="booking" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
          <Stack.Screen name="orders/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        </Stack>
      </AuthGate>
    </QueryClientProvider>
  )
}
