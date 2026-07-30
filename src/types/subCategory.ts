export interface SubCategory {
  id: string
  categoryId: string
  name: string
  description: string
  slug: string
  image?: string
  icon?: string
  featured: boolean
  displayOrder: number
  status: 'Active' | 'Inactive'
  createdAt: number
  updatedAt: number
  serviceCount?: number
}
