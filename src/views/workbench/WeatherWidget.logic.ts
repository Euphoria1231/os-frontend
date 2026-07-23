export type WeatherTone =
  | 'sunny'
  | 'cloudy'
  | 'foggy'
  | 'rainy'
  | 'snowy'
  | 'stormy'
  | 'unknown'

export interface WeatherCondition {
  label: string
  tone: WeatherTone
}

export interface WeatherLocationDetails {
  city?: string
  locality?: string
  principalSubdivision?: string
}

const UNKNOWN_WEATHER: WeatherCondition = {
  label: '天气未知',
  tone: 'unknown',
}

export function getWeatherCondition(code: number): WeatherCondition {
  if (code === 0) return { label: '晴', tone: 'sunny' }
  if (code === 1 || code === 2) return { label: '多云', tone: 'cloudy' }
  if (code === 3) return { label: '阴', tone: 'cloudy' }
  if (code === 45 || code === 48) return { label: '雾', tone: 'foggy' }
  if ([51, 53, 55, 56, 57].includes(code)) {
    return { label: '小雨', tone: 'rainy' }
  }
  if ([61, 66, 80].includes(code)) return { label: '小雨', tone: 'rainy' }
  if ([63, 81].includes(code)) return { label: '中雨', tone: 'rainy' }
  if ([65, 67, 82].includes(code)) return { label: '大雨', tone: 'rainy' }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { label: '降雪', tone: 'snowy' }
  }
  if ([95, 96, 99].includes(code)) {
    return { label: '雷阵雨', tone: 'stormy' }
  }

  return UNKNOWN_WEATHER
}

const WIND_DIRECTIONS = [
  '北风',
  '东北风',
  '东风',
  '东南风',
  '南风',
  '西南风',
  '西风',
  '西北风',
] as const

export function getWindDirectionLabel(degrees: number): string {
  const normalizedDegrees = ((degrees % 360) + 360) % 360
  const directionIndex = Math.round(normalizedDegrees / 45) % WIND_DIRECTIONS.length
  return WIND_DIRECTIONS[directionIndex]
}

export function getWeatherLocationLabel(details: WeatherLocationDetails): string {
  const locationLabel = [details.city, details.locality, details.principalSubdivision]
    .find((value) => typeof value === 'string' && value.trim().length > 0)

  return locationLabel?.trim() ?? '当前位置'
}
