export interface UserAddress {
  city: string
  state: string
  address: string
  latitude: number
  longitude: number
  type: 'default'
  updatedAt: number
}

export interface User {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  gender: string
  city: string
  state: string
  status: 'active' | 'inactive'
  totalBookings: number
  photoURL?: string
  latitude?: number
  longitude?: number
  locationUpdatedAt?: number
  address?: UserAddress
  createdAt: number
  updatedAt: number
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}
