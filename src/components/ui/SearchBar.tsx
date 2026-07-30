import { View, TextInput, TouchableOpacity } from 'react-native'
import { colors, typography } from '../../config/theme'
import { Search, X } from 'lucide-react-native'

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  onClear?: () => void
  className?: string
}

export const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search services...',
  onClear,
  className = '',
}: SearchBarProps) => (
  <View className={`flex-row items-center bg-gray-100 rounded-xl px-4 ${className}`}>
    <Search size={20} color={colors.textTertiary} />
    <TextInput
      className="flex-1 px-3 py-3 text-gray-900"
      style={{ fontSize: typography.body, fontFamily: undefined }}
      placeholder={placeholder}
      placeholderTextColor={colors.textTertiary}
      value={value}
      onChangeText={onChangeText}
    />
    {value.length > 0 && (
      <TouchableOpacity
        onPress={() => {
          onChangeText('')
          onClear?.()
        }}
      >
        <X size={18} color={colors.textTertiary} />
      </TouchableOpacity>
    )}
  </View>
)
