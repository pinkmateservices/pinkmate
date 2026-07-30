import { View, Text, TouchableOpacity } from 'react-native'
import { colors, typography } from '../../config/theme'
import { AlertCircle, RefreshCw } from 'lucide-react-native'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export const ErrorState = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) => (
  <View className="flex-1 items-center justify-center px-8 py-16">
    <AlertCircle size={48} color={colors.error} />
    <Text
      className="text-gray-900 text-center font-semibold mt-4 mb-2"
      style={{ fontSize: typography.h4 }}
    >
      Oops!
    </Text>
    <Text
      className="text-gray-500 text-center mb-6"
      style={{ fontSize: typography.bodySmall }}
    >
      {message}
    </Text>
    {onRetry && (
      <TouchableOpacity
        onPress={onRetry}
        className="flex-row items-center bg-pink-500 px-6 py-3 rounded-xl"
      >
        <RefreshCw size={18} color={colors.white} />
        <Text className="text-white font-semibold ml-2" style={{ fontSize: typography.bodySmall }}>
          Try Again
        </Text>
      </TouchableOpacity>
    )}
  </View>
)
