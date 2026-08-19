export const DB_PATHS = {
  USERS: 'users',
  CATEGORIES: 'categories',
  SUB_CATEGORIES: 'subCategories',
  SERVICES: 'services',
  ADDONS: 'addons',
  BANNERS: 'banners',
  TESTIMONIALS: 'testimonials',
  COUPONS: 'coupons',
  PARTNERS: 'partners',
  BOOKINGS: 'bookings',
  NOTIFICATIONS: 'notifications',
  ADDRESSES: 'addresses',
  FAVORITES: 'favorites',
  REVIEWS: 'reviews',
  JOB_REQUESTS: 'jobRequests',
  SETTINGS: 'settings',
  CONVERSATIONS: 'conversations',
  SUPPORT_TICKETS: 'supportTickets',
} as const

export const BOOKING_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PARTNER_ASSIGNED: 'Partner Assigned',
  ON_THE_WAY: 'On The Way',
  SERVICE_STARTED: 'Service Started',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
} as const

export const SERVICE_TYPES = {
  AT_HOME: 'At Home',
  AT_SALON: 'At Salon',
} as const

export const PAYMENT_METHODS = {
  CASH: 'Cash',
  CARD: 'Card',
  ONLINE: 'Online',
} as const

export const GENDERS = ['Male', 'Female', 'Other'] as const

export const SORT_OPTIONS = {
  PRICE_LOW: 'Price: Low to High',
  PRICE_HIGH: 'Price: High to Low',
  NAME_AZ: 'Name: A to Z',
  NAME_ZA: 'Name: Z to A',
  POPULARITY: 'Popularity',
} as const

export const BOOKING_STATUS_FLOW = [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.PARTNER_ASSIGNED,
  BOOKING_STATUS.ON_THE_WAY,
  BOOKING_STATUS.SERVICE_STARTED,
  BOOKING_STATUS.COMPLETED,
] as const

export const JOB_REQUEST_STATUS = {
  OPEN: 'open',
  ASSIGNED: 'assigned',
  EXPIRED: 'expired',
} as const

/** Seconds a partner has to accept a broadcast job before it is expired. */
export const ACCEPT_COUNTDOWN_SECONDS = 45
