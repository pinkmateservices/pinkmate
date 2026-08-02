export interface Service {
  id: string
  categoryId: string
  subCategoryId: string
  name: string
  shortDescription: string
  fullDescription: string
  thumbnail: string
  images?: string[]
  basePrice: number
  discountPrice: number
  duration: number
  serviceType: 'At Home'
  featured: boolean
  displayOrder: number
  status: 'Active' | 'Inactive'
  rating?: number
  reviewCount?: number
  addOnIds?: string[]         // IDs of available add-ons for this service
  includedItems?: string[]
  excludedItems?: string[]
  preparationInstructions?: string[]
  createdAt: number
  updatedAt: number
}
