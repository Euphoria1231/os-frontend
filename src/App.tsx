import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { EmployeeSelfServiceRoute } from './components/auth/EmployeeSelfServiceRoute.tsx'
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
import { NoticePage } from './views/notice/NoticePage.tsx'
import { PermissionPage } from './views/permission/PermissionPage.tsx'
import { DashboardPage } from './views/dashboard/DashboardPage.tsx'
import { WorkbenchPage } from './views/workbench/WorkbenchPage.tsx'
import { IntelligencePage } from './views/intelligence/IntelligencePage.tsx'
import { OperationLogPage } from './views/operation-log/OperationLogPage.tsx'
import { PersonalNotificationPage } from './views/notice/PersonalNotificationPage.tsx'
import { PersonalNotificationProvider } from './hooks/notice/PersonalNotificationProvider.tsx'
import { ProfilePage } from './views/profile/ProfilePage.tsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PersonalNotificationProvider>
                <AppLayout />
              </PersonalNotificationProvider>
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
              <PermissionGate authority="GET:/api/user/employees/direct-reports" showDenied>
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
              <EmployeeSelfServiceRoute>
                <PermissionGate authority="GET:/api/attendance/**" showDenied>
                  <AttendancePage />
                </PermissionGate>
              </EmployeeSelfServiceRoute>
            }
          />
          <Route
            path="flow/applications"
            element={
              <EmployeeSelfServiceRoute>
                <PermissionGate authority="GET:/api/flow/applications/**" showDenied>
                  <ApplicationPage />
                </PermissionGate>
              </EmployeeSelfServiceRoute>
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
          <Route
            path="notices"
            element={
              <PermissionGate authority="GET:/api/notices/**" showDenied>
                <NoticePage />
              </PermissionGate>
            }
          />
          <Route path="notifications" element={<PersonalNotificationPage />} />
          <Route
            path="ai/assistant"
            element={
              <PermissionGate authority="POST:/api/intelligence/ai/**" showDenied>
                <IntelligencePage />
              </PermissionGate>
            }
          />
          <Route path="operation-logs" element={<OperationLogPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="foundation" element={<Navigate to="/workspace" replace />} />
          <Route path="*" element={<Navigate to="/workspace" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
