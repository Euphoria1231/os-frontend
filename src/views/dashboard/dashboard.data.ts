export type DashboardEventType =
  | '文档协作'
  | '流程协同'
  | '知识检索'
  | '远程会议'
  | '跨区域消息'

export interface DashboardNameValue {
  name: string
  value: number
}

export interface DashboardCity {
  id: string
  name: string
  kind: 'HEADQUARTERS' | 'REGIONAL'
  coordinate: readonly [longitude: number, latitude: number]
  employees: number
}

export interface DashboardEvent {
  id: string
  cityId: string
  cityName: string
  type: DashboardEventType
  amount: number
  total: number
  occurredAt: Date
}

const departments: DashboardNameValue[] = [
  { name: '技术研发', value: 620 },
  { name: '销售', value: 280 },
  { name: '产品与设计', value: 260 },
  { name: '市场', value: 250 },
  { name: '客户与运营', value: 150 },
  { name: '职能与管理', value: 130 },
]

const positions: DashboardNameValue[] = [
  { name: '研发工程', value: 520 },
  { name: '销售', value: 300 },
  { name: '市场与运营', value: 260 },
  { name: '产品与设计', value: 250 },
  { name: '客户成功与支持', value: 200 },
  { name: '职能与管理', value: 160 },
]

const cities: DashboardCity[] = [
  {
    id: 'beijing',
    name: '北京',
    kind: 'HEADQUARTERS',
    coordinate: [116.4074, 39.9042],
    employees: 420,
  },
  {
    id: 'shanghai',
    name: '上海',
    kind: 'REGIONAL',
    coordinate: [121.4737, 31.2304],
    employees: 260,
  },
  {
    id: 'shenzhen',
    name: '深圳',
    kind: 'REGIONAL',
    coordinate: [114.0579, 22.5431],
    employees: 240,
  },
  {
    id: 'guangzhou',
    name: '广州',
    kind: 'REGIONAL',
    coordinate: [113.2644, 23.1291],
    employees: 170,
  },
  {
    id: 'hangzhou',
    name: '杭州',
    kind: 'REGIONAL',
    coordinate: [120.1551, 30.2741],
    employees: 150,
  },
  {
    id: 'chengdu',
    name: '成都',
    kind: 'REGIONAL',
    coordinate: [104.0665, 30.5728],
    employees: 130,
  },
  {
    id: 'wuhan',
    name: '武汉',
    kind: 'REGIONAL',
    coordinate: [114.3055, 30.5928],
    employees: 110,
  },
  {
    id: 'xian',
    name: '西安',
    kind: 'REGIONAL',
    coordinate: [108.9398, 34.3416],
    employees: 90,
  },
  {
    id: 'nanjing',
    name: '南京',
    kind: 'REGIONAL',
    coordinate: [118.7969, 32.0603],
    employees: 70,
  },
  {
    id: 'chongqing',
    name: '重庆',
    kind: 'REGIONAL',
    coordinate: [106.5516, 29.563],
    employees: 50,
  },
]

const eventTypes: DashboardEventType[] = [
  '文档协作',
  '流程协同',
  '知识检索',
  '远程会议',
  '跨区域消息',
]

export const dashboardMockData = {
  employeeTotal: 1690,
  departmentCount: departments.length,
  positionCount: 28,
  cityCount: cities.length,
  departments,
  positions,
  cities,
  eventTypes,
}
