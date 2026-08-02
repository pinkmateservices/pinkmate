import { create } from 'zustand'
import { Address, Service, Coupon, AddOn } from '../types'

interface SelectedAddOn {
  addOnId: string
  name: string
  price: number
  duration: number
}

interface BookingItem {
  serviceId: string
  serviceName: string
  quantity: number
  price: number
  duration: number
  selectedAddOns: SelectedAddOn[]
}

interface BookingStore {
  items: BookingItem[]
  selectedAddress: Address | null
  scheduledDate: string | null
  scheduledTime: string | null
  coupon: Coupon | null
  paymentMethod: 'Cash' | 'Card' | 'Online'
  notes: string

  addItem: (service: Service) => void
  removeItem: (serviceId: string) => void
  updateQuantity: (serviceId: string, quantity: number) => void
  toggleAddOn: (serviceId: string, addOn: AddOn) => void
  clearItems: () => void
  setAddress: (address: Address) => void
  setDate: (date: string) => void
  setTime: (time: string) => void
  setCoupon: (coupon: Coupon | null) => void
  setPaymentMethod: (method: 'Cash' | 'Card' | 'Online') => void
  setNotes: (notes: string) => void
  reset: () => void
  getSubtotal: () => number
  getDiscount: () => number
  getTotal: () => number
}

const initialState = {
  items: [],
  selectedAddress: null,
  scheduledDate: null,
  scheduledTime: null,
  coupon: null,
  paymentMethod: 'Cash' as const,
  notes: '',
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  ...initialState,

  addItem: (service) =>
    set((state) => {
      const existing = state.items.find((i) => i.serviceId === service.id)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.serviceId === service.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      }
      return {
        items: [
          ...state.items,
          {
            serviceId: service.id,
            serviceName: service.name,
            quantity: 1,
            price: service.discountPrice || service.basePrice,
            duration: service.duration,
            selectedAddOns: [],
          },
        ],
      }
    }),

  removeItem: (serviceId) =>
    set((state) => ({
      items: state.items.filter((i) => i.serviceId !== serviceId),
    })),

  updateQuantity: (serviceId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((i) => i.serviceId !== serviceId) }
      }
      return {
        items: state.items.map((i) =>
          i.serviceId === serviceId ? { ...i, quantity } : i
        ),
      }
    }),

  toggleAddOn: (serviceId, addOn) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.serviceId !== serviceId) return item
        const exists = item.selectedAddOns.find((a) => a.addOnId === addOn.id)
        return {
          ...item,
          selectedAddOns: exists
            ? item.selectedAddOns.filter((a) => a.addOnId !== addOn.id)
            : [...item.selectedAddOns, { addOnId: addOn.id, name: addOn.name, price: addOn.price, duration: addOn.duration }],
        }
      }),
    })),

  clearItems: () => set({ items: [] }),

  setAddress: (address) => set({ selectedAddress: address }),
  setDate: (date) => set({ scheduledDate: date }),
  setTime: (time) => set({ scheduledTime: time }),
  setCoupon: (coupon) => set({ coupon }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setNotes: (notes) => set({ notes }),

  reset: () => set(initialState),

  getSubtotal: () => {
    const state = get()
    return state.items.reduce((sum, item) => {
      const addOnTotal = item.selectedAddOns.reduce((s, a) => s + a.price, 0)
      return sum + (item.price + addOnTotal) * item.quantity
    }, 0)
  },

  getDiscount: () => {
    const state = get()
    const subtotal = state.items.reduce((sum, item) => {
      const addOnTotal = item.selectedAddOns.reduce((s, a) => s + a.price, 0)
      return sum + (item.price + addOnTotal) * item.quantity
    }, 0)
    if (!state.coupon) return 0

    const now = Date.now()
    if (now < state.coupon.validFrom || now > state.coupon.validTo) return 0
    if (subtotal < state.coupon.minOrderAmount) return 0

    let discount = 0
    if (state.coupon.discountType === 'percentage') {
      discount = (subtotal * state.coupon.discountValue) / 100
    } else {
      discount = state.coupon.discountValue
    }

    return Math.min(discount, state.coupon.maxDiscount)
  },

  getTotal: () => {
    const state = get()
    const subtotal = state.items.reduce((sum, item) => {
      const addOnTotal = item.selectedAddOns.reduce((s, a) => s + a.price, 0)
      return sum + (item.price + addOnTotal) * item.quantity
    }, 0)
    const discount = get().getDiscount()
    return Math.max(0, subtotal - discount)
  },
}))
