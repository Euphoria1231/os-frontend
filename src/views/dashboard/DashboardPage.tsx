import { memo, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { EChartsCoreOption } from 'echarts/core'
import {
  ApartmentOutlined,
  ArrowLeftOutlined,
  ClusterOutlined,
  GlobalOutlined,
  RadarChartOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/auth/useAuth.ts'
import { ChinaNetworkMap } from './ChinaNetworkMap.tsx'
import { dashboardMockData, type DashboardEvent } from './dashboard.data.ts'
import {
  assertDashboardDataConsistency,
  createDashboardEvent,
  createSeededRandom,
  getDashboardReturnPath,
  getMetricCountUpValue,
  getNextEventDelay,
} from './dashboard.logic.ts'
import { EChartPanel } from './EChartPanel.tsx'
import './DashboardPage.less'

const INITIAL_EVENT_TOTAL = 8426

const metricCards = [
  {
    label: '员工总数',
    value: dashboardMockData.employeeTotal,
    unit: '人',
    icon: <TeamOutlined />,
    code: 'PEOPLE',
  },
  {
    label: '部门数量',
    value: dashboardMockData.departmentCount,
    unit: '个',
    icon: <ApartmentOutlined />,
    code: 'DEPARTMENT',
  },
  {
    label: '岗位数量',
    value: dashboardMockData.positionCount,
    unit: '个',
    icon: <ClusterOutlined />,
    code: 'POSITION',
  },
  {
    label: '覆盖城市',
    value: dashboardMockData.cityCount,
    unit: '座',
    icon: <GlobalOutlined />,
    code: 'NETWORK',
  },
]

function getTodaySeed(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
}

function formatClock(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).format(date)
}

function formatEventTime(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

export const DashboardPage = memo(function DashboardPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [dataError] = useState(() => {
    try {
      assertDashboardDataConsistency()
      return false
    } catch {
      return true
    }
  })
  const [now, setNow] = useState(() => new Date())
  const [metricProgress, setMetricProgress] = useState(0)
  const [eventTotal, setEventTotal] = useState(INITIAL_EVENT_TOTAL)
  const [latestEvent, setLatestEvent] = useState<DashboardEvent>()
  const [recentEvents, setRecentEvents] = useState<DashboardEvent[]>([])
  const totalRef = useRef(INITIAL_EVENT_TOTAL)
  const randomRef = useRef(createSeededRandom(getTodaySeed(new Date())))

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let frameId = 0
    const startedAt = performance.now()
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 1200

    const updateMetricProgress = (time: number) => {
      const progress = Math.min((time - startedAt) / duration, 1)
      setMetricProgress(progress)
      if (progress < 1) {
        frameId = window.requestAnimationFrame(updateMetricProgress)
      }
    }

    frameId = window.requestAnimationFrame(updateMetricProgress)
    return () => window.cancelAnimationFrame(frameId)
  }, [])

  useEffect(() => {
    if (dataError) {
      return
    }

    let timer: number | undefined
    let active = true

    const scheduleNextEvent = () => {
      const random = randomRef.current
      timer = window.setTimeout(() => {
        if (!active) {
          return
        }

        const nextEvent = createDashboardEvent(totalRef.current, random, new Date())
        totalRef.current = nextEvent.total
        setEventTotal(nextEvent.total)
        setLatestEvent(nextEvent)
        setRecentEvents((current) => [nextEvent, ...current].slice(0, 5))
        scheduleNextEvent()
      }, getNextEventDelay(random))
    }

    scheduleNextEvent()
    return () => {
      active = false
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [dataError])

  const departmentOption = useMemo<EChartsCoreOption>(
    () => ({
      animationDuration: 900,
      animationEasing: 'cubicOut',
      grid: { top: 16, right: 24, bottom: 16, left: 8, containLabel: true },
      tooltip: {
        trigger: 'item',
        formatter: '{b}<br/><strong>{c}</strong> 人',
        backgroundColor: 'rgba(3, 20, 44, 0.94)',
        borderColor: '#1bd7ff',
        textStyle: { color: '#dffaff' },
      },
      xAxis: {
        type: 'value',
        max: 700,
        splitNumber: 4,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#698aa6', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(79, 148, 190, 0.12)' } },
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: dashboardMockData.departments.map((item) => item.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#c9e8f7', fontSize: 11, margin: 12 },
      },
      series: [
        {
          type: 'bar',
          barWidth: 8,
          showBackground: true,
          backgroundStyle: { color: 'rgba(44, 133, 180, 0.08)', borderRadius: 8 },
          itemStyle: {
            borderRadius: 8,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#1468c7' },
                { offset: 0.62, color: '#16c4e7' },
                { offset: 1, color: '#8ff8ff' },
              ],
            },
            shadowColor: 'rgba(36, 225, 255, 0.45)',
            shadowBlur: 12,
          },
          emphasis: { itemStyle: { shadowBlur: 22, shadowColor: '#72f4ff' } },
          label: {
            show: true,
            position: 'right',
            color: '#e8fbff',
            fontFamily: 'Bahnschrift',
            fontSize: 11,
          },
          data: dashboardMockData.departments.map((item) => item.value),
        },
      ],
    }),
    [],
  )

  const positionOption = useMemo<EChartsCoreOption>(
    () => ({
      animationDuration: 1100,
      title: {
        text: dashboardMockData.employeeTotal.toLocaleString('zh-CN'),
        subtext: '员工总数',
        left: 'center',
        top: '28%',
        textStyle: { color: '#f3fbff', fontSize: 18, fontWeight: 700 },
        subtextStyle: { color: '#6287a1', fontSize: 9, lineHeight: 18 },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}<br/><strong>{c}</strong> 人 · {d}%',
        backgroundColor: 'rgba(3, 20, 44, 0.94)',
        borderColor: '#7298ff',
        textStyle: { color: '#eff6ff' },
      },
      legend: {
        bottom: 4,
        left: 'center',
        width: '96%',
        itemWidth: 7,
        itemHeight: 7,
        itemGap: 10,
        textStyle: { color: '#8fb0c8', fontSize: 9 },
      },
      series: [
        {
          type: 'pie',
          radius: ['43%', '68%'],
          center: ['50%', '42%'],
          minAngle: 5,
          padAngle: 2,
          itemStyle: {
            borderRadius: 5,
            borderColor: '#06172e',
            borderWidth: 2,
          },
          label: { show: false },
          emphasis: {
            scaleSize: 8,
            label: {
              show: true,
              position: 'center',
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 700,
              formatter: '{b}\n{d}%',
            },
          },
          data: dashboardMockData.positions.map((item, index) => ({
            ...item,
            itemStyle: {
              color: ['#19d8ff', '#357dff', '#756dff', '#24b9c9', '#3dd99f', '#94a7bc'][index],
              shadowColor: 'rgba(29, 216, 255, 0.3)',
              shadowBlur: 10,
            },
          })),
        },
      ],
    }),
    [],
  )

  if (dataError) {
    return (
      <main className="showcase-dashboard">
        <div className="dashboard-data-error" role="alert">
          <span>DEMO DATA UNAVAILABLE</span>
          <strong>演示数据加载失败</strong>
          <small>请检查 Mock 数据口径后重试</small>
        </div>
      </main>
    )
  }

  return (
    <main className="showcase-dashboard">
      <div className="showcase-dashboard__atmosphere" aria-hidden="true" />

      <header className="showcase-dashboard__header">
        <button
          type="button"
          className="showcase-dashboard__back"
          onClick={() => navigate(getDashboardReturnPath(isAuthenticated))}
        >
          <ArrowLeftOutlined />
          <span>返回</span>
        </button>

        <div className="showcase-dashboard__title">
          <span>ENTERPRISE DIGITAL NERVE CENTER</span>
          <h1>企业数字协同驾驶舱</h1>
        </div>

        <div className="showcase-dashboard__clock" aria-label="当前时间">
          <strong>{formatClock(now)}</strong>
          <span>{formatDate(now)}</span>
        </div>
      </header>

      <section className="showcase-dashboard__metrics" aria-label="企业核心指标">
        {metricCards.map((metric, index) => (
          <article
            className="dashboard-metric"
            style={{ '--metric-delay': `${index * 90}ms` } as CSSProperties}
            key={metric.code}
          >
            <span className="dashboard-metric__icon">{metric.icon}</span>
            <span className="dashboard-metric__copy">
              <small>{metric.label}</small>
              <strong>
                {getMetricCountUpValue(metric.value, metricProgress).toLocaleString('zh-CN')}
                <em>{metric.unit}</em>
              </strong>
            </span>
            <code>{metric.code}</code>
          </article>
        ))}
      </section>

      <section className="showcase-dashboard__body">
        <article className="dashboard-panel dashboard-panel--left">
          <header className="dashboard-panel__header">
            <div>
              <span>ORGANIZATION SCALE</span>
              <h2>部门人才分布</h2>
            </div>
            <RadarChartOutlined />
          </header>
          <EChartPanel
            ariaLabel="各部门员工人数横向柱状图"
            option={departmentOption}
          />
        </article>

        <article className="dashboard-map-shell">
          <div className="dashboard-map-shell__heading">
            <span>NATIONAL COLLABORATION NETWORK</span>
            <strong>全国协同网络</strong>
          </div>

          <div className="dashboard-map-shell__status">
            <div>
              <span>今日协同事件</span>
              <strong>{eventTotal.toLocaleString('zh-CN')}</strong>
            </div>
            <div>
              <span>在线区域节点</span>
              <strong>10<em>/10</em></strong>
            </div>
          </div>

          <ChinaNetworkMap cities={dashboardMockData.cities} latestEvent={latestEvent} />

          <div className={`dashboard-live-event${latestEvent ? ' is-active' : ''}`}>
            <span className="dashboard-live-event__signal" />
            {latestEvent ? (
              <>
                <small>{latestEvent.cityName} REGION</small>
                <strong>{latestEvent.type}</strong>
                <em>+{latestEvent.amount}</em>
              </>
            ) : (
              <>
                <small>NETWORK READY</small>
                <strong>全国节点已连接</strong>
              </>
            )}
          </div>
        </article>

        <article className="dashboard-panel dashboard-panel--right">
          <header className="dashboard-panel__header">
            <div>
              <span>TALENT COMPOSITION</span>
              <h2>岗位人才构成</h2>
            </div>
            <ClusterOutlined />
          </header>
          <EChartPanel
            ariaLabel="岗位人才构成环形图"
            option={positionOption}
          />
        </article>
      </section>

      <footer className="dashboard-event-stream">
        <span className="dashboard-event-stream__label">
          <i /> 全国协同动态
        </span>
        <div className="dashboard-event-stream__viewport">
          {recentEvents.length ? (
            <div className="dashboard-event-stream__items">
              {recentEvents.map((event) => (
                <span key={event.id}>
                  <time>{formatEventTime(event.occurredAt)}</time>
                  <strong>{event.cityName}</strong>区域节点新增
                  <em>{event.amount}</em>次{event.type}事件
                </span>
              ))}
            </div>
          ) : (
            <span className="dashboard-event-stream__waiting">全国区域节点已就绪，正在建立实时协同链路</span>
          )}
        </div>
      </footer>
    </main>
  )
})
