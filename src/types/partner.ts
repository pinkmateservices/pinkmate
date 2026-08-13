export interface Partner {
  id: string
  fullName: string
  phoneNumber: string
  email: string
  photoUrl?: string
  gender: string
  city: string
  state: string
  skills: string[]
  rating: number
  ratingCount: number
  totalJobsCompleted: number
  isOnline: boolean
  createdAt: number
  updatedAt: number
}
