import { useState } from 'react'
import {
  View, Text, TouchableOpacity, Modal, FlatList,
  TextInput, ActivityIndicator,
} from 'react-native'
import { ChevronDown, Search, X } from 'lucide-react-native'
import { colors, typography } from '../../config/theme'
import type { LocationItem } from '../../hooks/useLocation'

interface LocationPickerProps {
  label: string
  placeholder: string
  value: string
  items: LocationItem[]
  loading?: boolean
  disabled?: boolean
  error?: string
  onChange: (item: LocationItem) => void
}

export const LocationPicker = ({
  label, placeholder, value, items, loading = false,
  disabled = false, error, onChange,
}: LocationPickerProps) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = query
    ? items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()))
    : items

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-gray-700 font-medium mb-2" style={{ fontSize: typography.bodySmall }}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.7}
        className="flex-row items-center justify-between rounded-xl border bg-white px-4"
        style={{
          borderColor: error ? colors.error : colors.border,
          paddingVertical: 14,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Text style={{
          fontSize: typography.body,
          color: value ? colors.text : colors.textTertiary,
          flex: 1,
        }}>
          {value || placeholder}
        </Text>
        {loading
          ? <ActivityIndicator size="small" color={colors.textTertiary} />
          : <ChevronDown size={18} color={colors.textTertiary} />
        }
      </TouchableOpacity>

      {error && (
        <Text className="text-red-500 mt-1" style={{ fontSize: typography.caption }}>{error}</Text>
      )}

      <Modal visible={open} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '75%' }}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
              <Text className="font-semibold text-gray-900" style={{ fontSize: typography.h4 }}>{label}</Text>
              <TouchableOpacity onPress={() => { setOpen(false); setQuery('') }}>
                <X size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="flex-row items-center mx-4 mb-3 rounded-xl border bg-gray-50 px-3"
              style={{ borderColor: colors.border }}>
              <Search size={16} color={colors.textTertiary} />
              <TextInput
                className="flex-1 py-2.5 px-2 text-gray-900"
                style={{ fontSize: typography.body }}
                placeholder={`Search ${label.toLowerCase()}...`}
                placeholderTextColor={colors.textTertiary}
                value={query}
                onChangeText={setQuery}
                autoFocus
              />
            </View>

            {/* List */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.iso2}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="px-4 py-3.5 border-b"
                  style={{ borderColor: colors.borderLight }}
                  onPress={() => { onChange(item); setOpen(false); setQuery('') }}
                >
                  <Text style={{ fontSize: typography.body, color: colors.text }}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text className="text-center py-8" style={{ color: colors.textSecondary, fontSize: typography.body }}>
                  No results found
                </Text>
              }
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}
