export interface GeoPoint {
  latitude: number
  longitude: number
}

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
  serviceRadius?: number
  baseLocation?: GeoPoint
  /** Live GPS position pushed by the partner app while online / on a job. */
  currentLocation?: GeoPoint & { updatedAt?: number }
  createdAt: number
  updatedAt: number
}
