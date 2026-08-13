import { database } from '../config/firebase'
import { ref, set, push, update, remove, runTransaction } from 'firebase/database'
import { DB_PATHS, BOOKING_STATUS } from '../config/constants'
import { Booking, StatusTimelineEntry, Address, Review } from '../types'
import { createJobRequestForBooking, expireJobRequest } from './jobMatching'
import { removeUndefined } from '../utils/sanitize'

/** Generates a 4-digit completion code shown to the customer in their app. */
export const generateCustomerOtp = (): string => {
  return String(Math.floor(1000 + Math.random() * 9000))
}

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

  const booking: Booking = {
    id: bookingRef.key as string,
    ...bookingData,
    userId,
    status: BOOKING_STATUS.PENDING,
    paymentStatus: 'Pending',
    statusTimeline: timeline,
    customerOtp: generateCustomerOtp(),
    createdAt: now,
    updatedAt: now,
  }

  await set(bookingRef, removeUndefined(booking))

  // Publish the broadcast job request so matching partners receive it in real
  // time. Best-effort: a failure here must never fail the booking itself.
  try {
    await createJobRequestForBooking(booking)
  } catch (err) {
    console.warn('Failed to publish job request', err)
  }

  return booking.id
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
  try {
    await expireJobRequest(bookingId)
  } catch (err) {
    console.warn('Failed to expire job request', err)
  }
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

export interface SubmitReviewInput {
  userId: string
  partnerId: string
  bookingId: string
  rating: number
  comment?: string
  userName?: string
  userPhotoUrl?: string
  serviceNames?: string[]
}

/**
 * Writes a customer review keyed by booking (one review per booking) and
 * best-effort rolls the rating into the partner's running average. The review
 * write is the source of truth — the partner-side aggregate is derived from
 * the reviews collection, so a blocked cross-user write must never fail the
 * submission.
 */
export const submitReview = async (input: SubmitReviewInput): Promise<void> => {
  const now = Date.now()
  const review: Omit<Review, 'id'> = {
    userId: input.userId,
    partnerId: input.partnerId,
    bookingId: input.bookingId,
    rating: input.rating,
    comment: input.comment,
    userName: input.userName,
    userPhotoUrl: input.userPhotoUrl,
    serviceNames: input.serviceNames,
    createdAt: now,
  }

  await set(ref(database, `${DB_PATHS.REVIEWS}/${input.bookingId}`), removeUndefined(review))

  try {
    const partnerRef = ref(database, `${DB_PATHS.PARTNERS}/${input.partnerId}`)
    await runTransaction(partnerRef, (partner) => {
      if (!partner) return
      const ratingCount = (partner.ratingCount ?? 0) + 1
      const rating = Math.round(((partner.rating ?? 0) * (partner.ratingCount ?? 0) + input.rating) / ratingCount * 10) / 10
      return {
        ...partner,
        rating,
        ratingCount,
        updatedAt: now,
      }
    })
  } catch (err) {
    console.warn('Failed to update partner rating aggregate', err)
  }
}
