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
  createdAt: number
  updatedAt: number
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}
