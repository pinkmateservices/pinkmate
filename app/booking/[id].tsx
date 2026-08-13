import { View, Text, ScrollView, TouchableOpacity, Linking, Platform, ActivityIndicator } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRef, useState, useEffect, useCallback } from 'react'
import MapView, { Marker, Polyline, Region } from 'react-native-maps'
import { Image } from 'expo-image'
import { colors, typography, shadows } from '../../src/config/theme'
import { useBooking, useLivePartner, useCategories } from '../../src/hooks'
import { useCurrentLocation } from '../../src/hooks/useLocation'
import { Timeline, Skeleton, RatePartnerModal } from '../../src/components/ui'
import { BOOKING_STATUS, BOOKING_STATUS_FLOW } from '../../src/config/constants'
import { haversineDistanceKm, formatDistance, formatEtaMinutes, LatLng } from '../../src/utils/geo'
import {
  ArrowLeft, MapPin, Calendar, CreditCard, Star,
  Navigation, Crosshair, MessageCircle,
} from 'lucide-react-native'
import { Booking, BookingStatus } from '../../src/types'

const statusColors: Record<string, { bg: string; text: string }> = {
  'Pending': { bg: '#FFFBEB', text: '#D97706' },
  'Confirmed': { bg: '#EFF6FF', text: '#2563EB' },
  'Partner Assigned': { bg: '#FDF2F8', text: '#DB2777' },
  'On The Way': { bg: '#F0FDF4', text: '#059669' },
  'Service Started': { bg: '#F0FDF4', text: '#059669' },
  'Completed': { bg: '#ECFDF5', text: '#059669' },
  'Cancelled': { bg: '#FEF2F2', text: '#DC2626' },
}

const TRACKABLE_STATUSES: BookingStatus[] = [
  BOOKING_STATUS.PARTNER_ASSIGNED,
  BOOKING_STATUS.ON_THE_WAY,
  BOOKING_STATUS.SERVICE_STARTED,
]

const DEFAULT_REGION: Region = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 8,
  longitudeDelta: 8,
}

function toLatLng(
  lat: number | undefined,
  lng: number | undefined
): LatLng | null {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null
  if (lat === 0 && lng === 0) return null
  return { latitude: lat, longitude: lng }
}

