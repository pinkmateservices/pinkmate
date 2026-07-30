export interface Address {
  id: string
  userId: string
  label: string
  fullAddress: string
  apartment?: string
  landmark?: string
  latitude: number
  longitude: number
  isDefault: boolean
  createdAt: number
  updatedAt: number
}
