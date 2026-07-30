import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import { Image } from 'expo-image'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { colors, borderRadius, typography, shadows } from '../../config/theme'
import { Clock } from 'lucide-react-native'
import { Service } from '../../types'
import { PriceDisplay } from '../ui/PriceDisplay'
import { DiscountBadge } from '../ui/Badge'
import { FavoriteButton } from '../ui/FavoriteButton'
import { Skeleton } from '../ui/Skeleton'

const { width } = Dimensions.get('window')
const CARD_WIDTH = width - 32

interface ServiceCardProps {
  service: Service
  onPress: () => void
  onBookNow?: () => void
  index?: number
  horizontal?: boolean
}

export const ServiceCard = ({ service, onPress, onBookNow, index = 0, horizontal }: ServiceCardProps) => {
  const discountPercent = service.discountPrice
    ? Math.round(((service.basePrice - service.discountPrice) / service.basePrice) * 100)
    : 0

  const Container = horizontal ? View : Animated.View
  const animProps = horizontal ? {} : { entering: FadeInDown.delay(index * 80).duration(400) }

  return (
    <Container {...animProps} className="mb-4">
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        className="bg-white rounded-xl overflow-hidden"
        style={shadows.md}
      >
        <View className="relative">
          <Image
            source={{ uri: service.thumbnail }}
            className="w-full h-48"
            contentFit="cover"
            transition={300}
          />
          <View className="absolute top-3 left-3">
            {discountPercent > 0 && <DiscountBadge percentage={discountPercent} />}
          </View>
          <View className="absolute top-3 right-3">
            <FavoriteButton serviceId={service.id} />
          </View>
          {service.serviceType && (
            <View className="absolute bottom-3 left-3 bg-black/50 px-2.5 py-1 rounded-full">
              <Text className="text-white text-xs font-medium">{service.serviceType}</Text>
            </View>
          )}
          <View className="absolute bottom-3 right-3 bg-black/50 px-2.5 py-1 rounded-full flex-row items-center">
            <Clock size={12} color={colors.white} />
            <Text className="text-white text-xs font-medium ml-1">{service.duration} min</Text>
          </View>
        </View>
        <View className="p-4">
          <Text className="font-semibold text-gray-900" style={{ fontSize: typography.body }} numberOfLines={1}>
            {service.name}
          </Text>
          <Text className="text-gray-500 mt-1" style={{ fontSize: typography.caption }} numberOfLines={2}>
            {service.shortDescription}
          </Text>
          <View className="flex-row items-center justify-between mt-3">
            <PriceDisplay
              basePrice={service.basePrice}
              discountPrice={service.discountPrice}
              size="md"
            />
            {onBookNow && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation()
                  onBookNow()
                }}
                className="bg-pink-500 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-semibold text-sm">Book Now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Container>
  )
}

export const ServiceCardHorizontal = ({ service, onPress }: { service: Service; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.9}
    className="bg-white rounded-xl overflow-hidden mr-3"
    style={[{ width: CARD_WIDTH * 0.6 }, shadows.md]}
  >
    <Image
      source={{ uri: service.thumbnail }}
      className="w-full h-28"
      contentFit="cover"
      transition={300}
    />
    <View className="p-3">
      <Text className="font-semibold text-gray-900 text-sm" numberOfLines={1}>
        {service.name}
      </Text>
      <PriceDisplay
        basePrice={service.basePrice}
        discountPrice={service.discountPrice}
        size="sm"
        className="mt-1"
      />
    </View>
  </TouchableOpacity>
)

export const ServiceCardSkeleton = () => (
  <View className="bg-white rounded-xl overflow-hidden mb-4" style={shadows.md}>
    <Skeleton height={192} />
    <View className="p-4">
      <Skeleton width="70%" height={18} className="mb-2" />
      <Skeleton width="90%" height={14} className="mb-3" />
      <View className="flex-row justify-between items-center">
        <Skeleton width={100} height={22} />
        <Skeleton width={80} height={32} borderRadiusVal={borderRadius.lg} />
      </View>
    </View>
  </View>
)
