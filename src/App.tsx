
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import RequireAuth from './components/auth/RequireAuth'
import RequirePermission from './components/auth/RequirePermission'
import AppErrorBoundary from './components/error/AppErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import MainLayout from './layouts/MainLayout'
import { appRoutes, publicRoutes } from './router/routes'
import Forbidden from './views/Forbidden'
import NotFound from './views/NotFound'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {publicRoutes.map((route) => (
            <Route key={route.key} path={route.path} element={route.element} />
          ))}
          {appRoutes.map((route) => (
            <Route
              key={route.key}
              path={route.path}
              element={
                <RequireAuth>
                  <MainLayout>
                    <AppErrorBoundary>
                      <RequirePermission permissionCode={route.permissionCode} fallback={<Forbidden />}>
                        {route.element}
                      </RequirePermission>
                    </AppErrorBoundary>
                  </MainLayout>
                </RequireAuth>
              }
            />
          ))}
          <Route
            path="*"
            element={
              <RequireAuth>
                <MainLayout>
                  <AppErrorBoundary>
                    <NotFound />
                  </AppErrorBoundary>
                </MainLayout>
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
