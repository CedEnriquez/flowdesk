import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { router } from './router'

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" richColors closeButton />
    </AuthProvider>
  )
}
