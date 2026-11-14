import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { registerApi, loginApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import AuthShell from '../components/layout/AuthShell'
import toast from 'react-hot-toast'

const schema = z.object({
  fullName: z.string().min(2, 'Use at least 2 characters'),
  username: z.string().min(3, 'Use at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers and underscores only'),
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Use at least 6 characters'),
})
type Form = z.infer<typeof schema>

const FIELDS = [
  { name: 'fullName' as const, label: 'Full name',  placeholder: 'Aarav Sharma',     type: 'text',  auto: 'name' },
  { name: 'username' as const, label: 'Username',   placeholder: 'aarav_trades',     type: 'text',  auto: 'username' },
  { name: 'email'    as const, label: 'Email',      placeholder: 'you@example.com',  type: 'email', auto: 'email' },
]

export default function Register() {
  const navigate = useNavigate()
  const { setAuth, isLoggedIn } = useAuthStore()
  const [show, setShow] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) })

  if (isLoggedIn) return <Navigate to="/dashboard" replace />

  const onSubmit = async (d: Form) => {
    try {
      await registerApi(d)
      const { data } = await loginApi({ email: d.email, password: d.password })
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken)
      toast.success('Account created. Log your first trade to get started.')
      navigate('/dashboard')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Could not create your account. Try again.')
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking the behavior behind your trades."
      footer={<>Already have an account? <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--brand)' }}>Log in</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {FIELDS.map(({ name, label, placeholder, type, auto }) => (
          <div key={name}>
            <label htmlFor={name} className="label">{label}</label>
            <input id={name} type={type} autoComplete={auto} className="input-base" placeholder={placeholder} {...register(name)} />
            {errors[name] && <p className="text-[12px] mt-1.5" style={{ color: 'var(--loss)' }}>{errors[name]?.message}</p>}
          </div>
        ))}
        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <input id="password" type={show ? 'text' : 'password'} autoComplete="new-password" className="input-base !pr-11" placeholder="At least 6 characters" {...register('password')} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg2)]" style={{ color: 'var(--text3)' }}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-[12px] mt-1.5" style={{ color: 'var(--loss)' }}>{errors.password.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full !py-3 !text-[15px]">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  )
}
