import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import { Image } from 'expo-image'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { colors, borderRadius, typography, shadows } from '../../config/theme'
import { ChevronRight } from 'lucide-react-native'
import { SubCategory } from '../../types'
import { Skeleton } from '../ui'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48) / 2

interface SubCategoryCardProps {
  subCategory: SubCategory
  onPress: () => void
  index: number
}

export const SubCategoryCard = ({ subCategory, onPress, index }: SubCategoryCardProps) => (
  <Animated.View
    entering={FadeInDown.delay(index * 80).duration(400)}
    className="mb-3"
  >
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-xl flex-row items-center p-4"
      style={{
        ...shadows.md,
      }}
    >
      <View
        className="w-16 h-16 rounded-xl items-center justify-center"
        style={{ backgroundColor: '#FDF2F8' }}
      >
        {subCategory.image ? (
          <Image
            source={{ uri: subCategory.image }}
            className="w-14 h-14 rounded-lg"
            contentFit="cover"
          />
        ) : (
          <Text className="text-2xl">{subCategory.name.charAt(0)}</Text>
        )}
      </View>
      <View className="flex-1 ml-3">
        <Text className="font-semibold text-gray-900" style={{ fontSize: typography.body }}>
          {subCategory.name}
        </Text>
        <Text
          className="text-gray-500 mt-1"
          style={{ fontSize: typography.caption }}
          numberOfLines={1}
        >
          {subCategory.description}
        </Text>
        <View className="flex-row items-center mt-1.5">
          <Text className="text-pink-500 font-medium" style={{ fontSize: typography.tiny }}>
            {subCategory.serviceCount ?? 0} Services
          </Text>
        </View>
      </View>
      <ChevronRight size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  </Animated.View>
)

export const SubCategoryCardSkeleton = () => (
  <View className="flex-row items-center bg-white rounded-xl p-4 mb-3" style={shadows.md}>
    <Skeleton width={64} height={64} borderRadiusVal={borderRadius.md} />
    <View className="flex-1 ml-3">
      <Skeleton width="60%" height={16} className="mb-2" />
      <Skeleton width="80%" height={12} className="mb-2" />
      <Skeleton width="40%" height={12} />
    </View>
  </View>
)
