import { View, Text, ScrollView } from 'react-native'
import { colors, typography } from '../../config/theme'
import { CheckCircle2, Circle } from 'lucide-react-native'

interface TimelineProps {
  steps: { status: string; timestamp: number; note?: string }[]
  allStatuses: readonly string[]
}

export const Timeline = ({ steps, allStatuses }: TimelineProps) => {
  const statusMap = new Map(steps.map((s) => [s.status, s]))
  const lastCompletedIndex = allStatuses.reduce((max, status, i) => {
    return statusMap.has(status) ? i : max
  }, -1)

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {allStatuses.map((status, index) => {
        const step = statusMap.get(status)
        const isCompleted = index <= lastCompletedIndex
        const isActive = index === lastCompletedIndex + 1
        const isLast = index === allStatuses.length - 1

        return (
          <View key={status} className="flex-row">
            <View className="items-center mr-4">
              {isCompleted ? (
                <CheckCircle2 size={24} color={colors.success} />
              ) : isActive ? (
                <View className="w-6 h-6 rounded-full border-2 border-pink-500 items-center justify-center">
                  <View className="w-3 h-3 rounded-full bg-pink-500" />
                </View>
              ) : (
                <Circle size={24} color={colors.border} />
              )}
              {!isLast && (
                <View
                  className="w-0.5 flex-1 mt-1"
                  style={{
                    backgroundColor: isCompleted ? colors.success : colors.border,
                  }}
                />
              )}
            </View>
            <View className={`flex-1 pb-6 ${isLast ? '' : ''}`}>
              <Text
                className={`font-semibold ${
                  isCompleted
                    ? 'text-gray-900'
                    : isActive
                    ? 'text-pink-500'
                    : 'text-gray-400'
                }`}
                style={{ fontSize: typography.body }}
              >
                {status}
              </Text>
              {step && (
                <Text
                  className="text-gray-500 mt-1"
                  style={{ fontSize: typography.caption }}
                >
                  {new Date(step.timestamp).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              )}
              {step?.note && (
                <Text
                  className="text-gray-400 mt-0.5"
                  style={{ fontSize: typography.caption }}
                >
                  {step.note}
                </Text>
              )}
            </View>
          </View>
        )
      })}
    </ScrollView>
  )
}
