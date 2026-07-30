import { View, Text, Dimensions, FlatList } from 'react-native'
import { Image } from 'expo-image'
import Animated, { FadeInRight } from 'react-native-reanimated'
import { borderRadius, typography, shadows } from '../../config/theme'
import { Banner } from '../../types'
import { Skeleton } from '../ui'

const { width } = Dimensions.get('window')
const BANNER_WIDTH = width - 32

interface BannerCarouselProps {
  banners: Banner[]
}

export const BannerCarousel = ({ banners }: BannerCarouselProps) => {
  return (
    <FlatList
      data={banners}
      horizontal
      showsHorizontalScrollIndicator={false}
      pagingEnabled
      decelerationRate="fast"
      snapToInterval={BANNER_WIDTH + 12}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      ItemSeparatorComponent={() => <View className="w-3" />}
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInRight.delay(index * 100).duration(500)}>
          <View
            className="rounded-xl overflow-hidden"
            style={{ width: BANNER_WIDTH, height: 180, ...shadows.md }}
          >
            <Image
              source={{ uri: item.image }}
              className="w-full h-full"
              contentFit="cover"
              transition={500}
            />
            <View className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent justify-center px-6">
              <Text className="text-white font-bold text-xl" style={{ fontSize: typography.h3 }}>
                {item.title}
              </Text>
              {item.subtitle && (
                <Text className="text-white/80 mt-1" style={{ fontSize: typography.bodySmall }}>
                  {item.subtitle}
                </Text>
              )}
            </View>
          </View>
        </Animated.View>
      )}
    />
  )
}

export const BannerCarouselSkeleton = () => (
  <View className="px-4 mb-4">
    <Skeleton height={180} borderRadiusVal={borderRadius.lg} />
  </View>
)
