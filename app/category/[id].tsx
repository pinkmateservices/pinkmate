import { View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { ArrowLeft, Layers } from 'lucide-react-native'
import { colors, typography, shadows, borderRadius } from '../../src/config/theme'
import { useCategory, useSubCategories, useServicesByCategory } from '../../src/hooks'
import { ServiceCard, ServiceCardSkeleton, EmptyState, Skeleton } from '../../src/components/ui'
import { useMemo, useState } from 'react'

export default function CategoryServicesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [selectedSubCat, setSelectedSubCat] = useState<string | null>(null)

  const { data: category, isLoading: catLoading } = useCategory(id!)
  const { data: subCategories, isLoading: subCatLoading } = useSubCategories(id!)
  const { data: services, isLoading: servicesLoading } = useServicesByCategory(id!)

  const activeSubCats = useMemo(
    () => subCategories?.filter((s) => s.status === 'Active').sort((a, b) => a.displayOrder - b.displayOrder) ?? [],
    [subCategories]
  )

  const filteredServices = useMemo(() => {
    const active = services?.filter((s) => s.status === 'Active') ?? []
    if (!selectedSubCat) return active
    return active.filter((s) => s.subCategoryId === selectedSubCat)
  }, [services, selectedSubCat])

  const isLoading = catLoading || servicesLoading

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white border-b border-gray-100" style={shadows.sm}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: '#FDF2F8' }}
          >
            <ArrowLeft size={20} color={colors.primary} />
          </TouchableOpacity>

          {catLoading ? (
            <Skeleton width={160} height={20} />
          ) : (
            <View className="flex-row items-center flex-1">
              {category?.image ? (
                <Image
                  source={{ uri: category.image }}
                  style={{ width: 32, height: 32, borderRadius: 8, marginRight: 10 }}
                  contentFit="cover"
                />
              ) : null}
              <Text className="text-gray-900 font-bold flex-1" style={{ fontSize: typography.h4 }} numberOfLines={1}>
                {category?.name ?? 'Category'}
              </Text>
            </View>
          )}
        </View>

        {/* Subcategory chips */}
        {!subCatLoading && activeSubCats.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}
          >
            <TouchableOpacity
              onPress={() => setSelectedSubCat(null)}
              activeOpacity={0.75}
              style={[
                chipStyle,
                !selectedSubCat && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
            >
              <Text
                style={[chipTextStyle, !selectedSubCat && { color: colors.white }]}
              >
                All
              </Text>
            </TouchableOpacity>
            {activeSubCats.map((sub) => (
              <TouchableOpacity
                key={sub.id}
                onPress={() => setSelectedSubCat(sub.id === selectedSubCat ? null : sub.id)}
                activeOpacity={0.75}
                style={[
                  chipStyle,
                  selectedSubCat === sub.id && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Text
                  style={[chipTextStyle, selectedSubCat === sub.id && { color: colors.white }]}
                >
                  {sub.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Services grid */}
      {isLoading ? (
        <FlatList
          data={[1, 2, 3, 4]}
          numColumns={2}
          keyExtractor={(item) => String(item)}
          contentContainerStyle={{ padding: 16 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={() => <ServiceCardSkeleton />}
        />
      ) : filteredServices.length === 0 ? (
        <EmptyState
          icon={<Layers size={48} color={colors.primary} />}
          title="No Services Found"
          description={
            selectedSubCat
              ? 'No services in this subcategory. Try another filter.'
              : 'No services available in this category yet.'
          }
        />
      ) : (
        <FlatList
          data={filteredServices}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <ServiceCard
              service={item}
              index={index}
              onPress={() => router.push(`/service-details/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  )
}

const chipStyle = {
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: borderRadius.full,
  borderWidth: 1.5,
  borderColor: colors.border,
  backgroundColor: colors.surface,
}

const chipTextStyle = {
  fontSize: typography.caption,
  fontWeight: '600' as const,
  color: colors.textSecondary,
}
