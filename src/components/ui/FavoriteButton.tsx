import { TouchableOpacity } from 'react-native'
import { Heart } from 'lucide-react-native'
import { colors } from '../../config/theme'
import { useFavoritesStore } from '../../store/favoritesStore'
import { useAuthStore } from '../../store/authStore'

interface FavoriteButtonProps {
  serviceId: string
  size?: number
  className?: string
}

export const FavoriteButton = ({ serviceId, size = 22, className = '' }: FavoriteButtonProps) => {
  const isFavorite = useFavoritesStore((s) => s.isFavorite(serviceId))
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite)
  const user = useAuthStore((s) => s.user)

  return (
    <TouchableOpacity
      onPress={() => user && toggleFavorite(user.id, serviceId)}
      className={`p-2 rounded-full ${className}`}
      style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
    >
      <Heart
        size={size}
        color={isFavorite ? colors.primary : colors.textTertiary}
        fill={isFavorite ? colors.primary : 'transparent'}
      />
    </TouchableOpacity>
  )
}
