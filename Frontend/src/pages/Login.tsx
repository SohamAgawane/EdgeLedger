import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TrendingUp } from 'lucide-react'
import { loginApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import ThemeToggle from '../components/ui/ThemeToggle'
import toast from 'react-hot-toast'

const schema = z.object({
  email:    z.string().min(1, 'Required'),
  password: z.string().min(1, 'Required'),
})
type Form = z.infer<typeof schema>

export default function Login() {
  const navigate  = useNavigate()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (d: Form) => {
    try {
      const { data } = await loginApi({ email: d.email, password: d.password })
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken)
      toast.success(`Welcome back, ${data.data.user.fullName}`)
      navigate('/')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'var(--brand-bg)' }}>
            <TrendingUp size={22} style={{ color: 'var(--brand)' }} />
          </div>
          <h1 className="text-[22px] font-bold" style={{ color: 'var(--text)' }}>EdgeLedger</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text3)' }}>Trade smarter. Not harder.</p>
        </div>

        <div className="card p-6">
          <h2 className="text-[15px] font-bold mb-1" style={{ color: 'var(--text)' }}>Welcome back</h2>
          <p className="text-[13px] mb-5" style={{ color: 'var(--text3)' }}>Sign in to your account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email or Username</label>
              <input className="input-base" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-[11px] mt-1" style={{ color: 'var(--loss)' }}>{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input-base" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="text-[11px] mt-1" style={{ color: 'var(--loss)' }}>{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] mt-4" style={{ color: 'var(--text3)' }}>
          No account?{' '}
          <Link to="/register" style={{ color: 'var(--brand)' }} className="font-semibold hover:opacity-70">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
