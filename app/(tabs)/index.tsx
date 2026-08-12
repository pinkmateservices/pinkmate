import {
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, typography } from "../../src/config/theme";
import { useAuthStore, useBookingStore } from "../../src/store";
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
  CartBar,
  CartIcon,
} from "../../src/components/ui";
import {
  BannerCarousel,
  BannerCarouselSkeleton,
} from "../../src/components/ui/BannerCarousel";
import { useState, useCallback, useMemo } from "react";
import { MapPin, Sparkles, ChevronRight } from "lucide-react-native";
import TestimonialsSection from "@/src/components/ui/Testimonial";
import { Testimonial } from "@/src/types";
import LocationPickerModal from "@/src/components/ui/LocationPickerModal";
import { updateUserProfile } from "@/src/services/auth";

const { width } = Dimensions.get("window");

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "Absolutely loved the facial service! The beautician was professional and my skin felt amazing after. Will definitely book again.",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: "2",
    name: "Ananya Gupta",
    location: "Delhi",
    rating: 5,
    text: "Super convenient! Got a full body wax done at home. The hygiene was top-notch and the staff was very friendly.",
    avatar: "https://i.pravatar.cc/150?img=48",
  },
  {
    id: "3",
    name: "Sneha Patel",
    location: "Bangalore",
    rating: 4,
    text: "Great experience with the hair styling service. The stylist really understood what I wanted. Pricing is very reasonable.",
    avatar: "https://i.pravatar.cc/150?img=44",
  },
  {
    id: "4",
    name: "Riya Mehta",
    location: "Pune",
    rating: 5,
    text: "Pinkmate is my go-to app for all beauty needs. The nail art service was stunning — exactly what I had in mind!",
    avatar: "https://i.pravatar.cc/150?img=45",
  },
  {
    id: "5",
    name: "Kavya Nair",
    location: "Chennai",
    rating: 5,
    text: "Booked a bridal makeup package and it was perfect. The artist was on time and did an incredible job. Highly recommend!",
    avatar: "https://i.pravatar.cc/150?img=46",
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const setUser = useAuthStore((s) => s.setUser);
  const addItem = useBookingStore((s) => s.addItem);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [locationModalVisible, setLocationModalVisible] = useState(false);

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

  const handleLocationConfirm = useCallback(
    async (location: { latitude: number; longitude: number; address: string; city?: string; state?: string }) => {
      if (!user) return;
      const updates = {
        latitude: location.latitude,
        longitude: location.longitude,
        locationUpdatedAt: Date.now(),
        ...(location.city && { city: location.city }),
        ...(location.state && { state: location.state }),
        address: {
          city: location.city ?? "",
          state: location.state ?? "",
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          type: "default" as const,
          updatedAt: Date.now(),
        },
      };
      await updateUserProfile(user.id, updates);
      setUser({ ...user, ...updates });
      setLocationModalVisible(false);
    },
    [user, setUser],
  );

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
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => !isGuest && setLocationModalVisible(true)}
              activeOpacity={isGuest ? 1 : 0.7}
            >
              <MapPin size={16} color={colors.primary} />
              <Text
                className="text-gray-500 ml-1.5"
                style={{ fontSize: typography.caption }}
              >
                {user?.city || "Current Location"}
              </Text>
            </TouchableOpacity>
          <View className="flex-row items-center gap-3">
              <CartIcon />
              <TouchableOpacity
                onPress={() => router.push("/profile")}
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
                  <Text
                    className="text-primary font-bold"
                    style={{ fontSize: typography.body }}
                  >
                    {isGuest
                      ? "G"
                      : user?.fullName?.charAt(0).toUpperCase() || "?"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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
            {isGuest ? "Guest" : user?.fullName?.split(" ")[0] || "There"}
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
            <FlatList
              data={featuredCategories.slice(0, 6)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
              renderItem={({ item }) => (
                <CategoryCard
                  category={item}
                  variant="horizontal"
                  onPress={() => router.push(`/category/${item.id}`)}
                />
              )}
            />
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
                <FlatList
                  className={`${Platform.OS === "android" && "py-2"}`}
                  data={popularServices.filter((service) => service.featured)}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
                  renderItem={({ item }) => (
                    <ServiceCardHorizontal
                      service={item}
                      onPress={() => router.push(`/service-details/${item.id}`)}
                      onBookNow={() => {
                        addItem(item);
                        router.push("/booking");
                      }}
                    />
                  )}
                />
              </View>
            )}
          </>
        )}

        {/* Testimonials */}
        <TestimonialsSection TESTIMONIALS={TESTIMONIALS} />

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

        {/* Footer */}
        <View className="items-center py-4">
          <Text className="text-gray-400" style={{ fontSize: typography.caption }}>
            Made with <Text className="text-primary">♥</Text> by Team Pinkmate
          </Text>
        </View>
      </ScrollView>

      <LocationPickerModal
        visible={locationModalVisible}
        initialLatitude={user?.latitude}
        initialLongitude={user?.longitude}
        onConfirm={handleLocationConfirm}
        onClose={() => setLocationModalVisible(false)}
      />

      <CartBar />
    </View>
  );
}
