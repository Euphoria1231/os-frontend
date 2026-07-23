const OPEN_METEO_CURRENT_URL = 'https://api.open-meteo.com/v1/forecast'
const REVERSE_GEOCODING_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client'

export interface WeatherCoordinates {
  latitude: number
  longitude: number
}

interface BrowserPosition {
  coords: WeatherCoordinates
}

interface BrowserPositionError {
  message?: string
}

export interface GeolocationProvider {
  getCurrentPosition: (
    onSuccess: (position: BrowserPosition) => void,
    onError?: (error: BrowserPositionError) => void,
    options?: PositionOptions,
  ) => void
}

export interface CurrentWeather {
  temperature: number
  humidity: number
  weatherCode: number
  windSpeed: number
  windDirection: number
}

export interface ReverseLocationDetails {
  city?: string
  locality?: string
  principalSubdivision?: string
}

export interface LocatedWeather extends CurrentWeather {
  locationDetails: ReverseLocationDetails
  isFallbackLocation: boolean
}

export interface ResolvedWeatherCoordinates {
  coordinates: WeatherCoordinates
  isFallbackLocation: boolean
}

interface OpenMeteoCurrent {
  temperature_2m: number
  relative_humidity_2m: number
  weather_code: number
  wind_speed_10m: number
  wind_direction_10m: number
}

interface OpenMeteoResponse {
  current: OpenMeteoCurrent
}

const BEIJING_COORDINATES: WeatherCoordinates = {
  latitude: 39.9042,
  longitude: 116.4074,
}

function getDefaultGeolocationProvider(): GeolocationProvider | null {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return null
  return navigator.geolocation
}

export function getBrowserCoordinates(
  geolocation: GeolocationProvider | null = getDefaultGeolocationProvider(),
): Promise<WeatherCoordinates> {
  if (!geolocation) return Promise.reject(new Error('当前浏览器无法使用定位服务'))

  return new Promise((resolve, reject) => {
    geolocation.getCurrentPosition(
      ({ coords }) => {
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
        })
      },
      (error) => reject(new Error(error.message || '无法获取当前位置')),
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 300_000,
      },
    )
  })
}

export async function resolveWeatherCoordinates(
  getCoordinates: () => Promise<WeatherCoordinates> = () => getBrowserCoordinates(),
): Promise<ResolvedWeatherCoordinates> {
  try {
    return {
      coordinates: await getCoordinates(),
      isFallbackLocation: false,
    }
  } catch {
    return {
      coordinates: BEIJING_COORDINATES,
      isFallbackLocation: true,
    }
  }
}

export function buildWeatherRequestUrl(coordinates: WeatherCoordinates): string {
  const searchParams = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
    ].join(','),
    wind_speed_unit: 'kmh',
    timezone: 'auto',
  })

  return `${OPEN_METEO_CURRENT_URL}?${searchParams}`
}

function isOpenMeteoResponse(value: unknown): value is OpenMeteoResponse {
  if (!value || typeof value !== 'object' || !('current' in value)) return false

  const { current } = value
  if (!current || typeof current !== 'object') return false

  return [
    'temperature_2m',
    'relative_humidity_2m',
    'weather_code',
    'wind_speed_10m',
    'wind_direction_10m',
  ].every((field) => field in current && typeof current[field as keyof typeof current] === 'number')
}

function getOptionalString(
  value: Record<string, unknown>,
  field: string,
): string | undefined {
  const candidate = value[field]
  return typeof candidate === 'string' && candidate.trim() ? candidate : undefined
}

async function getReverseLocationDetails(
  coordinates: WeatherCoordinates,
  signal?: AbortSignal,
): Promise<ReverseLocationDetails> {
  const searchParams = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
    localityLanguage: 'zh',
  })

  try {
    const response = await fetch(`${REVERSE_GEOCODING_URL}?${searchParams}`, { signal })
    if (!response.ok) return {}

    const data: unknown = await response.json()
    if (!data || typeof data !== 'object') return {}

    const record = data as Record<string, unknown>
    return {
      city: getOptionalString(record, 'city'),
      locality: getOptionalString(record, 'locality'),
      principalSubdivision: getOptionalString(record, 'principalSubdivision'),
    }
  } catch (error) {
    if (signal?.aborted) throw error
    return {}
  }
}

async function getCurrentWeather(
  coordinates: WeatherCoordinates,
  signal?: AbortSignal,
): Promise<CurrentWeather> {
  const response = await fetch(buildWeatherRequestUrl(coordinates), { signal })
  if (!response.ok) throw new Error('天气服务响应异常')

  const data: unknown = await response.json()
  if (!isOpenMeteoResponse(data)) throw new Error('天气服务返回格式异常')

  return {
    temperature: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    weatherCode: data.current.weather_code,
    windSpeed: data.current.wind_speed_10m,
    windDirection: data.current.wind_direction_10m,
  }
}

export async function getCurrentLocationWeather(
  signal?: AbortSignal,
): Promise<LocatedWeather> {
  const resolvedLocation = await resolveWeatherCoordinates()
  signal?.throwIfAborted()

  const [weather, locationDetails] = await Promise.all([
    getCurrentWeather(resolvedLocation.coordinates, signal),
    resolvedLocation.isFallbackLocation
      ? Promise.resolve<ReverseLocationDetails>({ city: '北京（默认）' })
      : getReverseLocationDetails(resolvedLocation.coordinates, signal),
  ])

  return {
    ...weather,
    locationDetails,
    isFallbackLocation: resolvedLocation.isFallbackLocation,
  }
}
