export interface AppNotification {
  id: string
  userId: string
  title: string
  body: string
  type: 'booking' | 'promo' | 'system'
  read: boolean
  bookingId?: string
  createdAt: number
}
