export interface AddOn {
  id: string
  name: string
  description?: string
  price: number
  duration: number        // extra minutes added to the base service
  status: 'Active' | 'Inactive'
  createdAt: number
  updatedAt: number
}
