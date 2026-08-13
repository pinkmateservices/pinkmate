export interface LatLng {
  latitude: number
  longitude: number
}

/** Great-circle distance in kilometres (Haversine). */
export function haversineDistanceKm(a: LatLng, b: LatLng): number {
  const R = 6371
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180
  const lat1 = (a.latitude * Math.PI) / 180
  const lat2 = (b.latitude * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Human-friendly distance, e.g. "850 m away" / "2.3 km away". */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m away`
  return `${km.toFixed(1)} km away`
}

/** Rough ETA in minutes given distance (km) and an average travel speed. */
export function formatEtaMinutes(km: number, speedKmh = 20): string {
  const minutes = Math.max(1, Math.round((km / speedKmh) * 60))
  return `${minutes} min`
}
