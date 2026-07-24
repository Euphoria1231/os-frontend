/// <reference types="node" />

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

interface RenderedTag {
  props: { children: string }
}

test('旷工状态显示旷工标签', () => {
  const source = readFileSync(
    new URL('./AttendanceStatusTag.tsx', import.meta.url),
    'utf8',
  )
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  })
  const componentModule = {
    exports: {} as {
      AttendanceStatusTag: (props: { status: string }) => RenderedTag
    },
  }

  vm.runInNewContext(outputText, {
    exports: componentModule.exports,
    module: componentModule,
    require: (moduleName: string) => {
      if (moduleName === 'react') {
        return { memo: (component: unknown) => component }
      }
      if (moduleName === 'react/jsx-runtime') {
        return { jsx: (_type: unknown, props: RenderedTag['props']) => ({ props }) }
      }
      if (moduleName === 'antd') {
        return { Tag: 'Tag' }
      }
      throw new Error(`Unexpected module: ${moduleName}`)
    },
  })

  const tag = componentModule.exports.AttendanceStatusTag({ status: 'ABSENT' })

  assert.equal(tag.props.children, '旷工')
})
