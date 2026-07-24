/// <reference types="node" />

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const pageSource = readFileSync(new URL('./NoticePage.tsx', import.meta.url), 'utf8')
const styleSource = readFileSync(new URL('./NoticePage.less', import.meta.url), 'utf8')

test('公告详情使用居中 Modal 而不是侧边 Drawer', () => {
  assert.doesNotMatch(pageSource, /\bDrawer\b/)
  assert.match(pageSource, /<Modal\s+className="notice-detail-modal"/)
  assert.match(pageSource, /title="公告详情"/)
  assert.match(pageSource, /width=\{720\}/)
  assert.match(pageSource, /\n\s+centered\n/)
})

test('公告详情弹窗限制内容高度并支持内部滚动', () => {
  assert.match(styleSource, /\.notice-detail-modal/)
  assert.match(styleSource, /max-height:\s*75vh/)
  assert.match(styleSource, /overflow-y:\s*auto/)
  assert.match(styleSource, /width:\s*calc\(100vw - 24px\)/)
})
