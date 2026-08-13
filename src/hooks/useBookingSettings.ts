import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { database } from '../config/firebase'
import { DB_PATHS } from '../config/constants'

export const DEFAULT_TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM', '07:00 PM',
]

// JS getDay() values: 0 = Sunday … 6 = Saturday.
export const DEFAULT_WORKING_DAYS = [0, 1, 2, 3, 4, 5, 6]

export type BookingSettings = {
  timeSlots: string[]
  workingDays: number[]
}

/**
 * Live booking schedule configured from the admin dashboard: available time
 * slots and days of the week on which customers can place bookings.
 */
export const useBookingSettings = () => {
  const [settings, setSettings] = useState<BookingSettings>({
    timeSlots: DEFAULT_TIME_SLOTS,
    workingDays: DEFAULT_WORKING_DAYS,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsub = onValue(ref(database, `${DB_PATHS.SETTINGS}/booking`), (snap) => {
      const val = snap.val()
      if (!val || typeof val !== 'object') {
        setSettings({
          timeSlots: DEFAULT_TIME_SLOTS,
          workingDays: DEFAULT_WORKING_DAYS,
        })
      } else {
        const raw = val as Partial<BookingSettings>
        setSettings({
          timeSlots: Array.isArray(raw.timeSlots)
            ? raw.timeSlots.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
            : DEFAULT_TIME_SLOTS,
          workingDays: Array.isArray(raw.workingDays)
            ? raw.workingDays.filter((d): d is number => Number.isInteger(d) && d >= 0 && d <= 6)
            : DEFAULT_WORKING_DAYS,
        })
      }
      setIsLoading(false)
    })
    return unsub
  }, [])

  return { settings, isLoading }
}
