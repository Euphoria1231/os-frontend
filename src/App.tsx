import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute.tsx'
import { AppLayout } from './components/layout/AppLayout.tsx'
import { PermissionGate } from './components/permission/PermissionGate.tsx'
import { LoginPage } from './views/auth/LoginPage.tsx'
import { ModulePlaceholder } from './views/shared/ModulePlaceholder.tsx'
import { WorkbenchPage } from './views/workbench/WorkbenchPage.tsx'

const moduleRoutes = [
  {
    path: 'organization/departments',
    authority: 'GET:/api/user/**',
    title: '部门管理',
    description: '维护组织层级、部门负责人和启停状态。',
  },
  {
    path: 'organization/positions',
    authority: 'GET:/api/user/**',
    title: '岗位管理',
    description: '维护岗位编码、岗位名称和岗位状态。',
  },
  {
    path: 'employees',
    authority: 'GET:/api/user/**',
    title: '员工管理',
    description: '管理员工基础资料、组织关系与角色分配。',
  },
  {
    path: 'permissions',
    authority: 'GET:/api/user/**',
    title: '权限管理',
    description: '配置角色、菜单和后端接口权限。',
  },
  {
    path: 'attendance',
    authority: 'GET:/api/attendance/**',
    title: '考勤打卡',
    description: '完成上下班打卡并查询个人出勤记录。',
  },
  {
    path: 'flow/applications',
    authority: 'GET:/api/flow/applications/**',
    title: '我的申请',
    description: '提交请假与加班申请，跟踪申请处理状态。',
  },
  {
    path: 'flow/approvals',
    authority: 'GET:/api/flow/tasks/**',
    title: '审批中心',
    description: '处理直属员工申请并查询已办记录。',
  },
  {
    path: 'notices',
    authority: 'GET:/api/notices/**',
    title: '公告通知',
    description: '查看公司公告并维护个人已读状态。',
  },
]

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/workspace" replace />} />
          <Route path="workspace" element={<WorkbenchPage />} />
          {moduleRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <PermissionGate authority={route.authority} showDenied>
                  <ModulePlaceholder title={route.title} description={route.description} />
                </PermissionGate>
              }
            />
          ))}
          <Route path="foundation" element={<Navigate to="/workspace" replace />} />
          <Route path="*" element={<Navigate to="/workspace" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
