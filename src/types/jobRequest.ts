import { JOB_REQUEST_STATUS } from '../config/constants'

export type JobRequestStatus = (typeof JOB_REQUEST_STATUS)[keyof typeof JOB_REQUEST_STATUS]

/** Denormalized preview stored on a job request so partner feeds render
 *  without reading the (privacy-sensitive) booking node. */
export interface JobRequestPreview {
  serviceNames: string[]
  /** Category ids of the booked services — used for partner skill matching. */
  categoryIds: string[]
  totalAmount: number
  scheduledDate: string
  scheduledTime: string
  address: {
    label?: string
    fullAddress: string
    latitude: number
    longitude: number
  }
  /** Distance from the nearest partner (overridden per-partner in the feed). */
  distanceKm: number
  /** Customer instructions added at checkout. */
  notes?: string
}

export interface JobRequest {
  id: string
  bookingId: string
  status: JobRequestStatus
  deadlineAt: number
  createdAt: number
  assignedPartnerId?: string
  assignedAt?: number
  preview?: JobRequestPreview
}
