/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildWeatherRequestUrl,
  getBrowserCoordinates,
  parseIpLocationDetails,
  resolveLocationDetails,
  resolveWeatherCoordinates,
  type GeolocationProvider,
} from './weather.service.ts'

test('天气请求使用浏览器定位得到的经纬度', () => {
  const requestUrl = new URL(
    buildWeatherRequestUrl({ latitude: 26.0745, longitude: 119.2965 }),
  )

  assert.equal(requestUrl.searchParams.get('latitude'), '26.0745')
  assert.equal(requestUrl.searchParams.get('longitude'), '119.2965')
  assert.equal(requestUrl.searchParams.get('timezone'), 'auto')
})

test('浏览器定位结果转换为天气查询坐标', async () => {
  const geolocation: GeolocationProvider = {
    getCurrentPosition: (onSuccess) => {
      onSuccess({
        coords: {
          latitude: 26.0745,
          longitude: 119.2965,
        },
      })
    },
  }

  assert.deepEqual(await getBrowserCoordinates(geolocation), {
    latitude: 26.0745,
    longitude: 119.2965,
  })
})

test('定位成功时使用当前坐标，失败时降级到北京坐标', async () => {
  assert.deepEqual(
    await resolveWeatherCoordinates(async () => ({
      latitude: 26.0745,
      longitude: 119.2965,
    })),
    {
      coordinates: { latitude: 26.0745, longitude: 119.2965 },
      isFallbackLocation: false,
    },
  )

  assert.deepEqual(
    await resolveWeatherCoordinates(async () => {
      throw new Error('定位权限被拒绝')
    }),
    {
      coordinates: { latitude: 39.9042, longitude: 116.4074 },
      isFallbackLocation: true,
    },
  )
})

test('精确城市反查为空时使用 IP 城市名称降级', async () => {
  const locationDetails = await resolveLocationDetails(
    async () => ({}),
    async () => ({ city: '福州' }),
  )

  assert.deepEqual(locationDetails, { city: '福州' })
})

test('精确反查只有省份时继续使用更具体的 IP 城市', async () => {
  const locationDetails = await resolveLocationDetails(
    async () => ({ principalSubdivision: '广东省' }),
    async () => ({ city: '福州' }),
  )

  assert.deepEqual(locationDetails, { city: '福州' })
})

test('中文 IP 响应转换为具体的中文城市名称', () => {
  assert.deepEqual(
    parseIpLocationDetails({
      ret: 'ok',
      data: {
        location: ['中国', '福建', '福州', '', '移动'],
      },
    }),
    {
      city: '福州',
      principalSubdivision: '福建',
    },
  )
  assert.deepEqual(parseIpLocationDetails({ ret: 'err' }), {})
})
