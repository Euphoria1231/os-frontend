import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute.tsx'
import { AppLayout } from './components/layout/AppLayout.tsx'
import { PermissionGate } from './components/permission/PermissionGate.tsx'
import { LoginPage } from './views/auth/LoginPage.tsx'
import { EmployeePage } from './views/employee/EmployeePage.tsx'
import { DepartmentPage } from './views/organization/DepartmentPage.tsx'
import { PositionPage } from './views/organization/PositionPage.tsx'
import { PermissionPage } from './views/permission/PermissionPage.tsx'
import { ModulePlaceholder } from './views/shared/ModulePlaceholder.tsx'
import { WorkbenchPage } from './views/workbench/WorkbenchPage.tsx'

const moduleRoutes = [
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
          <Route
            path="organization/departments"
            element={
              <PermissionGate authority="GET:/api/user/**" showDenied>
                <DepartmentPage />
              </PermissionGate>
            }
          />
          <Route
            path="organization/positions"
            element={
              <PermissionGate authority="GET:/api/user/**" showDenied>
                <PositionPage />
              </PermissionGate>
            }
          />
          <Route
            path="employees"
            element={
              <PermissionGate authority="GET:/api/user/**" showDenied>
                <EmployeePage />
              </PermissionGate>
            }
          />
          <Route
            path="permissions"
            element={
              <PermissionGate authority="GET:/api/user/**" showDenied>
                <PermissionPage />
              </PermissionGate>
            }
          />
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
