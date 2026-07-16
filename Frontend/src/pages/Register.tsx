import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TrendingUp } from 'lucide-react'
import { registerApi, loginApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import ThemeToggle from '../components/ui/ThemeToggle'
import toast from 'react-hot-toast'

const schema = z.object({
  fullName: z.string().min(2, 'At least 2 characters'),
  username: z.string().min(3, 'At least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers and _ only'),
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'At least 6 characters'),
})
type Form = z.infer<typeof schema>

export default function Register() {
  const navigate  = useNavigate()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (d: Form) => {
    try {
      await registerApi(d)
      const { data } = await loginApi({ email: d.email, password: d.password })
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken)
      toast.success('Account created!')
      navigate('/')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <div className="w-full max-w-[380px]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'var(--brand-bg)' }}>
            <TrendingUp size={22} style={{ color: 'var(--brand)' }} />
          </div>
          <h1 className="text-[22px] font-bold" style={{ color: 'var(--text)' }}>EdgeLedger</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text3)' }}>Track your trading behavior</p>
        </div>

        <div className="card p-6">
          <h2 className="text-[15px] font-bold mb-1" style={{ color: 'var(--text)' }}>Create account</h2>
          <p className="text-[13px] mb-5" style={{ color: 'var(--text3)' }}>Start understanding your trading patterns</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {([
              { name: 'fullName' as const, label: 'Full Name', placeholder: 'Your full name', type: 'text' },
              { name: 'username' as const, label: 'Username',  placeholder: 'yourhandle',     type: 'text' },
              { name: 'email'    as const, label: 'Email',     placeholder: 'you@example.com', type: 'email' },
              { name: 'password' as const, label: 'Password',  placeholder: '••••••••',        type: 'password' },
            ]).map(({ name, label, placeholder, type }) => (
              <div key={name}>
                <label className="label">{label}</label>
                <input type={type} className="input-base" placeholder={placeholder} {...register(name)} />
                {errors[name] && <p className="text-[11px] mt-1" style={{ color: 'var(--loss)' }}>{errors[name]?.message}</p>}
              </div>
            ))}
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-1">
              {isSubmitting ? 'Creating…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] mt-4" style={{ color: 'var(--text3)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--brand)' }} className="font-semibold hover:opacity-70">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
