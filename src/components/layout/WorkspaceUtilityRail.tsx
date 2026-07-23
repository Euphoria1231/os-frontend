import { memo, useMemo, useState } from 'react'
import {
  ArrowRightOutlined,
  BellOutlined,
  CalendarOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Badge,
  Button,
  Calendar,
  Card,
  Empty,
  Flex,
  List,
  Typography,
} from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { Link } from 'react-router-dom'
import {
  useWorkspaceUtilityData,
  type WorkspaceUtilityData,
} from '../../hooks/workspace/useWorkspaceUtilityData.ts'
import { getErrorMessage } from '../../utils/error.ts'
import {
  getTasksForDate,
} from '../../views/workbench/WorkbenchPage.logic.ts'
import { CalendarTaskIndicator } from './WorkspaceUtilityRail.logic.ts'
import './WorkspaceUtilityRail.less'

const { Text, Title } = Typography

interface WorkspaceUtilityRailProps {
  data: WorkspaceUtilityData
}

export const WorkspaceUtilityRail = memo(function WorkspaceUtilityRail({
  data,
}: WorkspaceUtilityRailProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => dayjs())
  const taskDateKeys = useMemo(
    () => new Set(data.tasks.map((task) => task.dateKey)),
    [data.tasks],
  )
  const selectedDateKey = selectedDate.format('YYYY-MM-DD')
  const selectedDateTasks = useMemo(
    () => getTasksForDate(data.tasks, selectedDateKey),
    [data.tasks, selectedDateKey],
  )
  const recentNotices = useMemo(
    () =>
      data.notices
        .toSorted((left, right) => right.publishedAt.localeCompare(left.publishedAt))
        .slice(0, 6),
    [data.notices],
  )

  if (collapsed) {
    return (
      <aside className="workspace-utility-rail is-collapsed">
        <div className="workspace-utility-collapsed">
          <Button
            type="text"
            aria-label="展开通知公告和日历"
            icon={<LeftOutlined />}
            onClick={() => setCollapsed(false)}
          />
          <span />
          <BellOutlined />
          <CalendarOutlined />
        </div>
      </aside>
    )
  }

  return (
    <aside className="workspace-utility-rail">
      <Card bordered={false} className="workspace-utility-card workspace-notice-card">
        <div className="workspace-utility-heading">
          <Flex align="center" gap={9}>
            <span className="workspace-utility-heading-icon"><BellOutlined /></span>
            <div>
              <Title level={3}>通知公告</Title>
              <Text type="secondary">未读 {data.unreadCount} 条</Text>
            </div>
          </Flex>
          <Flex align="center" gap={2}>
            <Link to="/notices">更多</Link>
            <Button
              type="text"
              aria-label="收起通知公告和日历"
              icon={<RightOutlined />}
              onClick={() => setCollapsed(true)}
            />
          </Flex>
        </div>

        {Boolean(data.noticeError) && (
          <Alert
            type="warning"
            showIcon
            message={getErrorMessage(data.noticeError, '公告暂时无法加载')}
          />
        )}

        <List
          className="workspace-notice-list"
          loading={data.noticeLoading}
          dataSource={recentNotices}
          locale={{ emptyText: '暂无公告' }}
          renderItem={(notice) => (
            <List.Item>
              <Link to="/notices" className="workspace-notice-row">
                <Badge dot={!notice.read} color="#2db194">
                  <span className="workspace-notice-mark" />
                </Badge>
                <Text ellipsis>{notice.title}</Text>
                <time>{dayjs(notice.publishedAt).format('MM-DD')}</time>
              </Link>
            </List.Item>
          )}
        />
      </Card>

      <Card bordered={false} className="workspace-utility-card workspace-calendar-card">
        <div className="workspace-utility-heading">
          <Flex align="center" gap={9}>
            <span className="workspace-utility-heading-icon is-blue"><CalendarOutlined /></span>
            <div>
              <Title level={3}>日程待办</Title>
            </div>
          </Flex>
        </div>

        <Calendar
          fullscreen={false}
          value={selectedDate}
          onSelect={setSelectedDate}
          headerRender={({ value, onChange }) => (
            <div className="workspace-calendar-header">
              <Button
                type="text"
                aria-label="上个月"
                icon={<LeftOutlined />}
                onClick={() => onChange(value.subtract(1, 'month'))}
              />
              <Text strong>{value.format('YYYY年 M月')}</Text>
              <Button
                type="text"
                aria-label="下个月"
                icon={<RightOutlined />}
                onClick={() => onChange(value.add(1, 'month'))}
              />
            </div>
          )}
          cellRender={(current, info) =>
            info.type === 'date' ? (
              <CalendarTaskIndicator
                hasTask={taskDateKeys.has(current.format('YYYY-MM-DD'))}
              />
            ) : null
          }
        />

        <div className="workspace-agenda">
          <div className="workspace-agenda-heading">
            <Text strong>{selectedDate.format('M月D日')}日程</Text>
            <Text type="secondary">{selectedDateTasks.length} 项</Text>
          </div>
          {selectedDateTasks.length ? (
            selectedDateTasks.map((task) => (
              <Link key={task.key} to={task.path} className="workspace-agenda-item">
                <i />
                <span>
                  <strong>{task.title}</strong>
                  <small>{task.statusLabel} · {task.applicationNo}</small>
                </span>
                <ArrowRightOutlined />
              </Link>
            ))
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="当天暂无待办" />
          )}
        </div>
      </Card>
    </aside>
  )
})

export const WorkspaceUtilityRailContainer = memo(function WorkspaceUtilityRailContainer() {
  const data = useWorkspaceUtilityData()
  return <WorkspaceUtilityRail data={data} />
})
