import { useState, useEffect } from 'react'

const BASE_URL = process.env.EXPO_PUBLIC_COUNTRY_BASE_URL as string
const API_KEY = process.env.EXPO_PUBLIC_COUNTRY_API_KEY as string
const COUNTRY = 'IN'

const headers = { 'X-CSCAPI-KEY': API_KEY }

export type LocationItem = { iso2: string; name: string }

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}v1/${path}`, { headers })
  if (!res.ok) throw new Error(`Failed to fetch ${path}`)
  return res.json()
}

export function useIndiaStates() {
  const [states, setStates] = useState<LocationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJson<LocationItem[]>(`countries/${COUNTRY}/states`)
      .then((data) => setStates([...data].sort((a, b) => a.name.localeCompare(b.name))))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { states, loading }
}

export function useIndiaCities(stateIso2: string) {
  const [citiesMap, setCitiesMap] = useState<Record<string, LocationItem[]>>({})

  useEffect(() => {
    if (!stateIso2 || citiesMap[stateIso2]) return
    const controller = new AbortController()
    fetch(`${BASE_URL}v1/countries/${COUNTRY}/states/${stateIso2}/cities`, {
      headers,
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data: LocationItem[]) =>
        setCitiesMap((prev) => ({
          ...prev,
          [stateIso2]: [...data].sort((a, b) => a.name.localeCompare(b.name)),
        }))
      )
      .catch((e) => { if (e.name !== 'AbortError') console.error(e) })
    return () => controller.abort()
  }, [stateIso2]) // eslint-disable-line react-hooks/exhaustive-deps

  const entry = citiesMap[stateIso2]
  return {
    cities: Array.isArray(entry) ? entry : [],
    loading: !!stateIso2 && !entry,
  }
}

// ── GPS coordinates ──────────────────────────────────────────
import * as Location from 'expo-location'

export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * Requests foreground location permission and returns the device's
 * current GPS coordinates. Call this after sign-in or when you need
 * to assign the nearest service provider.
 *
 * Returns null if permission is denied or location unavailable.
 */
export async function getCurrentCoordinates(): Promise<Coordinates | null> {
  const { status } = await Location.requestForegroundPermissionsAsync()
  if (status !== 'granted') return null

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  })

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  }
}

/**
 * Hook that fetches coordinates once on mount.
 * Use in screens that need to know the user's position reactively.
 */
export function useCurrentLocation() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [loading, setLoading] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)

  async function refresh() {
    setLoading(true)
    const coords = await getCurrentCoordinates()
    if (coords) {
      setCoordinates(coords)
      setPermissionDenied(false)
    } else {
      setPermissionDenied(true)
    }
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  return { coordinates, loading, permissionDenied, refresh }
}
