import {
  dashboardMockData,
  type DashboardEvent,
  type DashboardNameValue,
} from './dashboard.data.ts'

export interface DashboardDataTotals {
  departments: number
  positions: number
  cities: number
}

function sumValues(items: readonly DashboardNameValue[]): number {
  return items.reduce((total, item) => total + item.value, 0)
}

export function getDashboardDataTotals(): DashboardDataTotals {
  return {
    departments: sumValues(dashboardMockData.departments),
    positions: sumValues(dashboardMockData.positions),
    cities: dashboardMockData.cities.reduce((total, city) => total + city.employees, 0),
  }
}

export function assertDashboardDataConsistency(): void {
  const totals = getDashboardDataTotals()
  const expected = dashboardMockData.employeeTotal

  if (Object.values(totals).some((total) => total !== expected)) {
    throw new Error('Dashboard Mock 数据人数口径不一致')
  }

  if (dashboardMockData.departmentCount !== dashboardMockData.departments.length) {
    throw new Error('Dashboard Mock 部门数量不一致')
  }

  if (dashboardMockData.cityCount !== dashboardMockData.cities.length) {
    throw new Error('Dashboard Mock 城市数量不一致')
  }
}

export function createSeededRandom(seed: number): () => number {
  let value = seed >>> 0

  return () => {
    value += 0x6d2b79f5
    let result = value
    result = Math.imul(result ^ (result >>> 15), result | 1)
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

function pickIndex(length: number, random: () => number): number {
  return Math.min(length - 1, Math.floor(random() * length))
}

export function createDashboardEvent(
  previousTotal: number,
  random: () => number,
  occurredAt: Date,
): DashboardEvent {
  const regionalCities = dashboardMockData.cities.filter((city) => city.kind === 'REGIONAL')
  const city = regionalCities[pickIndex(regionalCities.length, random)]
  const type = dashboardMockData.eventTypes[pickIndex(dashboardMockData.eventTypes.length, random)]
  const amount = 12 + Math.floor(random() * 25)

  return {
    id: `${occurredAt.getTime()}-${city.id}`,
    cityId: city.id,
    cityName: city.name,
    type,
    amount,
    total: previousTotal + amount,
    occurredAt,
  }
}

export function getNextEventDelay(random: () => number): number {
  return Math.min(5000, 3000 + Math.round(random() * 2000))
}

export function getMetricCountUpValue(target: number, progress: number): number {
  const normalizedProgress = Math.min(1, Math.max(0, progress))
  const easedProgress = 1 - (1 - normalizedProgress) ** 3
  return Math.round(target * easedProgress)
}

export function getDashboardReturnPath(isAuthenticated: boolean): '/workspace' | '/login' {
  return isAuthenticated ? '/workspace' : '/login'
}
