import { database } from '../config/firebase'
import { ref, get, query, orderByChild, equalTo, onValue, off, DataSnapshot } from 'firebase/database'
import { DB_PATHS } from '../config/constants'
import {
  Category,
  SubCategory,
  Service,
  AddOn,
  Banner,
  Coupon,
  Booking,
  Address,
  AppNotification,
  Review,
  Partner,
  Testimonial,
} from '../types'

const snapshotToArray = <T>(snapshot: DataSnapshot): T[] => {
  const items: T[] = []
  snapshot.forEach((child) => {
    items.push({ id: child.key, ...child.val() })
  })
  return items
}

export const fetchCategories = async (): Promise<Category[]> => {
  const snapshot = await get(query(ref(database, DB_PATHS.CATEGORIES), orderByChild('displayOrder')))
  return snapshotToArray<Category>(snapshot)
}

export const fetchCategoryById = async (id: string): Promise<Category | null> => {
  const snapshot = await get(ref(database, `${DB_PATHS.CATEGORIES}/${id}`))
  return snapshot.exists() ? { id, ...snapshot.val() } : null
}

export const subscribeCategories = (callback: (categories: Category[]) => void) => {
  const dbRef = ref(database, DB_PATHS.CATEGORIES)
  const q = query(dbRef, orderByChild('displayOrder'))
  const listener = onValue(q, (snapshot) => {
    callback(snapshotToArray<Category>(snapshot))
  })
  return () => off(q, 'value', listener)
}

export const fetchSubCategories = async (categoryId?: string): Promise<SubCategory[]> => {
  if (categoryId) {
    const snapshot = await get(
      query(ref(database, DB_PATHS.SUB_CATEGORIES), orderByChild('categoryId'), equalTo(categoryId))
    )
    return snapshotToArray<SubCategory>(snapshot)
  }
  const snapshot = await get(query(ref(database, DB_PATHS.SUB_CATEGORIES), orderByChild('displayOrder')))
  return snapshotToArray<SubCategory>(snapshot)
}

export const subscribeSubCategories = (categoryId: string, callback: (subs: SubCategory[]) => void) => {
  const dbRef = ref(database, DB_PATHS.SUB_CATEGORIES)
  const q = query(dbRef, orderByChild('categoryId'), equalTo(categoryId))
  const listener = onValue(q, (snapshot) => {
    callback(snapshotToArray<SubCategory>(snapshot))
  })
  return () => off(q, 'value', listener)
}

export const fetchServices = async (subCategoryId?: string): Promise<Service[]> => {
  if (subCategoryId) {
    const snapshot = await get(
      query(ref(database, DB_PATHS.SERVICES), orderByChild('subCategoryId'), equalTo(subCategoryId))
    )
    return snapshotToArray<Service>(snapshot)
  }
  const snapshot = await get(query(ref(database, DB_PATHS.SERVICES), orderByChild('displayOrder')))
  return snapshotToArray<Service>(snapshot)
}

export const fetchServicesByCategory = async (categoryId: string): Promise<Service[]> => {
  const snapshot = await get(
    query(ref(database, DB_PATHS.SERVICES), orderByChild('categoryId'), equalTo(categoryId))
  )
  return snapshotToArray<Service>(snapshot)
}

export const fetchServiceById = async (id: string): Promise<Service | null> => {
  const snapshot = await get(ref(database, `${DB_PATHS.SERVICES}/${id}`))
  return snapshot.exists() ? { id, ...snapshot.val() } : null
}

export const subscribeServices = (subCategoryId: string, callback: (services: Service[]) => void) => {
  const dbRef = ref(database, DB_PATHS.SERVICES)
  const q = query(dbRef, orderByChild('subCategoryId'), equalTo(subCategoryId))
  const listener = onValue(q, (snapshot) => {
    callback(snapshotToArray<Service>(snapshot))
  })
  return () => off(q, 'value', listener)
}

