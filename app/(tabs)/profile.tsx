import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, typography, shadows } from '../../src/config/theme'
import { useAuthStore } from '../../src/store'
import {
  User, MapPin, Heart, Bell, Shield, FileText, LogOut, ChevronRight,
  Star, Package, HelpCircle, LogIn, UserPlus, Camera, X, Check,
} from 'lucide-react-native'
import { Image } from 'expo-image'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { updateUserProfile, uploadProfilePhoto } from '../../src/services/auth'
import { LocationPicker } from '../../src/components/ui'
import { useIndiaStates, useIndiaCities } from '../../src/hooks/useLocation'

const menuItems = [
  { icon: Package, label: 'Booking History', screen: '/orders', color: '#8B5CF6' },
  { icon: Heart, label: 'Favorites', screen: '/profile/favorites', color: '#EC4899' },
  { icon: Bell, label: 'Notifications', screen: '/profile/notifications', color: '#F59E0B' },
  { icon: MapPin, label: 'Saved Addresses', screen: '/profile/addresses', color: '#3B82F6' },
  { icon: HelpCircle, label: 'Help & Support', screen: '/profile/support', color: '#10B981' },
  { icon: Shield, label: 'Privacy Policy', screen: '/profile/privacy', color: '#6B7280' },
  { icon: FileText, label: 'Terms & Conditions', screen: '/profile/terms', color: '#6B7280' },
]

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { user, logout, isGuest, setUser } = useAuthStore()
  const [refreshing, setRefreshing] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    gender: '',
    city: '',
    state: '',
  })
  const [stateIso2, setStateIso2] = useState('')
  const { states, loading: statesLoading } = useIndiaStates()
  const { cities, loading: citiesLoading } = useIndiaCities(stateIso2)

  function openEdit() {
    setForm({
      fullName: user?.fullName ?? '',
      phoneNumber: user?.phoneNumber ?? '',
      gender: user?.gender ?? '',
      city: user?.city ?? '',
      state: user?.state ?? '',
    })
    setStateIso2('')
    setEditVisible(true)
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    try {
      await updateUserProfile(user.id, form)
      setUser({ ...user, ...form })
      setEditVisible(false)
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePickPhoto() {
    if (!user) return
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (result.canceled) return
    setPhotoUploading(true)
    try {
      const url = await uploadProfilePhoto(user.id, result.assets[0].uri)
      setUser({ ...user, photoURL: url })
    } catch (err) {
      Alert.alert('Error', 'Failed to upload photo.')
      console.log(err)
    } finally {
      setPhotoUploading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/(auth)/login')
  }

  const onRefresh = async () => {
    setRefreshing(true)
    setRefreshing(false)
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="px-6 pt-4 pb-6">
          <Text className="text-gray-900 font-bold" style={{ fontSize: typography.h1 }}>Profile</Text>
        </View>

        <Animated.View entering={FadeInDown.duration(400)} className="mx-4 mb-6">
          {isGuest ? (
            <View className="bg-white rounded-xl p-6 items-center" style={shadows.md}>
              <View className="w-20 h-20 rounded-full bg-pink-50 items-center justify-center mb-4">
                <User size={36} color={colors.primary} />
              </View>
              <Text className="text-gray-900 font-bold text-center mb-1" style={{ fontSize: typography.h4 }}>
                {"You're browsing as a guest"}
              </Text>
              <Text className="text-gray-500 text-center mb-5" style={{ fontSize: typography.bodySmall }}>
                Sign in to book services, save favorites, and manage your orders.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/login')}
                className="bg-primary w-full py-3 rounded-xl items-center mb-3"
              >
                <View className="flex-row items-center gap-2">
                  <LogIn size={18} color={colors.white} />
                  <Text className="text-white font-semibold" style={{ fontSize: typography.body }}>Sign In</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/register')}
                className="border-2 border-primary w-full py-3 rounded-xl items-center"
              >
                <View className="flex-row items-center gap-2">
                  <UserPlus size={18} color={colors.primary} />
                  <Text className="text-primary font-semibold" style={{ fontSize: typography.body }}>Create Account</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={openEdit}
              activeOpacity={0.7}
              className="bg-white rounded-xl p-5 flex-row items-center"
              style={shadows.md}
            >
              <View className="w-16 h-16 rounded-full bg-pink-100 items-center justify-center overflow-hidden">
                {user?.photoURL ? (
                  <Image source={{ uri: user.photoURL }} style={{ width: 64, height: 64 }} contentFit="cover" />
                ) : (
                  <User size={28} color={colors.primary} />
                )}
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-gray-900 font-semibold" style={{ fontSize: typography.h4 }}>
                  {user?.fullName || 'User'}
                </Text>
                <Text className="text-gray-500 mt-0.5" style={{ fontSize: typography.bodySmall }}>
                  {user?.email || ''}
                </Text>
                <View className="flex-row items-center mt-1.5">
                  <Star size={14} color={colors.accent} fill={colors.accent} />
                  <Text className="text-gray-500 ml-1.5" style={{ fontSize: typography.caption }}>
                    {user?.totalBookings || 0} bookings
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </Animated.View>

        {!isGuest && (
          <View className="mx-4">
            {menuItems.map((item, index) => (
              <Animated.View
                key={item.label}
                entering={FadeInDown.delay(index * 50).duration(400)}
              >
                <TouchableOpacity
                  onPress={() => router.push(item.screen as any)}
                  activeOpacity={0.7}
                  className="bg-white rounded-xl p-4 flex-row items-center mb-2.5"
                  style={shadows.sm}
                >
                  <View className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                    <item.icon size={20} color={item.color} />
                  </View>
                  <Text className="flex-1 text-gray-900 ml-3 font-medium" style={{ fontSize: typography.body }}>
                    {item.label}
                  </Text>
                  <ChevronRight size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}

        {!isGuest && (
          <Animated.View entering={FadeInDown.delay(400).duration(400)} className="mx-4 mt-4 mb-8">
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-white rounded-xl p-4 flex-row items-center justify-center"
              style={shadows.sm}
            >
              <LogOut size={20} color={colors.error} />
              <Text className="text-red-500 font-semibold ml-2" style={{ fontSize: typography.body }}>
                Logout
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditVisible(false)}>
        <View className="flex-1 bg-gray-50">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-5 pb-4 bg-white border-b border-gray-100">
            <TouchableOpacity onPress={() => setEditVisible(false)} className="w-9 h-9 items-center justify-center rounded-full bg-gray-100">
              <X size={18} color={colors.text} />
            </TouchableOpacity>
            <Text className="font-bold text-gray-900" style={{ fontSize: typography.h4 }}>Edit Profile</Text>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="w-9 h-9 items-center justify-center rounded-full bg-primary"
            >
              {saving
                ? <ActivityIndicator size="small" color={colors.white} />
                : <Check size={18} color={colors.white} />}
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 16 }}>
            {/* Avatar */}
            <View className="items-center mb-2">
              <View className="relative">
                <View className="w-24 h-24 rounded-full bg-pink-100 overflow-hidden items-center justify-center">
                  {user?.photoURL
                    ? <Image source={{ uri: user.photoURL }} style={{ width: 96, height: 96 }} contentFit="cover" />
                    : <User size={36} color={colors.primary} />}
                </View>
                <TouchableOpacity
                  onPress={handlePickPhoto}
                  disabled={photoUploading}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full items-center justify-center"
                  style={shadows.sm}
                >
                  {photoUploading
                    ? <ActivityIndicator size="small" color={colors.white} />
                    : <Camera size={14} color={colors.white} />}
                </TouchableOpacity>
              </View>
              <Text className="text-gray-400 mt-2" style={{ fontSize: typography.caption }}>Tap camera to change photo</Text>
            </View>

            {/* Fields */}
            {([
              { label: 'Full Name', key: 'fullName', placeholder: 'Your full name', keyboardType: 'default' },
              { label: 'Phone Number', key: 'phoneNumber', placeholder: '+91 XXXXX XXXXX', keyboardType: 'phone-pad' },
            ] as const).map(({ label, key, placeholder, keyboardType }) => (
              <View key={key}>
                <Text className="text-gray-500 mb-1.5 font-medium" style={{ fontSize: typography.caption }}>{label}</Text>
                <TextInput
                  value={form[key]}
                  onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
                  placeholder={placeholder}
                  keyboardType={keyboardType}
                  placeholderTextColor={colors.textTertiary}
                  className="bg-white rounded-xl px-4 text-gray-900"
                  style={[{ fontSize: typography.body, height: 50 }, shadows.sm]}
                />
              </View>
            ))}

            <LocationPicker
              label="State"
              placeholder="Select state"
              value={form.state}
              items={states}
              loading={statesLoading}
              onChange={(item) => {
                setForm((f) => ({ ...f, state: item.name, city: '' }))
                setStateIso2(item.iso2)
              }}
            />

            <LocationPicker
              label="City"
              placeholder={stateIso2 ? 'Select city' : 'Select state first'}
              value={form.city}
              items={cities}
              loading={citiesLoading}
              disabled={!stateIso2}
              onChange={(item) => setForm((f) => ({ ...f, city: item.name }))}
            />

            {/* Gender */}
            <View>
              <Text className="text-gray-500 mb-1.5 font-medium" style={{ fontSize: typography.caption }}>Gender</Text>
              <View className="flex-row gap-3">
                {(['Male', 'Female', 'Other'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setForm((f) => ({ ...f, gender: g }))}
                    className="flex-1 py-3 rounded-xl items-center border-2"
                    style={{
                      borderColor: form.gender === g ? colors.primary : colors.border,
                      backgroundColor: form.gender === g ? '#FDF2F8' : colors.surface,
                    }}
                  >
                    <Text style={{
                      fontSize: typography.bodySmall,
                      fontWeight: '600',
                      color: form.gender === g ? colors.primary : colors.textSecondary,
                    }}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}
