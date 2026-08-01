import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, typography } from "../../src/config/theme";
import { useAuthStore } from "../../src/store";
import {
  useCategories,
  useBanners,
  useServices,
  useFavorites,
} from "../../src/hooks";
import {
  SearchBar,
  CategoryCard,
  ServiceCardHorizontal,
  Skeleton,
  EmptyState,
} from "../../src/components/ui";
import {
  BannerCarousel,
  BannerCarouselSkeleton,
} from "../../src/components/ui/BannerCarousel";
import { useState, useCallback, useMemo } from "react";
import {
  MapPin,
  Sparkles,
  ChevronRight,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: banners, isLoading: bannerLoading } = useBanners();
  const { data: allServices, isLoading: servicesLoading } = useServices();

  useFavorites();

  const featuredCategories = useMemo(
    () => categories?.filter((c) => c.featured && c.status === "Active") || [],
    [categories],
  );

  const popularServices = useMemo(
    () => allServices?.filter((s) => s.status === "Active").slice(0, 6) || [],
    [allServices],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshing(false);
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center">
              <MapPin size={16} color={colors.primary} />
              <Text
                className="text-gray-500 ml-1.5"
                style={{ fontSize: typography.caption }}
              >
                {user?.city || "Current Location"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/profile')}
              activeOpacity={0.8}
              className="w-10 h-10 rounded-full bg-pink-100 items-center justify-center overflow-hidden"
            >
              {user?.photoURL ? (
                <Image
                  source={{ uri: user.photoURL }}
                  style={{ width: 40, height: 40 }}
                  contentFit="cover"
                />
              ) : (
                <Text className="text-primary font-bold" style={{ fontSize: typography.body }}>
                  {user?.fullName?.charAt(0).toUpperCase() || '?'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <Text
            className="text-gray-900 font-bold"
            style={{ fontSize: typography.h1 }}
          >
            {greeting()},
          </Text>
          <Text
            className="text-gray-900 font-bold"
            style={{ fontSize: typography.h1 }}
          >
            {user?.fullName?.split(" ")[0] || "There"}
          </Text>
        </View>

        <View className="px-6 py-4">
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search for beauty services..."
          />
        </View>

        {bannerLoading ? (
          <BannerCarouselSkeleton />
        ) : banners && banners.filter((b) => b.active).length > 0 ? (
          <View className="mb-6">
            <BannerCarousel banners={banners.filter((b) => b.active)} />
          </View>
        ) : null}

        {catLoading ? (
          <View className="px-6 mb-6">
            <View className="flex-row justify-between mb-4">
              <Skeleton width={140} height={22} />
            </View>
            <View className="flex-row">
              {[1, 2, 3, 4].map((i) => (
                <View key={i} className="items-center mr-5">
                  <Skeleton width={64} height={64} borderRadiusVal={16} />
                  <Skeleton width={50} height={12} className="mt-2" />
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View className="mb-6">
            <View className="flex-row items-center justify-between px-6 mb-4">
              <Text
                className="text-gray-900 font-semibold ml-2"
                style={{ fontSize: typography.h4 }}
              >
                Popular Categories
              </Text>
              <View className="flex-row items-center">
                <Text
                  className="text-pink-500 font-medium"
                  style={{ fontSize: typography.caption }}
                  onPress={() => router.push("/category")}
                >
                  View All
                </Text>
                <ChevronRight size={14} color={colors.primary} />
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="pl-6"
            >
              {featuredCategories.slice(0, 6).map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  variant="horizontal"
                  onPress={() => router.push(`/category/${cat.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {servicesLoading ? (
          <View className="px-6 mb-6">
            <Skeleton width={160} height={22} className="mb-4" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[1, 2, 3].map((i) => (
                <View key={i} className="mr-3">
                  <Skeleton
                    width={width * 0.55}
                    height={180}
                    borderRadiusVal={16}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        ) : (
          <>
            {popularServices.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center justify-between px-6 mb-4">
                  <View className="flex-row items-center">
                    <Text
                      className="text-gray-900 font-semibold ml-2"
                      style={{ fontSize: typography.h4 }}
                    >
                      Popular Services
                    </Text>
                  </View>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="pl-6"
                >
                  {popularServices
                    .filter((service) => service.featured)
                    .map((service) => (
                      <ServiceCardHorizontal
                        key={service.id}
                        service={service}
                        onPress={() =>
                          router.push(`/service-details/${service.id}`)
                        }
                      />
                    ))}
                </ScrollView>
              </View>
            )}
          </>
        )}

        {!catLoading &&
          !servicesLoading &&
          featuredCategories.length === 0 &&
          popularServices.length === 0 && (
            <EmptyState
              icon={<Sparkles size={48} color={colors.primary} />}
              title="Welcome to Pinkmate!"
              description="Beauty services will appear here once they are added by the admin."
            />
          )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
