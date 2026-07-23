import { memo, useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption, EChartsType } from 'echarts/core'

echarts.use([
  BarChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  CanvasRenderer,
])

interface EChartPanelProps {
  ariaLabel: string
  option: EChartsCoreOption
}

export const EChartPanel = memo(function EChartPanel({
  ariaLabel,
  option,
}: EChartPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    let chart: EChartsType | undefined
    let resizeObserver: ResizeObserver | undefined

    try {
      chart = echarts.init(container, undefined, { renderer: 'canvas' })
      chart.setOption(option, true)

      resizeObserver = new ResizeObserver(() => chart?.resize())
      resizeObserver.observe(container)
    } catch {
      setFailed(true)
    }

    return () => {
      resizeObserver?.disconnect()
      chart?.dispose()
    }
  }, [option])

  return (
    <div className="dashboard-chart-stage" aria-label={ariaLabel}>
      <div ref={containerRef} className="dashboard-chart-canvas" />
      {failed && <div className="dashboard-visual-fallback">图表暂时无法加载</div>}
    </div>
  )
})
