import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, typography, shadows } from '../../src/config/theme'
import { useFavoritesStore } from '../../src/store'
import { useServices } from '../../src/hooks'
import { EmptyState, Skeleton } from '../../src/components/ui'
import { ServiceCard } from '../../src/components/ui/ServiceCard'
import { Heart } from 'lucide-react-native'
import { useMemo, useState, useCallback } from 'react'

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds)
  const { data: allServices, isLoading } = useServices()
  const [refreshing, setRefreshing] = useState(false)

  const favoriteServices = useMemo(() => {
    if (!allServices || favoriteIds.size === 0) return []
    return allServices.filter((s) => favoriteIds.has(s.id))
  }, [allServices, favoriteIds])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setRefreshing(false)
  }, [])

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <View className="px-6 pt-4 pb-4">
        <Text className="text-gray-900 font-bold" style={{ fontSize: typography.h1 }}>Favorites</Text>
      </View>

      {isLoading ? (
        <View className="px-4">
          {[1, 2].map((i) => (
            <View key={i} className="bg-white rounded-xl overflow-hidden mb-4" style={shadows.md}>
              <Skeleton height={160} />
              <View className="p-4">
                <Skeleton width="70%" height={18} className="mb-2" />
                <Skeleton width="50%" height={14} />
              </View>
            </View>
          ))}
        </View>
      ) : favoriteServices.length === 0 ? (
        <EmptyState
          icon={<Heart size={48} color={colors.primary} />}
          title="No Favorites Yet"
          description="Save your favorite services by tapping the heart icon."
          action={
            <TouchableOpacity
              onPress={() => router.push('/(tabs)')}
              className="bg-pink-500 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Explore Services</Text>
            </TouchableOpacity>
          }
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          className="flex-1 px-4"
        >
          {favoriteServices.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              onPress={() => router.push(`/service-details/${service.id}`)}
              onBookNow={() => {
                useFavoritesStore.getState().removeFavorite(service.id)
                router.push(`/booking?serviceId=${service.id}`)
              }}
            />
          ))}
          <View className="h-8" />
        </ScrollView>
      )}
    </View>
  )
}
