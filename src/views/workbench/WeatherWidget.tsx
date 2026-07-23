import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { AimOutlined, EnvironmentOutlined } from '@ant-design/icons'
import {
  getCurrentLocationWeather,
  type LocatedWeather,
} from '../../services/weather/weather.service.ts'
import {
  getWeatherCondition,
  getWeatherLocationLabel,
  getWindDirectionLabel,
  type WeatherCondition,
} from './WeatherWidget.logic.ts'
import './WeatherWidget.less'

type WeatherLoadStatus = 'locating' | 'ready' | 'fallback' | 'error'

export const WeatherWidget = memo(function WeatherWidget() {
  const [weather, setWeather] = useState<LocatedWeather | null>(null)
  const [status, setStatus] = useState<WeatherLoadStatus>('locating')
  const requestControllerRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)

  const loadWeather = useCallback(() => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    requestControllerRef.current?.abort()

    const controller = new AbortController()
    requestControllerRef.current = controller
    setStatus('locating')

    void getCurrentLocationWeather(controller.signal)
      .then((currentWeather) => {
        if (requestId !== requestIdRef.current) return
        setWeather(currentWeather)
        setStatus(currentWeather.isFallbackLocation ? 'fallback' : 'ready')
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        if (requestId === requestIdRef.current) setStatus('error')
      })
  }, [])

  useEffect(() => {
    loadWeather()

    return () => {
      requestIdRef.current += 1
      requestControllerRef.current?.abort()
    }
  }, [loadWeather])

  const condition: WeatherCondition = weather
    ? getWeatherCondition(weather.weatherCode)
    : {
        label: status === 'locating' ? '正在定位' : '天气暂不可用',
        tone: 'unknown',
      }
  const locationLabel = weather
    ? getWeatherLocationLabel(weather.locationDetails)
    : status === 'locating'
      ? '正在定位'
      : '位置未知'
  const temperatureLabel = weather ? `${Math.round(weather.temperature)}°` : '--°'
  const humidityLabel = weather ? `${Math.round(weather.humidity)}%` : '--'
  const windLabel = weather
    ? `${getWindDirectionLabel(weather.windDirection)} ${Math.round(weather.windSpeed)} km/h`
    : '--'

  return (
    <aside
      className={`weather-widget is-${condition.tone}`}
      aria-label={`${locationLabel}实时天气`}
      aria-live="polite"
      title={
        status === 'fallback'
          ? '未获得当前位置，当前显示北京天气'
          : status === 'error'
            ? '实时天气暂时无法更新，请稍后重试'
            : undefined
      }
    >
      <div className="weather-widget-illustration" aria-hidden="true">
        <span className="weather-widget-sun" />
        <span className="weather-widget-cloud" />
        <span className="weather-widget-precipitation">
          <i />
          <i />
          <i />
        </span>
        <span className="weather-widget-lightning" />
        <span className="weather-widget-fog">
          <i />
          <i />
        </span>
      </div>

      <div className="weather-widget-reading">
        <strong>{temperatureLabel}</strong>
        <span>{condition.label}</span>
      </div>

      <span className="weather-widget-divider" aria-hidden="true" />

      <div className="weather-widget-details">
        <div className="weather-widget-location">
          <strong title={locationLabel}>
            <EnvironmentOutlined />
            {locationLabel}
          </strong>
          <button
            type="button"
            className={status === 'locating' ? 'is-locating' : undefined}
            onClick={loadWeather}
            disabled={status === 'locating'}
            aria-label="重新获取当前位置天气"
            title="重新定位"
          >
            <AimOutlined />
          </button>
        </div>
        <span>湿度 {humidityLabel}</span>
        <span>{windLabel}</span>
      </div>
    </aside>
  )
})
