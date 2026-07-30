import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native'
import { colors, typography } from '../../config/theme'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  className?: string
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
}: ButtonProps) => {
  const sizeStyles = {
    sm: { py: 10, px: 16, textSize: typography.caption },
    md: { py: 14, px: 24, textSize: typography.bodySmall },
    lg: { py: 16, px: 32, textSize: typography.body },
  }

  const variantStyles = {
    primary: {
      bg: colors.primary,
      text: colors.white,
      border: colors.primary,
    },
    secondary: {
      bg: colors.secondary,
      text: colors.white,
      border: colors.secondary,
    },
    outline: {
      bg: 'transparent',
      text: colors.primary,
      border: colors.primary,
    },
    ghost: {
      bg: 'transparent',
      text: colors.primary,
      border: 'transparent',
    },
  }

  const s = sizeStyles[size]
  const v = variantStyles[variant]

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      className={`flex-row items-center justify-center rounded-xl ${className}`}
      style={{
        backgroundColor: v.bg,
        borderWidth: variant === 'ghost' ? 0 : 1,
        borderColor: v.border,
        paddingVertical: s.py,
        paddingHorizontal: s.px,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text
            style={{
              color: v.text,
              fontSize: s.textSize,
              fontFamily: undefined,
            }}
            className="font-semibold"
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  )
}
