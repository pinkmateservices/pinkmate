import { View, Dimensions, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeInRight } from "react-native-reanimated";
import { borderRadius, shadows } from "../../config/theme";
import { Banner } from "../../types";
import { Skeleton } from "../ui";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Carousel } from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");
const BANNER_WIDTH = width - 32;

interface BannerCarouselProps {
  banners: Banner[];
}

export const BannerCarousel = ({ banners }: BannerCarouselProps) => {
  // TODO : Add logic to redirect if there is some link in banner
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Carousel
          style={{ width, height: 200 }}
          data={banners}
          autoplay
          autoplayInterval={3000}
          loop
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInRight.delay(index * 100).duration(500)}
              style={{ flex: 1, alignItems: "center" }}
            >
              <View
                className="rounded-xl overflow-hidden"
                style={{ width: BANNER_WIDTH, height: 180, ...shadows.md }}
              >
                <Image
                  source={{ uri: item.image }}
                  style={StyleSheet.absoluteFillObject}
                  contentFit="cover"
                  transition={500}
                />
                {/* <LinearGradient
                  colors={["rgba(0,0,0,0.45)", "transparent"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[StyleSheet.absoluteFillObject, { justifyContent: "center", paddingHorizontal: 24 }]}
                >
                  <Text className="text-white font-bold" style={{ fontSize: typography.h3 }}>
                    {item.title}
                  </Text>
                  {item.subtitle && (
                    <Text className="text-white/80 mt-1" style={{ fontSize: typography.bodySmall }}>
                      {item.subtitle}
                    </Text>
                  )}
                </LinearGradient> */}
              </View>
            </Animated.View>
          )}
        />
      </View>
    </GestureHandlerRootView>
  );
};

export const BannerCarouselSkeleton = () => (
  <View className="px-4 mb-4">
    <Skeleton height={180} borderRadiusVal={borderRadius.lg} />
  </View>
);
