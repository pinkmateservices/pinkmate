import { View, Animated } from 'react-native'
import { useEffect, useRef } from 'react'
import { borderRadius } from '../../config/theme'

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadiusVal?: number
  className?: string
}

export const Skeleton = ({
  width = '100%',
  height = 20,
  borderRadiusVal = borderRadius.sm,
  className = '',
}: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [opacity])

  return (
    <Animated.View
      className={`bg-gray-200 ${className}`}
      style={{
        width: width as any,
        height,
        borderRadius: borderRadiusVal,
        opacity,
      }}
    />
  )
}

export const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <View className={`bg-white rounded-xl p-4 ${className}`} style={{ elevation: 1 }}>
    <Skeleton height={160} borderRadiusVal={borderRadius.md} className="mb-3" />
    <Skeleton width="70%" height={16} className="mb-2" />
    <Skeleton width="90%" height={14} className="mb-2" />
    <View className="flex-row justify-between items-center mt-2">
      <Skeleton width={80} height={20} />
      <Skeleton width={60} height={14} />
    </View>
  </View>
)

export const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <View className="px-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} className="mb-4" />
    ))}
  </View>
)

export const SkeletonRow = ({ className = '' }: { className?: string }) => (
  <View className={`flex-row items-center bg-white rounded-xl p-4 mb-3 ${className}`} style={{ elevation: 1 }}>
    <Skeleton width={60} height={60} borderRadiusVal={borderRadius.md} />
    <View className="flex-1 ml-3">
      <Skeleton width="60%" height={16} className="mb-2" />
      <Skeleton width="40%" height={14} />
    </View>
  </View>
)

export const SkeletonBanner = ({ className = '' }: { className?: string }) => (
  <View className={`px-4 mb-4 ${className}`}>
    <Skeleton height={180} borderRadiusVal={borderRadius.lg} />
  </View>
)
