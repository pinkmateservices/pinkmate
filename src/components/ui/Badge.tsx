import { View, Text } from 'react-native'
import { typography } from '../../config/theme'

interface BadgeProps {
  label: string
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

const variantColors = {
  primary: { bg: '#FDF2F8', text: '#DB2777' },
  success: { bg: '#ECFDF5', text: '#059669' },
  warning: { bg: '#FFFBEB', text: '#D97706' },
  error: { bg: '#FEF2F2', text: '#DC2626' },
  info: { bg: '#EFF6FF', text: '#2563EB' },
}

export const Badge = ({ label, variant = 'primary', size = 'sm', className = '' }: BadgeProps) => {
  const colors = variantColors[variant]
  return (
    <View
      className={`px-2.5 py-1 rounded-full ${className}`}
      style={{ backgroundColor: colors.bg }}
    >
      <Text
        style={{ color: colors.text, fontSize: size === 'sm' ? typography.tiny : typography.caption }}
        className="font-semibold"
      >
        {label}
      </Text>
    </View>
  )
}

interface DiscountBadgeProps {
  percentage: number
  className?: string
}

export const DiscountBadge = ({ percentage, className = '' }: DiscountBadgeProps) => (
  <View
    className={`px-2 py-1 rounded-lg ${className}`}
    style={{ backgroundColor: '#ECFDF5' }}
  >
    <Text
      className="font-bold"
      style={{ color: '#059669', fontSize: typography.tiny }}
    >
      {percentage}% OFF
    </Text>
  </View>
)
