import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, Sparkles } from 'lucide-react-native'
import { colors, typography, shadows } from '../../src/config/theme'
import { useCategories } from '../../src/hooks'
import { CategoryCard, CategoryCardSkeleton, EmptyState } from '../../src/components/ui'

export default function AllCategoriesScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { data: categories, isLoading } = useCategories()

  const activeCategories = categories?.filter((c) => c.status === 'Active') ?? []

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100"
        style={shadows.sm}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: '#FDF2F8' }}
        >
          <ArrowLeft size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text className="text-gray-900 font-bold" style={{ fontSize: typography.h4 }}>
          All Categories
        </Text>
      </View>

      {isLoading ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          numColumns={2}
          keyExtractor={(item) => String(item)}
          contentContainerStyle={{ padding: 16, gap: 0 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={() => <CategoryCardSkeleton />}
        />
      ) : activeCategories.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={48} color={colors.primary} />}
          title="No Categories Yet"
          description="Categories will appear here once added by the admin."
        />
      ) : (
        <FlatList
          data={activeCategories}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              onPress={() => router.push(`/category/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  )
}
