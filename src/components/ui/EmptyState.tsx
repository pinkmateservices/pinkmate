import { View, Text } from 'react-native'
import { typography } from '../../config/theme'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <View className="flex-1 items-center justify-center px-8 py-16">
    {icon && <View className="mb-4">{icon}</View>}
    <Text
      className="text-gray-900 text-center font-semibold mb-2"
      style={{ fontSize: typography.h4 }}
    >
      {title}
    </Text>
    {description && (
      <Text
        className="text-gray-500 text-center mb-6"
        style={{ fontSize: typography.bodySmall }}
      >
        {description}
      </Text>
    )}
    {action}
  </View>
)
