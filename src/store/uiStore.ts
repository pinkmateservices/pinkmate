import { create } from 'zustand'

interface UIStore {
  isDarkMode: boolean
  toggleDarkMode: () => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedCategoryId: string | null
  setSelectedCategoryId: (id: string | null) => void
}

export const useUIStore = create<UIStore>((set) => ({
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedCategoryId: null,
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
}))