export const fetchBanners = async (): Promise<Banner[]> => {
  const snapshot = await get(query(ref(database, DB_PATHS.BANNERS), orderByChild('displayOrder')))
  return snapshotToArray<Banner>(snapshot)
}

export const subscribeBanners = (callback: (banners: Banner[]) => void) => {
  const dbRef = ref(database, DB_PATHS.BANNERS)
  const q = query(dbRef, orderByChild('displayOrder'))
  const listener = onValue(q, (snapshot) => {
    callback(snapshotToArray<Banner>(snapshot))
  })
  return () => off(q, 'value', listener)
}

export const fetchTestimonials = async (): Promise<Testimonial[]> => {
  const snapshot = await get(
    query(ref(database, DB_PATHS.TESTIMONIALS), orderByChild('displayOrder'))
  )
  return snapshotToArray<Testimonial>(snapshot)
}

export const subscribeTestimonials = (callback: (testimonials: Testimonial[]) => void) => {
  const dbRef = ref(database, DB_PATHS.TESTIMONIALS)
  const q = query(dbRef, orderByChild('displayOrder'))
  const listener = onValue(q, (snapshot) => {
    callback(snapshotToArray<Testimonial>(snapshot))
  })
  return () => off(q, 'value', listener)
}

export const fetchCoupons = async (): Promise<Coupon[]> => {
  const snapshot = await get(ref(database, DB_PATHS.COUPONS))
  return snapshotToArray<Coupon>(snapshot)
}

export const fetchCouponByCode = async (code: string): Promise<Coupon | null> => {
  const snapshot = await get(query(ref(database, DB_PATHS.COUPONS), orderByChild('code'), equalTo(code)))
  const coupons = snapshotToArray<Coupon>(snapshot)
  return coupons.length > 0 ? coupons[0] : null
}

export const fetchBookings = async (userId: string): Promise<Booking[]> => {
  const snapshot = await get(
    query(ref(database, DB_PATHS.BOOKINGS), orderByChild('userId'), equalTo(userId))
  )
  return snapshotToArray<Booking>(snapshot)
}

export const subscribeBookings = (userId: string, callback: (bookings: Booking[]) => void) => {
  const dbRef = ref(database, DB_PATHS.BOOKINGS)
  const q = query(dbRef, orderByChild('userId'), equalTo(userId))
  const listener = onValue(q, (snapshot) => {
    callback(snapshotToArray<Booking>(snapshot))
  })
  return () => off(q, 'value', listener)
}

export const fetchBookingById = async (bookingId: string): Promise<Booking | null> => {
  const snapshot = await get(ref(database, `${DB_PATHS.BOOKINGS}/${bookingId}`))
  return snapshot.exists() ? { id: bookingId, ...snapshot.val() } : null
}

export const subscribeBooking = (bookingId: string, callback: (booking: Booking | null) => void) => {
  const dbRef = ref(database, `${DB_PATHS.BOOKINGS}/${bookingId}`)
  const listener = onValue(dbRef, (snapshot) => {
    callback(snapshot.exists() ? { id: bookingId, ...snapshot.val() } : null)
  })
  return () => off(dbRef, 'value', listener)
}

export const fetchAddresses = async (userId: string): Promise<Address[]> => {
  const snapshot = await get(
    query(ref(database, DB_PATHS.ADDRESSES), orderByChild('userId'), equalTo(userId))
  )
  return snapshotToArray<Address>(snapshot)
}

export const subscribeAddresses = (userId: string, callback: (addresses: Address[]) => void) => {
  const dbRef = ref(database, DB_PATHS.ADDRESSES)
  const q = query(dbRef, orderByChild('userId'), equalTo(userId))
  const listener = onValue(q, (snapshot) => {
    callback(snapshotToArray<Address>(snapshot))
  })
  return () => off(q, 'value', listener)
}

