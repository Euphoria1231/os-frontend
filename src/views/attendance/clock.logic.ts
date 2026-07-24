import dayjs from 'dayjs'

const EARTH_RADIUS_METERS = 6_371_008.8

export interface GeoPoint {
  longitude: number
  latitude: number
}

export interface ClockRecordState {
  clockInTime: string | null
  clockOutTime: string | null
}

export type ClockAction =
  | 'MORNING_CLOCK'
  | 'WAITING_AFTERNOON'
  | 'AFTERNOON_CLOCK'
  | 'COMPLETED'

export function resolveClockAction(
  today: ClockRecordState | null,
  currentTime: string,
  afternoonClockStartTime: string,
): ClockAction {
  if (today?.clockOutTime) return 'COMPLETED'
  if (currentTime >= afternoonClockStartTime) return 'AFTERNOON_CLOCK'
  if (today?.clockInTime) return 'WAITING_AFTERNOON'
  return 'MORNING_CLOCK'
}

export function hasAttendanceDateChanged(
  previousDate: string,
  currentDate: string,
): boolean {
  return previousDate !== currentDate
}

export function calculateDistanceMeters(
  center: GeoPoint,
  current: GeoPoint,
): number {
  const centerLatitude = toRadians(center.latitude)
  const currentLatitude = toRadians(current.latitude)
  const latitudeDelta = currentLatitude - centerLatitude
  const longitudeDelta = toRadians(current.longitude - center.longitude)
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(centerLatitude) * Math.cos(currentLatitude)
    * Math.sin(longitudeDelta / 2) ** 2
  const normalizedHaversine = Math.min(1, Math.max(0, haversine))
  const angularDistance = 2 * Math.atan2(
    Math.sqrt(normalizedHaversine),
    Math.sqrt(1 - normalizedHaversine),
  )
  return EARTH_RADIUS_METERS * angularDistance
}

export function isInsideGeofence(
  distanceMeters: number,
  radiusMeters: number,
): boolean {
  return distanceMeters <= radiusMeters
}

export function formatClockTime(value: string | null | undefined): string {
  return value ? dayjs(value).format('HH:mm:ss') : '未打卡'
}

function toRadians(value: number): number {
  return value * Math.PI / 180
}
