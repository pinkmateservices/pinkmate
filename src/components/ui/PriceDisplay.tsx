import { View, Text } from 'react-native'
import { typography } from '../../config/theme'

interface PriceDisplayProps {
  basePrice: number
  discountPrice?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const PriceDisplay = ({
  basePrice,
  discountPrice,
  size = 'md',
  className = '',
}: PriceDisplayProps) => {
  const sizeStyles = {
    sm: { price: typography.bodySmall, original: typography.caption },
    md: { price: typography.body, original: typography.bodySmall },
    lg: { price: typography.h4, original: typography.body },
  }

  const s = sizeStyles[size]
  const hasDiscount = discountPrice !== undefined && discountPrice < basePrice
  const discountPercent = hasDiscount
    ? Math.round(((basePrice - discountPrice!) / basePrice) * 100)
    : 0

  return (
    <View className={`flex-row items-baseline ${className}`}>
      <Text
        className="font-bold text-gray-900"
        style={{ fontSize: s.price }}
      >
        ₹{hasDiscount ? discountPrice : basePrice}
      </Text>
      {hasDiscount && (
        <>
          <Text
            className="line-through text-gray-400 ml-2"
            style={{ fontSize: s.original }}
          >
            ₹{basePrice}
          </Text>
          <Text
            className="ml-2 font-semibold"
            style={{ color: '#059669', fontSize: typography.tiny }}
          >
            {discountPercent}% off
          </Text>
        </>
      )}
    </View>
  )
}
