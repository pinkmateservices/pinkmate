import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, borderRadius, typography, shadows } from "../../config/theme";
import { Star, Clock } from "lucide-react-native";
import { Service } from "../../types";
import { FavoriteButton } from "../ui/FavoriteButton";
import { Skeleton } from "../ui/Skeleton";
import { Button } from "./Button";

const { width } = Dimensions.get("window");
const GRID_CARD_WIDTH = (width - 48) / 2;
const H_CARD_WIDTH = width * 0.58;

interface ServiceCardProps {
  service: Service;
  onPress: () => void;
  onBookNow?: () => void;
  index?: number;
  horizontal?: boolean;
}

function RatingRow({ service }: { service: Service }) {
  return (
    <View style={styles.ratingRow}>
      <Star size={12} color={colors.accent} fill={colors.accent} />
      <Text style={styles.ratingText}>{service.rating?.toFixed(1) ?? "—"}</Text>
      {!!service.reviewCount && (
        <Text style={styles.reviewText}>
          (
          {service.reviewCount >= 1000
            ? `${(service.reviewCount / 1000).toFixed(1)}k`
            : service.reviewCount}
          )
        </Text>
      )}
      <View style={styles.dot} />
      <Clock size={11} color={colors.textTertiary} />
      <Text style={styles.durationText}>{service.duration} min</Text>
    </View>
  );
}

// ── Grid card (2-col layout) ──────────────────────────────────
export const ServiceCard = ({
  service,
  onPress,
  index = 0,
  horizontal,
}: ServiceCardProps) => {
  const price =
    service.discountPrice && service.discountPrice < service.basePrice
      ? service.discountPrice
      : service.basePrice;
  const hasDiscount =
    service.discountPrice && service.discountPrice < service.basePrice;
  const discountPct = hasDiscount
    ? Math.round(
        ((service.basePrice - service.discountPrice!) / service.basePrice) *
          100,
      )
    : 0;

  const Container = horizontal ? View : Animated.View;
  const animProps = horizontal
    ? {}
    : { entering: FadeInDown.delay(index * 80).duration(400) };

  return (
    <Container {...animProps}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.88}
        style={[styles.gridCard, shadows.md]}
      >
        {/* Image */}
        <View style={styles.gridImageContainer}>
          <Image
            source={{ uri: service.thumbnail }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.55)"]}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Top row badges */}
          <View style={styles.topRow}>
            {service.serviceType ? (
              <View style={styles.typePill}>
                <Text style={styles.typePillText}>{service.serviceType}</Text>
              </View>
            ) : (
              <View />
            )}
            <FavoriteButton serviceId={service.id} />
          </View>
          {/* Discount badge */}
          {discountPct > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPct}% off</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.gridContent}>
          <Text style={styles.name} numberOfLines={1}>
            {service.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{price}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>₹{service.basePrice}</Text>
            )}
          </View>
          <RatingRow service={service} />
        </View>
      </TouchableOpacity>
    </Container>
  );
};

// ── Horizontal card (home screen sections) ────────────────────
export const ServiceCardHorizontal = ({
  service,
  onPress,
  onBookNow,
}: {
  service: Service;
  onPress: () => void;
  onBookNow?: () => void;
}) => {
  const price =
    service.discountPrice && service.discountPrice < service.basePrice
      ? service.discountPrice
      : service.basePrice;
  const hasDiscount =
    service.discountPrice && service.discountPrice < service.basePrice;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[styles.hCard, shadows.md]}
    >
      <View style={styles.hImageContainer}>
        <Image
          source={{ uri: service.thumbnail }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.45)"]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.hTopRow}>
          {/* {service.serviceType ? (
            <View style={styles.typePill}>
              <Text style={styles.typePillText}>{service.serviceType}</Text>
            </View>
          ) : <View />} */}
          <FavoriteButton serviceId={service.id} />
        </View>
      </View>

      <View style={styles.hContent}>
        <Text style={styles.name} numberOfLines={1}>
          {service.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{price}</Text>
          {hasDiscount && (
            <Text style={styles.originalPrice}>₹{service.basePrice}</Text>
          )}
        </View>
        <RatingRow service={service} />
      </View>
      <View className="px-2 pb-2">
        <Button size="sm" title="Book Now" onPress={onBookNow ?? onPress} />
      </View>
    </TouchableOpacity>
  );
};

// ── Skeleton ──────────────────────────────────────────────────
export const ServiceCardSkeleton = () => (
  <View style={[styles.gridCard, shadows.sm]}>
    <Skeleton height={GRID_CARD_WIDTH * 0.85} />
    <View style={{ padding: 10, gap: 6 }}>
      <Skeleton width="75%" height={14} />
      <Skeleton width="45%" height={14} />
      <Skeleton width="60%" height={11} borderRadiusVal={borderRadius.sm} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  // Grid card
  gridCard: {
    width: GRID_CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
  },
  gridImageContainer: {
    width: GRID_CARD_WIDTH,
    height: GRID_CARD_WIDTH * 0.85,
  },
  gridContent: {
    padding: 10,
    gap: 3,
  },

  // Horizontal card
  hCard: {
    width: H_CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    marginRight: 12,
  },
  hImageContainer: {
    width: H_CARD_WIDTH,
    height: H_CARD_WIDTH * 0.65,
  },
  hContent: {
    padding: 10,
    gap: 3,
  },
  hTopRow: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Shared
  topRow: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typePill: {
    backgroundColor: "rgba(236,72,153,0.85)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  typePillText: {
    color: colors.white,
    fontSize: typography.tiny,
    fontWeight: "600",
  },
  discountBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: colors.success,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  discountText: {
    color: colors.white,
    fontSize: typography.tiny,
    fontWeight: "700",
  },
  name: {
    fontSize: typography.bodySmall,
    fontWeight: "700",
    color: colors.text,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
  },
  price: {
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.primary,
  },
  originalPrice: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    textDecorationLine: "line-through",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 1,
  },
  ratingText: {
    fontSize: typography.caption,
    fontWeight: "600",
    color: colors.text,
  },
  reviewText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.textTertiary,
    marginHorizontal: 2,
  },
  durationText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
});
