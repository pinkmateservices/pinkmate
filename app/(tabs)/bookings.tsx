import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { colors, typography, shadows } from '../../src/config/theme'
import { useBookings } from '../../src/hooks'
import { EmptyState, Skeleton, Badge, RatePartnerModal } from '../../src/components/ui'
import { Calendar, Clock, MapPin, ChevronRight, Star } from 'lucide-react-native'
import { useState, useMemo, useCallback } from 'react'
import { Booking } from '../../src/types'

export default function BookingsScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { data: bookings, isLoading, refetch } = useBookings()
  const [refreshing, setRefreshing] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const sortedBookings = useMemo(() => {
    if (!bookings) return []
    return [...bookings].sort((a, b) => b.createdAt - a.createdAt)
  }, [bookings])

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
        <View className="px-6 pt-4 pb-4">
          <Skeleton width={120} height={28} />
        </View>
        <View className="px-4">
          {[1, 2, 3].map((i) => (
            <View key={i} className="bg-white rounded-xl p-4 mb-3" style={shadows.md}>
              <Skeleton width="70%" height={18} className="mb-2" />
              <Skeleton width="50%" height={14} className="mb-2" />
              <Skeleton width="40%" height={14} />
            </View>
          ))}
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <View className="px-6 pt-4 pb-4">
        <Text className="text-gray-900 font-bold" style={{ fontSize: typography.h1 }}>My Bookings</Text>
      </View>

      {sortedBookings.length === 0 ? (
        <EmptyState
          icon={<Calendar size={48} color={colors.primary} />}
          title="No Bookings Yet"
          description="Your booking history will appear here once you book a service."
          action={
            <TouchableOpacity
              onPress={() => router.push('/(tabs)')}
              className="bg-pink-500 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Book a Service</Text>
            </TouchableOpacity>
          }
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          className="flex-1 px-4"
        >
          {sortedBookings.map((booking, index) => {
            return (
              <Animated.View
                key={booking.id}
                entering={FadeInDown.delay(index * 50).duration(400)}
              >
                <TouchableOpacity
                  onPress={() => router.push(`/booking/${booking.id}`)}
                  activeOpacity={0.7}
                  className="bg-white rounded-xl p-4 mb-3"
                  style={shadows.md}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-gray-900 font-semibold flex-1" style={{ fontSize: typography.body }} numberOfLines={1}>
                      {booking.items.map((i) => i.serviceName).join(', ')}
                    </Text>
                    <Badge
                      label={booking.status}
                      variant={
                        booking.status === 'Completed' ? 'success' :
                        booking.status === 'Cancelled' ? 'error' :
                        booking.status === 'Pending' ? 'warning' : 'info'
                      }
                    />
                  </View>

                  <View className="flex-row items-center mb-2">
                    <Calendar size={14} color={colors.textTertiary} />
                    <Text className="text-gray-500 ml-2" style={{ fontSize: typography.caption }}>
                      {booking.scheduledDate}
                    </Text>
                    <Clock size={14} color={colors.textTertiary} className="ml-4" />
                    <Text className="text-gray-500 ml-2" style={{ fontSize: typography.caption }}>
                      {booking.scheduledTime}
                    </Text>
                  </View>

                  <View className="flex-row items-center mb-2">
                    <MapPin size={14} color={colors.textTertiary} />
                    <Text className="text-gray-500 ml-2" style={{ fontSize: typography.caption }} numberOfLines={1}>
                      {booking.address?.fullAddress || 'Address not available'}
                    </Text>
                  </View>

                  {(booking.status === 'On The Way' || booking.status === 'Service Started') && booking.customerOtp && (
                    <View className="mt-3 p-3 rounded-xl items-center border border-pink-100 bg-pink-50">
                      <Text className="text-gray-600" style={{ fontSize: typography.caption }}>
                        Share this code with your partner
                      </Text>
                      <Text className="text-pink-600 font-bold tracking-[8px] my-1" style={{ fontSize: 32 }}>
                        {booking.customerOtp}
                      </Text>
                      <Text className="text-gray-400 text-center" style={{ fontSize: typography.caption }}>
                        Your partner will ask for this to complete the job.
                      </Text>
                    </View>
                  )}

                  <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-gray-100">
                    <Text className="text-gray-900 font-bold" style={{ fontSize: typography.body }}>
                      ₹{booking.finalAmount}
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-pink-500 font-medium mr-1" style={{ fontSize: typography.caption }}>
                        View Details
                      </Text>
                      <ChevronRight size={14} color={colors.primary} />
                    </View>
                  </View>

                  {booking.status === 'Completed' && booking.assignedPartnerId && (
                    <TouchableOpacity
                      onPress={() => setReviewTarget(booking)}
                      className="mt-3 flex-row items-center justify-center rounded-xl py-2.5 border border-pink-200 bg-pink-50"
                      activeOpacity={0.7}
                    >
                      <Star size={15} color={colors.accent} fill={colors.accent} />
                      <Text className="text-pink-600 font-semibold ml-2" style={{ fontSize: typography.bodySmall }}>
                        Rate your partner
                      </Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )
          })}
          <View className="h-8" />
        </ScrollView>
      )}

      <RatePartnerModal
        booking={reviewTarget}
        visible={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
      />
    </View>
  )
}
