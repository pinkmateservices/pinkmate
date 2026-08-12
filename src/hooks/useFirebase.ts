import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import * as db from '../services/database'
import * as mutations from '../services/mutations'
import { useAuthStore } from '../store'
import { useFavoritesStore } from '../store/favoritesStore'
import { fetchFavoriteIds } from '../services/database'
import type { Booking } from '../types'

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: db.fetchCategories,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => db.fetchCategoryById(id),
    enabled: !!id,
  })
}

export const useSubCategories = (categoryId: string) => {
  return useQuery({
    queryKey: ['subCategories', categoryId],
    queryFn: () => db.fetchSubCategories(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useServices = (subCategoryId?: string) => {
  return useQuery({
    queryKey: ['services', subCategoryId],
    queryFn: () => db.fetchServices(subCategoryId),
    staleTime: 5 * 60 * 1000,
  })
}

export const useServicesByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: ['services', 'category', categoryId],
    queryFn: () => db.fetchServicesByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useService = (id: string) => {
  return useQuery({
    queryKey: ['services', id],
    queryFn: () => db.fetchServiceById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useBanners = () => {
  return useQuery({
    queryKey: ['banners'],
    queryFn: db.fetchBanners,
    staleTime: 10 * 60 * 1000,
  })
}

export const useCoupons = () => {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: db.fetchCoupons,
    staleTime: 10 * 60 * 1000,
  })
}

export const useCouponByCode = (code: string) => {
  return useQuery({
    queryKey: ['coupons', code],
    queryFn: () => db.fetchCouponByCode(code),
    enabled: !!code,
  })
}

export const useBookings = () => {
  const user = useAuthStore((s) => s.user)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    const unsubscribe = db.subscribeBookings(user.id, (data) => {
      setBookings(data)
      setLoading(false)
    })
    return unsubscribe
  }, [user?.id])

  // refetch is a no-op — data is always live via the real-time listener
  const refetch = () => Promise.resolve()

  return { data: bookings, isLoading: loading, refetch }
}

export const useBooking = (bookingId: string) => {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bookingId) return
    setLoading(true)
    const unsubscribe = db.subscribeBooking(bookingId, (data) => {
      setBooking(data)
      setLoading(false)
    })
    return unsubscribe
  }, [bookingId])

  return { data: booking, isLoading: loading }
}

export const useAddresses = () => {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: () => db.fetchAddresses(user!.id),
    enabled: !!user,
  })
}

export const useNotifications = () => {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => db.fetchNotifications(user!.id),
    enabled: !!user,
  })
}

export const useFavorites = () => {
  const user = useAuthStore((s) => s.user)
  const setFavoriteIds = useFavoritesStore((s) => s.setFavoriteIds)

  return useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      const ids = await fetchFavoriteIds(user!.id)
      setFavoriteIds(ids)
      return ids
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: (data: Parameters<typeof mutations.createBooking>[1]) =>
      mutations.createBooking(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export const useSaveAddress = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: (data: Parameters<typeof mutations.saveAddress>[1]) =>
      mutations.saveAddress(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
  })
}

export const useToggleFavorite = () => {
  const user = useAuthStore((s) => s.user)
  const storeToggle = useFavoritesStore((s) => s.toggleFavorite)

  return useMutation({
    mutationFn: (serviceId: string) => storeToggle(user!.id, serviceId),
  })
}

export const useAddOns = (ids: string[]) => {
  return useQuery({
    queryKey: ['addons', ids],
    queryFn: () => db.fetchAddOnsByIds(ids),
    enabled: ids.length > 0,
    staleTime: 10 * 60 * 1000,
  })
}
