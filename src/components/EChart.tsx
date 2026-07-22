import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface EChartProps {
  option: EChartsOption;
  height?: number;
}

/** 轻量 ECharts 封装组件 */
export default function EChart({ option, height = 300 }: EChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    // 如果已有实例，先销毁再重建
    if (chartRef.current) {
      chartRef.current.dispose();
    }

    chartRef.current = echarts.init(ref.current);
    chartRef.current.setOption(option);

    const handleResize = () => chartRef.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, [option]);

  return <div ref={ref} style={{ width: '100%', height }} />;
}
