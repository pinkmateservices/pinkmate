export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image?: string
  icon?: string
  featured: boolean
  displayOrder: number
  status: 'Active' | 'Inactive'
  createdAt: number
  updatedAt: number
}
