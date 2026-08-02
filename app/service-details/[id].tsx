import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import { useRouter, useLocalSearchParams, Stack } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useMemo } from "react"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"
import { colors, typography, shadows, borderRadius } from "../../src/config/theme"
import { useService, useServices } from "../../src/hooks"
import { useBookingStore } from "../../src/store"
import { FavoriteButton, Skeleton } from "../../src/components/ui"
import { ServiceCardHorizontal } from "../../src/components/ui/ServiceCard"
import { ArrowLeft, Clock, MapPin, Star, CheckCircle, XCircle, ShoppingBag, Plus, Minus } from "lucide-react-native"

export default function ServiceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { data: service, isLoading } = useService(id!)
  const { addItem, removeItem, items } = useBookingStore()

  const { data: allServices } = useServices()
  const relatedServices = useMemo(() => {
    if (!allServices || !service) return []
    return allServices
      .filter((s) => s.categoryId === service.categoryId && s.id !== service.id && s.status === "Active")
      .slice(0, 6)
  }, [allServices, service])

  const cartItem = items.find((i) => i.serviceId === id)
  const qty = cartItem?.quantity ?? 0

  const price = service?.discountPrice && service.discountPrice < service.basePrice
    ? service.discountPrice : service?.basePrice ?? 0
  const hasDiscount = service?.discountPrice && service.discountPrice < service.basePrice
  const discountPct = hasDiscount
    ? Math.round(((service!.basePrice - service!.discountPrice!) / service!.basePrice) * 100)
    : 0

  // ── Loading ──────────────────────────────────────────────────
  if (isLoading || !service) {
    return (
      <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Skeleton height={340} />
        <View className="p-6 gap-3">
          <Skeleton width="70%" height={26} />
          <Skeleton width="40%" height={20} />
          <Skeleton width="100%" height={14} />
          <Skeleton width="100%" height={14} />
          <Skeleton width="80%" height={14} />
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── Hero ── */}
        <View style={{ height: 340 }}>
          <Image
            source={{ uri: service.thumbnail }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            transition={400}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.35)', 'transparent', 'rgba(0,0,0,0.6)']}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Top buttons */}
          <View style={[styles.topBar, { top: insets.top + 12 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
              <ArrowLeft size={20} color={colors.white} />
            </TouchableOpacity>
            <FavoriteButton serviceId={service.id} size={22} />
          </View>

          {/* Bottom overlay info */}
          <Animated.View entering={FadeInUp.duration(500)} style={styles.heroBottom}>
            <View className="flex-row gap-2 flex-wrap mb-2">
              {discountPct > 0 && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{discountPct}% OFF</Text>
                </View>
              )}
              <View style={[styles.pill, { backgroundColor: 'rgba(59,130,246,0.85)' }]}>
                <Text style={styles.pillText}>{service.serviceType}</Text>
              </View>
            </View>
            <Text style={styles.heroTitle} numberOfLines={2}>{service.name}</Text>
          </Animated.View>
        </View>

        {/* ── Price + info strip ── */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.priceStrip}>
          <View>
            <View className="flex-row items-baseline gap-2">
              <Text style={styles.price}>₹{price}</Text>
              {hasDiscount && (
                <Text style={styles.originalPrice}>₹{service.basePrice}</Text>
              )}
            </View>
            <Text style={styles.perSession}>per session</Text>
          </View>

          <View className="flex-row gap-4">
            <View className="items-center">
              <Clock size={16} color={colors.primary} />
              <Text style={styles.chipLabel}>{service.duration} min</Text>
            </View>
            <View className="items-center">
              <MapPin size={16} color={colors.primary} />
              <Text style={styles.chipLabel}>At Home</Text>
            </View>
            {service.rating && (
              <View className="items-center">
                <Star size={16} color={colors.accent} fill={colors.accent} />
                <Text style={styles.chipLabel}>{service.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* ── Description ── */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.card}>
          <Text style={styles.sectionTitle}>About this service</Text>
          <Text style={styles.bodyText}>
            {service.fullDescription || service.shortDescription}
          </Text>
        </Animated.View>

        {/* ── Included ── */}
        {service.includedItems && service.includedItems.length > 0 && (
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.card}>
            <Text style={styles.sectionTitle}>{"What's included"}</Text>
            {service.includedItems.map((item, i) => (
              <View key={i} style={styles.listRow}>
                <CheckCircle size={16} color={colors.success} />
                <Text style={[styles.bodyText, { flex: 1, marginLeft: 10, marginBottom: 0 }]}>{item}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* ── Excluded ── */}
        {service.excludedItems && service.excludedItems.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.card}>
            <Text style={styles.sectionTitle}>{"What's not included"}</Text>
            {service.excludedItems.map((item, i) => (
              <View key={i} style={styles.listRow}>
                <XCircle size={16} color={colors.error} />
                <Text style={[styles.bodyText, { flex: 1, marginLeft: 10, marginBottom: 0 }]}>{item}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* ── Related ── */}
        {relatedServices.length > 0 && (
          <Animated.View entering={FadeInDown.delay(250).duration(400)} style={{ marginTop: 12 }}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: 20, marginBottom: 12 }]}>
              Related Services
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20 }}>
              {relatedServices.map((s) => (
                <ServiceCardHorizontal
                  key={s.id}
                  service={s}
                  onPress={() => router.replace(`/service-details/${s.id}`)}
                />
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </ScrollView>

      {/* ── Sticky bottom bar ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={styles.bottomPrice}>₹{price}</Text>
          {hasDiscount && (
            <Text style={styles.bottomSaved}>Save ₹{service.basePrice - price}</Text>
          )}
        </View>

        {qty === 0 ? (
          <TouchableOpacity
            onPress={() => addItem(service)}
            activeOpacity={0.85}
            style={styles.bookBtn}
          >
            <ShoppingBag size={18} color={colors.white} />
            <Text style={styles.bookBtnText}>Book Now</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.qtyRow}>
            <TouchableOpacity
              onPress={() => removeItem(service.id)}
              style={styles.qtyBtn}
              activeOpacity={0.8}
            >
              <Minus size={16} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{qty}</Text>
            <TouchableOpacity
              onPress={() => addItem(service)}
              style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <Plus size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroTitle: {
    fontSize: typography.h2,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 32,
  },
  pill: {
    backgroundColor: 'rgba(236,72,153,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  pillText: {
    color: colors.white,
    fontSize: typography.tiny,
    fontWeight: '700',
  },
  priceStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: borderRadius.xl,
    padding: 16,
    ...shadows.md,
  },
  price: {
    fontSize: typography.h2,
    fontWeight: '800',
    color: colors.primary,
  },
  originalPrice: {
    fontSize: typography.body,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  perSession: {
    fontSize: typography.tiny,
    color: colors.textTertiary,
    marginTop: 2,
  },
  chipLabel: {
    fontSize: typography.tiny,
    color: colors.textSecondary,
    marginTop: 3,
  },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: borderRadius.xl,
    padding: 18,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 4,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    ...shadows.xl,
  },
  bottomPrice: {
    fontSize: typography.h3,
    fontWeight: '800',
    color: colors.text,
  },
  bottomSaved: {
    fontSize: typography.tiny,
    color: colors.success,
    fontWeight: '600',
    marginTop: 2,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  bookBtnText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '700',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: colors.text,
    minWidth: 32,
    textAlign: 'center',
  },
})