export const fetchNotifications = async (userId: string): Promise<AppNotification[]> => {
  const snapshot = await get(
    query(ref(database, DB_PATHS.NOTIFICATIONS), orderByChild('userId'), equalTo(userId))
  )
  return snapshotToArray<AppNotification>(snapshot)
}

export const subscribeNotifications = (userId: string, callback: (notifs: AppNotification[]) => void) => {
  const dbRef = ref(database, DB_PATHS.NOTIFICATIONS)
  const q = query(dbRef, orderByChild('userId'), equalTo(userId))
  const listener = onValue(q, (snapshot) => {
    callback(snapshotToArray<AppNotification>(snapshot))
  })
  return () => off(q, 'value', listener)
}

export const fetchFavoriteIds = async (userId: string): Promise<string[]> => {
  const snapshot = await get(ref(database, `${DB_PATHS.FAVORITES}/${userId}`))
  if (!snapshot.exists()) return []
  const data = snapshot.val()
  return Object.keys(data).filter((key) => data[key] === true)
}

export const fetchAddOnsByIds = async (ids: string[]): Promise<AddOn[]> => {
  if (!ids.length) return []
  const results = await Promise.all(
    ids.map(async (id) => {
      const snap = await get(ref(database, `${DB_PATHS.ADDONS}/${id}`))
      return snap.exists() ? ({ id, ...snap.val() } as AddOn) : null
    })
  )
  return results.filter(Boolean) as AddOn[]
}

export const fetchReviewByBooking = async (bookingId: string): Promise<Review | null> => {
  const snapshot = await get(ref(database, `${DB_PATHS.REVIEWS}/${bookingId}`))
  return snapshot.exists() ? ({ id: bookingId, ...snapshot.val() } as Review) : null
}

export const fetchPartnerById = async (partnerId: string): Promise<Partner | null> => {
  const snapshot = await get(ref(database, `${DB_PATHS.PARTNERS}/${partnerId}`))
  return snapshot.exists() ? ({ id: partnerId, ...snapshot.val() } as Partner) : null
}

/**
 * Live partner subscription. Keeps the whole partner node (including the
 * partner app's live `currentLocation`) in sync so the customer can track
 * their assigned partner in real time.
 */
export const subscribePartner = (partnerId: string, callback: (partner: Partner | null) => void) => {
  const dbRef = ref(database, `${DB_PATHS.PARTNERS}/${partnerId}`)
  const listener = onValue(dbRef, (snapshot) => {
    callback(snapshot.exists() ? { id: partnerId, ...snapshot.val() } : null)
  })
  return () => off(dbRef, 'value', listener)
}

// ── Chat ─────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  senderId: string
  senderType: 'user' | 'partner'
  text: string
  timestamp: number
  read: boolean
}

export interface Conversation {
  id: string
  bookingId: string
  participants: { userId: string; partnerId: string }
  lastMessage?: string
  lastMessageAt?: number
  lastSenderId?: string
  createdAt: number
  updatedAt: number
}

/** Live conversation metadata (last message preview etc.). */
export const subscribeConversation = (
  conversationId: string,
  callback: (conversation: Conversation | null) => void
) => {
  const dbRef = ref(database, `${DB_PATHS.CONVERSATIONS}/${conversationId}`)
  const listener = onValue(dbRef, (snapshot) => {
    callback(snapshot.exists() ? { id: conversationId, ...snapshot.val() } : null)
  })
  return () => off(dbRef, 'value', listener)
}

/** Live message feed for a conversation, oldest first. */
export const subscribeConversationMessages = (
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
) => {
  const dbRef = ref(database, `${DB_PATHS.CONVERSATIONS}/${conversationId}/messages`)
  const q = query(dbRef, orderByChild('timestamp'))
  const listener = onValue(q, (snapshot) => {
    callback(snapshotToArray<ChatMessage>(snapshot))
  })
  return () => off(q, 'value', listener)
}
