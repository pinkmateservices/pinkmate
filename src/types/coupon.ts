export interface Coupon {
  id: string
  code: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount: number
  maxDiscount: number
  usageLimit: number
  usedCount: number
  validFrom: number
  validTo: number
  active: boolean
  createdAt: number
  updatedAt: number
}
