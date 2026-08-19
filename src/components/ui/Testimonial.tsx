import { colors, typography } from "@/src/config/theme";
import { Testimonial } from "@/src/types";
import { Image } from "expo-image";
import { Star } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
const { width } = Dimensions.get("window");

export default function TestimonialsSection({
  TESTIMONIALS,
}: {
  TESTIMONIALS: Testimonial[];
}) {
  const flatRef = useRef<FlatList>(null);
  const currentIndex = useRef(0);
  const CARD_W = width * 0.72;

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 18,
      marginRight: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 8,
      elevation: 3,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
  });

  useEffect(() => {
    if (!TESTIMONIALS.length) return;
    const interval = setInterval(() => {
      currentIndex.current = (currentIndex.current + 1) % TESTIMONIALS.length;
      flatRef.current?.scrollToIndex({
        index: currentIndex.current,
        animated: true,
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [TESTIMONIALS.length]);

  if (!TESTIMONIALS.length) return null;

  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        className="text-gray-900 font-semibold px-6 mb-4"
        style={{ fontSize: typography.h4 }}
      >
        What our customers say
      </Text>
      <FlatList
        className="pb-2"
        ref={flatRef}
        data={TESTIMONIALS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
        snapToInterval={CARD_W + 12}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          currentIndex.current = Math.round(
            e.nativeEvent.contentOffset.x / (CARD_W + 12),
          );
        }}
        getItemLayout={(_, index) => ({
          length: CARD_W + 12,
          offset: (CARD_W + 12) * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={[styles.card, { width: CARD_W }]}>
            {/* Quote mark */}
            <Text
              style={{
                fontSize: 36,
                color: colors.primaryLight,
                lineHeight: 36,
                marginBottom: 4,
              }}
            >
              {'\u201C'}
            </Text>
            <Text
              className="text-gray-600 leading-5"
              style={{ fontSize: typography.bodySmall }}
              numberOfLines={4}
            >
              {item.text}
            </Text>
            {/* Stars */}
            <View className="flex-row my-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  color={colors.accent}
                  fill={i < item.rating ? colors.accent : "transparent"}
                />
              ))}
            </View>
            {/* Author */}
            <View className="flex-row items-center">
              {item.avatar ? (
                <Image
                  source={{ uri: item.avatar }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <View className="w-10 h-10 rounded-full bg-pink-100 items-center justify-center">
                  <Text className="text-pink-600 font-bold" style={{ fontSize: typography.bodySmall }}>
                    {item.name?.charAt(0).toUpperCase() ?? 'P'}
                  </Text>
                </View>
              )}
              <View className="ml-3">
                <Text
                  className="font-semibold text-gray-900"
                  style={{ fontSize: typography.bodySmall }}
                >
                  {item.name}
                </Text>
                <Text
                  className="text-gray-400"
                  style={{ fontSize: typography.tiny }}
                >
                  {item.location}
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}
