import { Tabs } from "expo-router";
import { colors, typography } from "../../src/config/theme";
import { Home, Calendar, Heart, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useAuthStore } from "@/src/store";
import { getCurrentCoordinates } from "@/src/hooks/useLocation";
import { updateUserProfile } from "@/src/services/auth";

async function reverseGeocode(lat: number, lng: number): Promise<{ city?: string; state?: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'User-Agent': 'PinkmateApp/1.0' } }
    )
    const json = await res.json()
    const addr = json.address ?? {}
    return {
      city: addr.city || addr.town || addr.village || addr.county,
      state: addr.state,
    }
  } catch {
    return {}
  }
}

export default function TabLayout() {
  const [isFetchingLocation, setIsFetchingLocation] = useState(true)
  const { isAuthenticated, user, setUser } = useAuthStore()

  useEffect(() => {
    async function fetchAndUpdateLocation() {
      // Guests or unauthenticated skip location fetch
      if (!isAuthenticated || !user) {
        setIsFetchingLocation(false)
        return
      }

      try {
        const coords = await getCurrentCoordinates()
        if (!coords) {
          setIsFetchingLocation(false)
          return
        }

        // Reverse geocode to get human-readable city/state
        const { city, state } = await reverseGeocode(coords.latitude, coords.longitude)

        // Update Firebase + local store — only overwrite if we got a value
        const updates: Record<string, any> = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          locationUpdatedAt: Date.now(),
        }
        if (city) updates.city = city
        if (state) updates.state = state
        await updateUserProfile(user.id, updates)
        setUser({ ...user, ...updates })
      } catch {
        // Location is best-effort, never block the user
      } finally {
        setIsFetchingLocation(false)
      }
    }

    fetchAndUpdateLocation()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (isFetchingLocation) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        className="flex-1 bg-white items-center justify-center gap-4"
      >
        <View className="w-20 h-20 rounded-2xl bg-pink-100 items-center justify-center mb-2">
          <Image
            source={require('../../assets/images/logo.png')}
            style={{ width: 80, height: 80 }}
            contentFit="contain"
          />
        </View>
        <Text className="text-gray-900 font-bold" style={{ fontSize: typography.h4 }}>
          Just a moment...
        </Text>
        <Text className="text-gray-400 text-center px-10" style={{ fontSize: typography.bodySmall }}>
          Finding services near you
        </Text>
        <View className="flex-row gap-1.5 mt-2">
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              className="w-2 h-2 rounded-full bg-primary opacity-60"
              style={{ opacity: 0.3 + i * 0.35 }}
            />
          ))}
        </View>
      </Animated.View>
    )
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
