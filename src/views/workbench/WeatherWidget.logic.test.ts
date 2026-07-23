/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getWeatherCondition,
  getWeatherLocationLabel,
  getWindDirectionLabel,
} from './WeatherWidget.logic.ts'

test('WMO 天气代码映射为工作台可读的天气状态', () => {
  assert.deepEqual(getWeatherCondition(0), { label: '晴', tone: 'sunny' })
  assert.deepEqual(getWeatherCondition(2), { label: '多云', tone: 'cloudy' })
  assert.deepEqual(getWeatherCondition(63), { label: '中雨', tone: 'rainy' })
  assert.deepEqual(getWeatherCondition(95), { label: '雷阵雨', tone: 'stormy' })
  assert.deepEqual(getWeatherCondition(999), { label: '天气未知', tone: 'unknown' })
})

test('风向角度映射为八方位中文标签', () => {
  assert.equal(getWindDirectionLabel(0), '北风')
  assert.equal(getWindDirectionLabel(90), '东风')
  assert.equal(getWindDirectionLabel(225), '西南风')
  assert.equal(getWindDirectionLabel(359), '北风')
})

test('定位名称优先显示城市并在缺失时逐级降级', () => {
  assert.equal(
    getWeatherLocationLabel({
      city: '福州市',
      locality: '鼓楼区',
      principalSubdivision: '福建省',
    }),
    '福州市',
  )
  assert.equal(getWeatherLocationLabel({ locality: '鼓楼区' }), '鼓楼区')
  assert.equal(getWeatherLocationLabel({ principalSubdivision: '福建省' }), '福建省')
  assert.equal(getWeatherLocationLabel({}), '当前位置')
})
