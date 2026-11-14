import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { loginApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import AuthShell from '../components/layout/AuthShell'
import toast from 'react-hot-toast'

const schema = z.object({
  email:    z.string().min(1, 'Enter your email or username'),
  password: z.string().min(1, 'Enter your password'),
})
type Form = z.infer<typeof schema>

export default function Login() {
  const navigate = useNavigate()
  const { setAuth, isLoggedIn } = useAuthStore()
  const [show, setShow] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) })

  if (isLoggedIn) return <Navigate to="/dashboard" replace />

  const onSubmit = async (d: Form) => {
    try {
      const { data } = await loginApi({ email: d.email, password: d.password })
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken)
      toast.success(`Welcome back, ${data.data.user.fullName.split(' ')[0]}`)
      navigate('/dashboard')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Login failed. Check your details and try again.')
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to review your trades and patterns."
      footer={<>New to EdgeLedger? <Link to="/register" className="font-semibold hover:underline" style={{ color: 'var(--brand)' }}>Create a free account</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="label">Email or username</label>
          <input id="email" autoComplete="username" className="input-base" placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="text-[12px] mt-1.5" style={{ color: 'var(--loss)' }}>{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" className="input-base !pr-11" placeholder="Your password" {...register('password')} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg2)]" style={{ color: 'var(--text3)' }}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-[12px] mt-1.5" style={{ color: 'var(--loss)' }}>{errors.password.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full !py-3 !text-[15px]">
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthShell>
  )
}
