import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import { Image } from 'expo-image'
import { shadows } from '../../config/theme'
import { Category } from '../../types'
import { Skeleton } from '../ui/Skeleton'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48) / 2

interface CategoryCardProps {
  category: Category
  onPress: () => void
  variant?: 'grid' | 'horizontal'
}

export const CategoryCard = ({ category, onPress, variant = 'grid' }: CategoryCardProps) => {
  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="items-center mr-4"
      >
        <View
          className="w-16 h-16 rounded-xl items-center justify-center mb-2"
          style={{ backgroundColor: '#FDF2F8' }}
        >
          <Text className="text-2xl">{category.name.charAt(0)}</Text>
        </View>
        <Text className="text-gray-700 text-xs font-medium text-center" numberOfLines={1}>
          {category.name}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-4"
      style={{ width: CARD_WIDTH }}
    >
      <View
        className="bg-white rounded-xl overflow-hidden"
        style={shadows.md}
      >
        <View className="h-28 bg-pink-50 items-center justify-center">
          {category.image ? (
            <Image
              source={{ uri: category.image }}
              className="w-full h-full"
              contentFit="cover"
            />
          ) : (
            <Text className="text-4xl">{category.name.charAt(0)}</Text>
          )}
        </View>
        <View className="p-3">
          <Text className="font-semibold text-gray-900 text-sm" numberOfLines={1}>
            {category.name}
          </Text>
          <Text className="text-gray-500 text-xs mt-1" numberOfLines={2}>
            {category.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export const CategoryCardSkeleton = () => (
  <View className="mb-4" style={{ width: CARD_WIDTH }}>
    <View className="bg-white rounded-xl overflow-hidden" style={shadows.md}>
      <Skeleton height={112} />
      <View className="p-3">
        <Skeleton width="70%" height={16} className="mb-1" />
        <Skeleton width="90%" height={12} />
      </View>
    </View>
  </View>
)
