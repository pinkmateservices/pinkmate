export interface Banner {
  id: string
  title: string
  subtitle?: string
  image: string
  linkType?: 'category' | 'subCategory' | 'service' | 'external'
  linkValue?: string
  active: boolean
  displayOrder: number
  createdAt: number
  updatedAt: number
}
