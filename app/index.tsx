import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter, Redirect } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, typography } from '../src/config/theme'
import { useAuthStore } from '../src/store'
import { Sparkles } from 'lucide-react-native'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'

export default function Index() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreen.preventAutoHideAsync()
      await new Promise((resolve) => setTimeout(resolve, 500))
      await SplashScreen.hideAsync()
    }
    hideSplash()
  }, [])

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Sparkles size={48} color={colors.primary} />
      </View>
    )
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-1 items-center justify-center px-8">
        <Animated.View entering={FadeInDown.duration(800)} className="items-center mb-8">
          <View className="w-24 h-24 rounded-2xl bg-pink-100 items-center justify-center mb-6">
            <Sparkles size={48} color={colors.primary} />
          </View>
          <Text className="text-gray-900 font-bold text-center" style={{ fontSize: 36 }}>
            Pinkmate
          </Text>
          <Text className="text-gray-500 mt-3 text-center" style={{ fontSize: typography.body }}>
            Premium beauty services at your doorstep
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(600)} className="w-full mt-8">
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            className="bg-pink-500 py-4 rounded-xl items-center mb-4"
          >
            <Text className="text-white font-semibold text-lg">Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            className="bg-white py-4 rounded-xl items-center border-2 border-pink-500"
          >
            <Text className="text-pink-500 font-semibold text-lg">Create Account</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  )
}
