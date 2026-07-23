import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute.tsx'
import { AppLayout } from './components/layout/AppLayout.tsx'
import { PermissionGate } from './components/permission/PermissionGate.tsx'
import { LoginPage } from './views/auth/LoginPage.tsx'
import { AttendancePage } from './views/attendance/AttendancePage.tsx'
import { EmployeePage } from './views/employee/EmployeePage.tsx'
import { ApplicationPage } from './views/flow/ApplicationPage.tsx'
import { ApprovalPage } from './views/flow/ApprovalPage.tsx'
import { DepartmentPage } from './views/organization/DepartmentPage.tsx'
import { PositionPage } from './views/organization/PositionPage.tsx'
import { PermissionPage } from './views/permission/PermissionPage.tsx'
import { ModulePlaceholder } from './views/shared/ModulePlaceholder.tsx'
import { WorkbenchPage } from './views/workbench/WorkbenchPage.tsx'

const moduleRoutes = [
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
          <Route
            path="attendance"
            element={
              <PermissionGate authority="GET:/api/attendance/**" showDenied>
                <AttendancePage />
              </PermissionGate>
            }
          />
          <Route
            path="flow/applications"
            element={
              <PermissionGate authority="GET:/api/flow/applications/**" showDenied>
                <ApplicationPage />
              </PermissionGate>
            }
          />
          <Route
            path="flow/approvals"
            element={
              <PermissionGate authority="GET:/api/flow/tasks/**" showDenied>
                <ApprovalPage />
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
