import { database } from '../config/firebase'
import { ref, get, set, update } from 'firebase/database'
import { DB_PATHS, JOB_REQUEST_STATUS, ACCEPT_COUNTDOWN_SECONDS } from '../config/constants'
import { Booking, JobRequest, JobRequestPreview } from '../types'
import { removeUndefined } from '../utils/sanitize'

/**
 * Publishes a broadcast job request for a freshly placed booking.
 *
 * Matching is intentionally NOT decided here. The job request carries only the
 * data partners need (services + their categories + the booking address), and
 * the Pinkmate-Partner app filters the feed per-partner by the partner's own
 * skills and service radius — so a request only reaches partners who match
 * BOTH the skills AND the range at the time they view it.
 */

/** Category IDs covered by a booking's items (used for partner skill matching). */
export async function getBookingCategoryIds(booking: Booking): Promise<string[]> {
  if (!booking.items?.length) return []
  const servicesSnapshot = await get(ref(database, DB_PATHS.SERVICES))
  const serviceCategoryById = new Map<string, string>()
  servicesSnapshot.forEach((child) => {
    const svc = child.val()
    if (svc?.categoryId) serviceCategoryById.set(child.key as string, svc.categoryId)
  })
  const categoryIds = new Set(
    booking.items.map((i) => serviceCategoryById.get(i.serviceId) ?? i.serviceId)
  )
  return Array.from(categoryIds)
}

function buildPreview(booking: Booking, categoryIds: string[]): JobRequestPreview {
  return {
    serviceNames: booking.items.map((i) => i.serviceName),
    categoryIds,
    addOnNames: booking.items.flatMap((i) => i.selectedAddOns ?? []).map((a) => a.name),
    totalAmount: booking.finalAmount,
    scheduledDate: booking.scheduledDate,
    scheduledTime: booking.scheduledTime,
    address: {
      label: booking.address?.label,
      fullAddress: booking.address?.fullAddress ?? 'Address not available',
      latitude: booking.address?.latitude ?? 0,
      longitude: booking.address?.longitude ?? 0,
    },
    distanceKm: 0,
    notes: booking.notes,
  }
}

/**
 * Creates (or refreshes) the job request for a freshly placed booking.
 * Safe to call repeatedly — reuses the existing node.
 */
export async function createJobRequestForBooking(
  booking: Booking,
  options?: { deadlineSeconds?: number }
): Promise<JobRequest | null> {
  const requestRef = ref(database, `${DB_PATHS.JOB_REQUESTS}/${booking.id}`)
  const existing = await get(requestRef)
  if (existing.exists() && existing.val().status !== JOB_REQUEST_STATUS.EXPIRED) {
    return { id: booking.id, ...existing.val() }
  }

  const categoryIds = await getBookingCategoryIds(booking)
  const now = Date.now()
  const deadlineSeconds = options?.deadlineSeconds ?? ACCEPT_COUNTDOWN_SECONDS

  const jobRequest: Omit<JobRequest, 'id'> = {
    bookingId: booking.id,
    status: JOB_REQUEST_STATUS.OPEN,
    deadlineAt: now + deadlineSeconds * 1000,
    createdAt: now,
    preview: buildPreview(booking, categoryIds),
  }

  await set(requestRef, removeUndefined(jobRequest))
  return { id: booking.id, ...jobRequest }
}

/** Marks a job request expired (used when a booking is cancelled). */
export async function expireJobRequest(bookingId: string): Promise<void> {
  await update(ref(database, `${DB_PATHS.JOB_REQUESTS}/${bookingId}`), {
    status: JOB_REQUEST_STATUS.EXPIRED,
  })
}
