import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { RequireAuth } from '@/features/auth/components/RequireAuth'
import { RequireRole } from '@/features/auth/components/RequireRole'
import { RouteError } from '@/pages/RouteError'

// Pages are code-split: each is downloaded the first time its route is visited.
export const router = createBrowserRouter([
  {
    path: '/login',
    lazy: async () => ({ Component: (await import('@/features/auth/pages/LoginPage')).LoginPage }),
    ErrorBoundary: RouteError,
  },
  {
    Component: RequireAuth,
    ErrorBoundary: RouteError,
    children: [
      {
        Component: AppLayout,
        children: [
          {
            index: true,
            lazy: async () => ({ Component: (await import('@/features/requests/pages/DashboardPage')).DashboardPage }),
          },
          {
            Component: () => <RequireRole roles={['REQUESTER']} />,
            children: [
              {
                path: 'requests/new',
                lazy: async () => ({ Component: (await import('@/features/requests/pages/NewRequestPage')).NewRequestPage }),
              },
            ],
          },
          {
            path: 'requests/:id',
            lazy: async () => ({ Component: (await import('@/features/requests/pages/RequestDetailPage')).RequestDetailPage }),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    lazy: async () => ({ Component: (await import('@/pages/NotFoundPage')).NotFoundPage }),
  },
])
