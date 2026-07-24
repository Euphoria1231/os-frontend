import {
  memo,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import {
  ArrowRightOutlined,
  AuditOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { Button, Input, Spin, Tag, Typography, type InputRef } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useGlobalSearch } from '../../hooks/search/useGlobalSearch.ts'
import type {
  GlobalSearchResult,
  SearchCategory,
} from '../../services/search/search.types.ts'
import { formatDateTime } from '../../utils/date.ts'
import { getErrorMessage } from '../../utils/error.ts'
import './GlobalSearch.less'

const CATEGORY_OPTIONS: Array<{ label: string; value: SearchCategory }> = [
  { label: '全部', value: 'all' },
  { label: '公告', value: 'notice' },
  { label: '审批', value: 'application' },
]

function applicationTypeLabel(type: GlobalSearchResult & { kind: 'application' }): string {
  if (type.item.type === 'LEAVE') return '请假申请'
  if (type.item.type === 'OVERTIME') return '加班申请'
  return '补签申请'
}

function applicationStatusLabel(status: GlobalSearchResult & { kind: 'application' }): string {
  if (status.item.status === 'APPROVED') return '已同意'
  if (status.item.status === 'REJECTED') return '已驳回'
  return '审批中'
}

function HighlightedText({ value, fallback }: { value: string | null; fallback: string }) {
  const text = value || fallback
  const parts = text.split(/(<em>|<\/em>)/g)
  let highlighted = false

  return parts.map((part, index): ReactNode => {
    if (part === '<em>') {
      highlighted = true
      return null
    }
    if (part === '</em>') {
      highlighted = false
      return null
    }
    return highlighted ? <mark key={index}>{part}</mark> : <span key={index}>{part}</span>
  })
}

function resultPath(result: GlobalSearchResult): string {
  return result.kind === 'notice'
    ? `/notices?noticeId=${result.item.noticeId}`
    : `/flow/applications?applicationId=${result.item.applicationId}`
}

export const GlobalSearch = memo(function GlobalSearch() {
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<SearchCategory>('all')
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<InputRef>(null)
  const resultRefs = useRef<Array<HTMLButtonElement | null>>([])
  const navigate = useNavigate()
  const { results, loading, error, retry } = useGlobalSearch(keyword, category)
  const normalizedKeyword = keyword.trim()
  const activeIndex = results.length > 0
    ? Math.min(Math.max(selectedIndex, 0), results.length - 1)
    : -1

  useEffect(() => {
    resultRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(true)
        inputRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleShortcut)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleShortcut)
    }
  }, [])

  const openResult = (result: GlobalSearchResult) => {
    setOpen(false)
    navigate(resultPath(result))
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }
    if (!results.length || !open) {
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex((current) => (current + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex((current) => (current <= 0 ? results.length - 1 : current - 1))
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      openResult(results[activeIndex])
    }
  }

  return (
    <div className="global-search" ref={rootRef}>
      <Input
        ref={inputRef}
        className="global-search-input"
        value={keyword}
        allowClear
        autoComplete="off"
        prefix={<SearchOutlined />}
        placeholder="搜索公告、审批申请"
        aria-label="全局搜索"
        aria-expanded={open}
        aria-controls="global-search-results"
        aria-activedescendant={
          activeIndex >= 0 ? `global-search-result-${activeIndex}` : undefined
        }
        suffix={<span className="global-search-shortcut">Ctrl K</span>}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setKeyword(event.target.value)
          setSelectedIndex(0)
          setOpen(true)
        }}
        onKeyDown={handleKeyDown}
      />

      {open && (
        <section className="global-search-panel" aria-label="搜索结果">
          <div className="global-search-categories" role="tablist" aria-label="搜索分类">
            {CATEGORY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={category === option.value}
                className={category === option.value ? 'is-active' : undefined}
                onClick={() => {
                  setCategory(option.value)
                  setSelectedIndex(0)
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="global-search-results" id="global-search-results" role="listbox">
            {!normalizedKeyword ? (
              <div className="global-search-state">
                <SearchOutlined />
                <strong>搜索整个 OA 工作区</strong>
                <span>输入标题、公告内容或申请原因关键词</span>
              </div>
            ) : loading ? (
              <div className="global-search-state">
                <Spin size="small" />
                <strong>正在检索业务数据</strong>
                <span>公告与审批结果会按最新时间排序</span>
              </div>
            ) : error ? (
              <div className="global-search-state is-error">
                <strong>搜索服务暂时不可用</strong>
                <span>{getErrorMessage(error, '请稍后重试')}</span>
                <Button size="small" icon={<ReloadOutlined />} onClick={retry}>重新搜索</Button>
              </div>
            ) : results.length === 0 ? (
              <div className="global-search-state">
                <SearchOutlined />
                <strong>没有找到相关结果</strong>
                <span>尝试缩短关键词或切换搜索分类</span>
              </div>
            ) : (
              results.map((result, index) => {
                const notice = result.kind === 'notice'
                const title = notice
                  ? <HighlightedText value={result.item.titleHighlight} fallback={result.item.title} />
                  : `${applicationTypeLabel(result)} #${result.item.applicationId}`
                const summary = notice
                  ? <HighlightedText value={result.item.contentHighlight} fallback={result.item.content} />
                  : <HighlightedText value={result.item.reasonHighlight} fallback={result.item.reasonSummary} />
                const time = notice ? result.item.publishedAt : result.item.submittedAt

                return (
                  <button
                    id={`global-search-result-${index}`}
                    key={result.key}
                    ref={(element) => {
                      resultRefs.current[index] = element
                    }}
                    type="button"
                    role="option"
                    aria-selected={activeIndex === index}
                    className={activeIndex === index ? 'global-search-result is-selected' : 'global-search-result'}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => openResult(result)}
                  >
                    <span className="global-search-result-icon">
                      {notice ? <FileTextOutlined /> : <AuditOutlined />}
                    </span>
                    <span className="global-search-result-copy">
                      <span className="global-search-result-title">{title}</span>
                      <span className="global-search-result-summary">{summary}</span>
                      <span className="global-search-result-meta">
                        <Tag bordered={false}>{notice ? '公告' : '审批'}</Tag>
                        {!notice && <Tag bordered={false}>{applicationStatusLabel(result)}</Tag>}
                        <Typography.Text>{formatDateTime(time)}</Typography.Text>
                      </span>
                    </span>
                    <ArrowRightOutlined className="global-search-result-arrow" />
                  </button>
                )
              })
            )}
          </div>
        </section>
      )}
    </div>
  )
})
