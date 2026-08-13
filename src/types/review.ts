export interface Review {
  id: string
  userId: string
  partnerId: string
  bookingId: string
  rating: number
  comment?: string
  userName?: string
  userPhotoUrl?: string
  serviceNames?: string[]
  createdAt: number
}
