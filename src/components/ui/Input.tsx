import { View, TextInput, Text, TouchableOpacity } from 'react-native'
import { colors, typography } from '../../config/theme'
import { Eye, EyeOff } from 'lucide-react-native'
import { useState } from 'react'

interface InputProps {
  label?: string
  placeholder?: string
  value: string
  onChangeText: (text: string) => void
  error?: string
  secureTextEntry?: boolean
  multiline?: boolean
  numberOfLines?: number
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  icon?: React.ReactNode
  className?: string
  editable?: boolean
}

export const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry,
  multiline,
  numberOfLines,
  keyboardType,
  autoCapitalize = 'none',
  icon,
  className = '',
  editable = true,
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = secureTextEntry

  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text
          className="text-gray-700 font-medium mb-2"
          style={{ fontSize: typography.bodySmall }}
        >
          {label}
        </Text>
      )}
      <View
        className="flex-row items-center rounded-xl border bg-white"
        style={{
          borderColor: error ? colors.error : colors.border,
          minHeight: multiline ? 100 : undefined,
        }}
      >
        {icon && <View className="pl-4">{icon}</View>}
        <TextInput
          className={`flex-1 px-4 py-3.5 text-gray-900 ${multiline ? 'text-left' : ''}`}
          style={{
            fontSize: typography.body,
            fontFamily: undefined,
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="pr-4"
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.textTertiary} />
            ) : (
              <Eye size={20} color={colors.textTertiary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text
          className="text-red-500 mt-1"
          style={{ fontSize: typography.caption }}
        >
          {error}
        </Text>
      )}
    </View>
  )
}