export default function BookingDetailsScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const bookingId = (id as string) || ''

  const { data: booking, isLoading } = useBooking(bookingId)
  const { data: partner } = useLivePartner(booking?.assignedPartnerId ?? '')
  const { coordinates: userCoords } = useCurrentLocation()
  const { data: categories = [] } = useCategories()

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id

  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null)
  const [followMode, setFollowMode] = useState(true)
  const mapRef = useRef<MapView>(null)
  const lastFitRef = useRef<LatLng | null>(null)

  const dest = booking ? toLatLng(booking.address?.latitude, booking.address?.longitude) : null
  const partnerLoc = partner ? toLatLng(partner.currentLocation?.latitude, partner.currentLocation?.longitude) : null
  const userLoc = userCoords ? toLatLng(userCoords.latitude, userCoords.longitude) : null

  const isTrackable =
    !!booking && !!partner && TRACKABLE_STATUSES.includes(booking.status)

  // ── Map helpers ──────────────────────────────────────────────

  const fitMap = useCallback(() => {
    const points: LatLng[] = []
    if (partnerLoc) points.push(partnerLoc)
    if (dest) points.push(dest)
    if (userLoc) points.push(userLoc)
    if (!points.length || !mapRef.current) return
    mapRef.current.fitToCoordinates(points, {
      edgePadding: { top: 90, right: 56, bottom: 90, left: 56 },
      animated: true,
    })
  }, [partnerLoc, dest, userLoc])

  // Auto-follow the partner: refit whenever the partner moves meaningfully,
  // unless the user has manually dragged the map.
  useEffect(() => {
    if (!followMode || !partnerLoc || !mapRef.current) return
    const last = lastFitRef.current
    if (last && haversineDistanceKm(last, partnerLoc) < 0.15) return
    lastFitRef.current = partnerLoc
    fitMap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerLoc?.latitude, partnerLoc?.longitude, followMode])

  const recenter = () => {
    lastFitRef.current = null
    setFollowMode(true)
    fitMap()
  }

  const openChat = () => {
    router.push(`/booking/chat/${bookingId}`)
  }

  const openDirections = () => {
    const target = partnerLoc ?? dest
    if (!target) return
    const url = Platform.OS === 'ios'
      ? `maps:?q=${target.latitude},${target.longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${target.latitude},${target.longitude}`
    Linking.openURL(url)
  }

  // ── Derived values ───────────────────────────────────────────

  const distanceKm =
    partnerLoc && dest ? haversineDistanceKm(partnerLoc, dest) : null

  // Computed fresh each render; MapView only reads it once on mount, and the
  // map mounts only once the booking (and partner) data has arrived.
  const initialRegion: Region = partnerLoc
    ? { ...partnerLoc, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : dest
    ? { ...dest, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : userLoc
    ? { ...userLoc, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : DEFAULT_REGION

  // ── Loading / not found ──────────────────────────────────────

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-5 py-3 bg-white border-b border-gray-100">
          <ArrowLeft size={22} color={colors.text} />
        </View>
        <View className="px-4 pt-4">
          <Skeleton height={200} className="mb-4" />
          <Skeleton width="70%" height={20} className="mb-3" />
          <Skeleton width="100%" height={14} className="mb-2" />
          <Skeleton width="100%" height={14} className="mb-2" />
          <Skeleton width="60%" height={14} />
        </View>
      </View>
    )
  }

  if (!booking) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-8" style={{ paddingTop: insets.top }}>
        <Text className="text-gray-400 text-center" style={{ fontSize: typography.body }}>
          Booking not found.
        </Text>
        <TouchableOpacity className="mt-4 bg-pink-500 px-6 py-3 rounded-xl" onPress={() => router.back()}>
          <Text className="text-white font-semibold">Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const sc = statusColors[booking.status] || statusColors['Pending']
  const showOtp = (booking.status === 'On The Way' || booking.status === 'Service Started') && !!booking.customerOtp
  const showRate = booking.status === 'Completed' && !!booking.assignedPartnerId
  const subtotal = booking.totalAmount ?? 0
  const discount = booking.discountAmount ?? 0

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1 mr-3">
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text className="font-bold text-gray-900 flex-1" style={{ fontSize: typography.h4 }} numberOfLines={1}>
          Booking Details
        </Text>
        <View
          className="px-2.5 py-1 rounded-full"
          style={{ backgroundColor: sc.bg }}
        >
          <Text className="font-semibold" style={{ fontSize: typography.tiny, color: sc.text }}>
            {booking.status}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Live tracking map */}
        {isTrackable && (
          <View className="mt-4 mx-4 rounded-2xl overflow-hidden" style={shadows.md}>
            <View className="h-72">
              <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                provider="google"
                initialRegion={initialRegion}
                onPanDrag={() => setFollowMode(false)}
                toolbarEnabled={false}
                loadingEnabled
                loadingBackgroundColor="#F9FAFB"
              >
                {partnerLoc && dest && (
                  <Polyline
                    coordinates={[partnerLoc, dest]}
                    strokeColor={colors.primary}
                    strokeWidth={3}
                    lineDashPattern={[1, 1]}
                  />
                )}
                {partnerLoc && (
                  <Marker coordinate={partnerLoc} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
                    <View
                      className="w-11 h-11 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: colors.primary,
                        borderWidth: 3,
                        borderColor: '#fff',
                        ...shadows.md,
                      }}
                    >
                      <Navigation size={20} color="#fff" />
                    </View>
                  </Marker>
                )}
                {userLoc && (
                  <Marker coordinate={userLoc} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
                    <View className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white" style={shadows.sm} />
                  </Marker>
                )}
                {dest && (
                  <Marker coordinate={dest} anchor={{ x: 0.5, y: 1 }}>
                    <View className="items-center">
                      <MapPin size={36} color={colors.primary} fill={colors.primary + "33"} />
                    </View>
                  </Marker>
                )}
              </MapView>

              {!partnerLoc && (
                <View className="absolute inset-0 items-center justify-center bg-white/70">
                  <ActivityIndicator color={colors.primary} />
                  <Text className="text-gray-500 mt-2" style={{ fontSize: typography.caption }}>
                    {`Waiting for ${partner?.fullName?.split(' ')[0] ?? 'partner'}'s location…`}
                  </Text>
                </View>
              )}

              {/* Recenter FAB */}
              <TouchableOpacity
                onPress={recenter}
                className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-white items-center justify-center"
                style={shadows.md}
                activeOpacity={0.85}
              >
                <Crosshair size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Distance / ETA strip */}
            <View className="bg-white px-4 py-3.5 flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: '#FDF2F8' }}
              >
                <Navigation size={18} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold" style={{ fontSize: typography.bodySmall }}>
                  {distanceKm != null
                    ? `${partner?.fullName?.split(' ')[0] ?? 'Partner'} is ${formatDistance(distanceKm)}`
                    : 'Partner is on the way'}
                </Text>
                {distanceKm != null && (
                  <Text className="text-gray-400 mt-0.5" style={{ fontSize: typography.caption }}>
                    Est. arrival in {formatEtaMinutes(distanceKm)}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={openDirections}
                className="bg-pink-50 rounded-xl px-3.5 py-2 border border-pink-100"
                activeOpacity={0.8}
              >
                <Text className="text-pink-600 font-semibold" style={{ fontSize: typography.caption }}>
                  Navigate
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Location (static, when not trackable) */}
        {!isTrackable && dest && (
          <View className="mt-4 mx-4 rounded-2xl overflow-hidden" style={shadows.md}>
            <View className="h-44">
              <MapView
                style={{ flex: 1 }}
                provider="google"
                initialRegion={{ ...dest, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
                scrollEnabled={false}
                zoomEnabled={false}
                toolbarEnabled={false}
                loadingEnabled
                loadingBackgroundColor="#F9FAFB"
              >
                <Marker coordinate={dest} anchor={{ x: 0.5, y: 1 }}>
                  <View className="items-center">
                    <MapPin size={36} color={colors.primary} fill={colors.primary + "33"} />
                  </View>
                </Marker>
              </MapView>
            </View>
          </View>
        )}

        {/* Partner information */}
        {partner && (
          <View className="mt-4 mx-4 bg-white rounded-2xl p-4" style={shadows.sm}>
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 rounded-full bg-pink-100 items-center justify-center overflow-hidden">
                {partner.photoUrl ? (
                  <Image source={{ uri: partner.photoUrl }} style={{ width: 48, height: 48 }} contentFit="cover" />
                ) : (
                  <Text className="text-pink-600 font-bold" style={{ fontSize: typography.h4 }}>
                    {partner.fullName?.charAt(0).toUpperCase() ?? 'P'}
                  </Text>
                )}
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-gray-900 font-bold" style={{ fontSize: typography.body }}>
                  {partner.fullName}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Star size={13} color={colors.accent} fill={colors.accent} />
                  <Text className="text-gray-600 ml-1" style={{ fontSize: typography.caption }}>
                    {partner.rating?.toFixed(1) ?? '—'} ({partner.ratingCount ?? 0})
                  </Text>
                  <View className="w-1 h-1 rounded-full bg-gray-300 mx-2" />
                  <Text className="text-gray-500" style={{ fontSize: typography.caption }}>
                    {partner.totalJobsCompleted ?? 0} jobs
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={openChat}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: '#FDF2F8' }}
                activeOpacity={0.8}
              >
                <MessageCircle size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {!!partner.skills?.length && (
              <View className="flex-row flex-wrap gap-1.5">
                {partner.skills.map((skill, i) => (
                  <View key={`${skill}-${i}`} className="bg-gray-100 rounded-full px-3 py-1">
                    <Text className="text-gray-600" style={{ fontSize: typography.tiny }}>
                      {categoryName(skill)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* OTP */}
        {showOtp && (
          <View className="mt-4 mx-4 p-4 rounded-2xl items-center border border-pink-100 bg-pink-50">
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

        {/* Booking details */}
        <View className="mt-4 mx-4 bg-white rounded-2xl p-4" style={shadows.sm}>
          <Text className="text-gray-900 font-bold mb-3" style={{ fontSize: typography.body }}>
            Services
          </Text>
          {booking.items?.map((item) => (
            <View key={item.serviceId} className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-700 flex-1" style={{ fontSize: typography.bodySmall }}>
                {item.serviceName} {item.quantity > 1 ? `× ${item.quantity}` : ''}
              </Text>
              <Text className="text-gray-900 font-semibold" style={{ fontSize: typography.bodySmall }}>
                ₹{item.price * item.quantity}
              </Text>
            </View>
          ))}

          <View className="border-t border-gray-100 pt-3 mt-2">
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-gray-500" style={{ fontSize: typography.bodySmall }}>Subtotal</Text>
              <Text className="text-gray-800 font-medium" style={{ fontSize: typography.bodySmall }}>₹{subtotal}</Text>
            </View>
            {discount > 0 && (
              <View className="flex-row justify-between mb-1.5">
                <Text className="text-green-600" style={{ fontSize: typography.bodySmall }}>Discount</Text>
                <Text className="text-green-600 font-medium" style={{ fontSize: typography.bodySmall }}>-₹{discount}</Text>
              </View>
            )}
            <View className="flex-row justify-between">
              <Text className="font-bold text-gray-900" style={{ fontSize: typography.body }}>Total</Text>
              <Text className="font-bold text-pink-500" style={{ fontSize: typography.body }}>₹{booking.finalAmount}</Text>
            </View>
          </View>

          <View className="flex gap-3 border-t border-gray-100 mt-3 pt-3 space-y-3.5">
            <View className="flex-row items-center">
              <Calendar size={15} color={colors.textTertiary} />
              <Text className="text-gray-700 ml-2.5" style={{ fontSize: typography.bodySmall }}>
                {booking.scheduledDate} · {booking.scheduledTime}
              </Text>
            </View>
            <View className="flex-row items-start">
              <MapPin size={15} color={colors.textTertiary} className="mt-0.5" />
              <View className="flex-1 ml-2.5">
                {!!booking.address?.label && (
                  <Text className="text-gray-800 font-semibold" style={{ fontSize: typography.bodySmall }}>
                    {booking.address.label}
                  </Text>
                )}
                <Text className="text-gray-600 leading-5" style={{ fontSize: typography.bodySmall }}>
                  {booking.address?.fullAddress || 'Address not available'}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <CreditCard size={15} color={colors.textTertiary} />
              <Text className="text-gray-700 ml-2.5" style={{ fontSize: typography.bodySmall }}>
                {booking.paymentMethod} · {booking.paymentStatus}
              </Text>
            </View>
            <Text className="text-gray-400" style={{ fontSize: typography.tiny }}>
              Booking ID · {booking.id}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View className="mt-4 mx-4 bg-white rounded-2xl p-4" style={shadows.sm}>
          <Text className="text-gray-900 font-bold mb-4" style={{ fontSize: typography.bodySmall }}>
            Booking Timeline
          </Text>
          {booking.statusTimeline?.length ? (
            <Timeline steps={booking.statusTimeline} allStatuses={BOOKING_STATUS_FLOW} />
          ) : (
            <Text className="text-gray-400" style={{ fontSize: typography.caption }}>
              No timeline updates yet.
            </Text>
          )}
        </View>

        {/* Rate partner */}
        {showRate && (
          <TouchableOpacity
            onPress={() => setReviewTarget(booking)}
            className="mt-4 mx-4 flex-row items-center justify-center rounded-2xl py-3.5 border border-pink-200 bg-pink-50"
            activeOpacity={0.8}
          >
            <Star size={16} color={colors.accent} fill={colors.accent} />
            <Text className="text-pink-600 font-semibold ml-2" style={{ fontSize: typography.bodySmall }}>
              Rate your partner
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <RatePartnerModal
        booking={reviewTarget}
        visible={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
      />
    </View>
  )
}
