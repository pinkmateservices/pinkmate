import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store'
import { LogIn } from 'lucide-react-native'
import { colors } from '../../config/theme'

export function GuestBanner() {
  const { isGuest } = useAuthStore()
  const router = useRouter()

  if (!isGuest) return null

  return (
    <View className="flex-row items-center justify-between bg-pink-50 border-b border-pink-200 px-4 py-2">
      <Text className="text-sm text-pink-700 flex-1">
        You're browsing as a guest. Sign in to book services.
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/(auth)/login')}
        className="flex-row items-center gap-1 ml-3"
      >
        <LogIn size={14} color={colors.primary} />
        <Text className="text-sm text-primary font-semibold">Sign in</Text>
      </TouchableOpacity>
    </View>
  )
}
