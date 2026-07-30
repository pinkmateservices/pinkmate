import { Address } from './address'

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Partner Assigned'
  | 'On The Way'
  | 'Service Started'
  | 'Completed'
  | 'Cancelled'

export type PaymentMethod = 'Cash' | 'Card' | 'Online'

export interface BookingItem {
  serviceId: string
  serviceName: string
  quantity: number
  price: number
}

export interface Booking {
  id: string
  userId: string
  partnerId?: string
  items: BookingItem[]
  totalAmount: number
  discountAmount: number
  couponId?: string
  couponCode?: string
  finalAmount: number
  status: BookingStatus
  addressId: string
  address: Address
  scheduledDate: string
  scheduledTime: string
  paymentMethod: PaymentMethod
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded'
  notes?: string
  statusTimeline: StatusTimelineEntry[]
  createdAt: number
  updatedAt: number
}

export interface StatusTimelineEntry {
  status: BookingStatus
  timestamp: number
  note?: string
}
