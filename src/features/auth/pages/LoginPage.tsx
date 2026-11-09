import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate, type Location } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { FormField, inputClass } from '@/components/ui/FormField'
import { PageSpinner } from '@/components/ui/Spinner'
import { Wordmark } from '@/components/ui/Wordmark'
import { toApiError } from '@/lib/http/errors'
import { useAuth } from '../AuthContext'
import { DEMO_ACCOUNTS } from '../demoAccounts'

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const SHOW_DEMO_ACCOUNTS = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_ACCOUNTS === 'true'

export function LoginPage() {
  const { status, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)

  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/'

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (status === 'loading') return <PageSpinner label="Checking your session…" />
  if (status === 'authenticated') return <Navigate to={from} replace />

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null)
    try {
      const user = await login(values)
      toast.success(`Welcome, ${user.name}`)
      navigate(from, { replace: true })
    } catch (error) {
      const apiError = toApiError(error)
      setFormError(apiError.status === 401 ? 'Invalid email or password.' : apiError.message)
    }
  }

  const fillDemo = (email: string, password: string) => {
    setValue('email', email, { shouldValidate: true })
    setValue('password', password, { shouldValidate: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1><Wordmark size="lg" /></h1>
          <p className="mt-2 text-sm text-ink-500">Workflow &amp; Operations Management</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4 rounded-lg bg-white p-6 shadow-sm border-2 border-ink-900 shadow-hard-sm"
        >
          {formError && <Alert>{formError}</Alert>}

          <FormField id="email" label="Email" error={errors.email?.message} required>
            <input
              id="email"
              type="email"
              autoComplete="username"
              aria-invalid={Boolean(errors.email) || undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={inputClass}
              {...register('email')}
            />
          </FormField>

          <FormField id="password" label="Password" error={errors.password?.message} required>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password) || undefined}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={inputClass}
              {...register('password')}
            />
          </FormField>

          <Button type="submit" className="w-full" loading={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        {SHOW_DEMO_ACCOUNTS && (
        <div className="rounded-lg bg-white p-4 text-sm border-2 border-ink-900 shadow-hard-sm">
          <p className="font-medium text-slate-700">Demo accounts</p>
          <p className="mt-0.5 text-xs text-slate-500">Seeded test users. Click one to fill the form.</p>
          <ul className="mt-3 space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  onClick={() => fillDemo(account.email, account.password)}
                  className="w-full rounded-md border-2 border-ink-200 px-3 py-2 text-left transition-colors hover:border-ink-900 hover:bg-lemon-100"
                >
                  <span className="block font-medium text-slate-800">{account.label}</span>
                  <span className="block text-xs text-slate-500">{account.email}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        )}
      </div>
    </div>
  )
}
