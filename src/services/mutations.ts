import { database } from '../config/firebase'
import { ref, set, push, update, remove } from 'firebase/database'
import { DB_PATHS, BOOKING_STATUS } from '../config/constants'
import { Booking, StatusTimelineEntry, Address } from '../types'

export const createBooking = async (
  userId: string,
  bookingData: Omit<Booking, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const now = Date.now()
  const bookingRef = push(ref(database, `${DB_PATHS.BOOKINGS}`))

  const timeline: StatusTimelineEntry[] = [
    {
      status: BOOKING_STATUS.PENDING,
      timestamp: now,
      note: 'Booking has been placed',
    },
  ]

  const booking = {
    ...bookingData,
    userId,
    status: BOOKING_STATUS.PENDING,
    paymentStatus: 'Pending',
    statusTimeline: timeline,
    createdAt: now,
    updatedAt: now,
  }

  await set(bookingRef, booking)
  return bookingRef.key as string
}

export const updateBookingStatus = async (
  bookingId: string,
  status: string,
  note?: string
) => {
  const now = Date.now()
  const timelineEntry: StatusTimelineEntry = {
    status: status as StatusTimelineEntry['status'],
    timestamp: now,
    note,
  }

  const bookingRef = ref(database, `${DB_PATHS.BOOKINGS}/${bookingId}`)

  const snapshot = await import('firebase/database').then((fb) =>
    fb.get(bookingRef)
  )

  if (!snapshot.exists()) throw new Error('Booking not found')

  const existingTimeline = snapshot.val().statusTimeline || []

  await update(bookingRef, {
    status,
    updatedAt: now,
    statusTimeline: [...existingTimeline, timelineEntry],
  })
}

export const cancelBooking = async (bookingId: string, reason?: string) => {
  await updateBookingStatus(bookingId, BOOKING_STATUS.CANCELLED, reason)
}

export const saveAddress = async (
  userId: string,
  address: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const now = Date.now()
  const addressRef = push(ref(database, `${DB_PATHS.ADDRESSES}`))
  const newAddress = {
    ...address,
    userId,
    createdAt: now,
    updatedAt: now,
  }
  await set(addressRef, newAddress)
  return addressRef.key as string
}

export const updateAddress = async (
  addressId: string,
  data: Partial<Address>
) => {
  await update(ref(database, `${DB_PATHS.ADDRESSES}/${addressId}`), {
    ...data,
    updatedAt: Date.now(),
  })
}

export const deleteAddress = async (addressId: string) => {
  await remove(ref(database, `${DB_PATHS.ADDRESSES}/${addressId}`))
}

export const toggleFavorite = async (userId: string, serviceId: string) => {
  const favRef = ref(database, `${DB_PATHS.FAVORITES}/${userId}/${serviceId}`)
  const snapshot = await import('firebase/database').then((fb) =>
    fb.get(favRef)
  )
  if (snapshot.exists()) {
    await remove(favRef)
    return false
  } else {
    await set(favRef, true)
    return true
  }
}

export const markNotificationRead = async (notificationId: string) => {
  await update(ref(database, `${DB_PATHS.NOTIFICATIONS}/${notificationId}`), {
    read: true,
  })
}

export const markAllNotificationsRead = async (userId: string) => {
  const snapshot = await import('firebase/database').then((fb) =>
    fb.get(ref(database, DB_PATHS.NOTIFICATIONS))
  )

  if (!snapshot.exists()) return

  const updates: Record<string, boolean> = {}
  snapshot.forEach((child) => {
    const notif = child.val()
    if (notif.userId === userId && !notif.read) {
      updates[`${child.key}/read`] = true
    }
  })

  if (Object.keys(updates).length > 0) {
    await update(ref(database, DB_PATHS.NOTIFICATIONS), updates)
  }
}
