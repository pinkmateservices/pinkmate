import { create } from 'zustand'
import { toggleFavorite as toggleFavService } from '../services/mutations'

interface FavoritesStore {
  favoriteIds: Set<string>
  setFavoriteIds: (ids: string[]) => void
  isFavorite: (serviceId: string) => boolean
  toggleFavorite: (userId: string, serviceId: string) => Promise<boolean>
  addFavorite: (serviceId: string) => void
  removeFavorite: (serviceId: string) => void
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favoriteIds: new Set(),

  setFavoriteIds: (ids) => set({ favoriteIds: new Set(ids) }),

  isFavorite: (serviceId) => get().favoriteIds.has(serviceId),

  toggleFavorite: async (userId, serviceId) => {
    const isFav = await toggleFavService(userId, serviceId)
    set((state) => {
      const newSet = new Set(state.favoriteIds)
      if (isFav) {
        newSet.add(serviceId)
      } else {
        newSet.delete(serviceId)
      }
      return { favoriteIds: newSet }
    })
    return isFav
  },

  addFavorite: (serviceId) =>
    set((state) => {
      const newSet = new Set(state.favoriteIds)
      newSet.add(serviceId)
      return { favoriteIds: newSet }
    }),

  removeFavorite: (serviceId) =>
    set((state) => {
      const newSet = new Set(state.favoriteIds)
      newSet.delete(serviceId)
      return { favoriteIds: newSet }
    }),
}))
