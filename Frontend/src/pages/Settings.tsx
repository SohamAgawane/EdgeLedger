import { useForm } from 'react-hook-form'
import { useAuthStore } from '../store/authStore'
import { User, DollarSign, Lock } from 'lucide-react'
import api from '../api/axiosInstance'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, setUser } = useAuthStore()

  const { register: regProfile, handleSubmit: hsProfile, formState: { isSubmitting: sp } } =
    useForm({ defaultValues: { fullName: user?.fullName, accountCapital: user?.accountCapital } })

  const { register: regPwd, handleSubmit: hsPwd, reset: resetPwd, formState: { isSubmitting: swd } } =
    useForm<{ currentPassword: string; newPassword: string }>()

  const saveProfile = async (d: any) => {
    try {
      const { data } = await api.patch('/users/profile', d)
      setUser(data.data)
      toast.success('Profile updated')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed')
    }
  }

  const savePwd = async (d: any) => {
    try {
      await api.patch('/users/change-password', d)
      toast.success('Password changed')
      resetPwd()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed')
    }
  }

  const Section = ({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) => (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-bg)' }}>
          <Icon size={15} style={{ color: 'var(--brand)' }} />
        </div>
        <h3 className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>{title}</h3>
      </div>
      {children}
    </div>
  )

  return (
    <div className="max-w-xl space-y-5">
      <Section icon={User} title="Profile">
        <form onSubmit={hsProfile(saveProfile)} className="space-y-3">
          <div>
            <label className="label">Full Name</label>
            <input className="input-base" {...regProfile('fullName')} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input-base" value={user?.email} disabled style={{ opacity: 0.6 }} />
          </div>
          <button type="submit" disabled={sp} className="btn-primary text-[13px]">
            {sp ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </Section>

      <Section icon={DollarSign} title="Account Capital">
        <p className="text-[12.5px]" style={{ color: 'var(--text3)' }}>
          Used by the capital % rule engine. Set this to your actual trading capital.
        </p>
        <form onSubmit={hsProfile(saveProfile)} className="space-y-3">
          <div>
            <label className="label">Capital (₹)</label>
            <input type="number" className="input-base mono" placeholder="e.g. 100000" {...regProfile('accountCapital')} />
          </div>
          <button type="submit" disabled={sp} className="btn-primary text-[13px]">
            {sp ? 'Saving…' : 'Update Capital'}
          </button>
        </form>
      </Section>

      <Section icon={Lock} title="Change Password">
        <form onSubmit={hsPwd(savePwd)} className="space-y-3">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input-base" {...regPwd('currentPassword', { required: true })} />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input-base" {...regPwd('newPassword', { required: true, minLength: 6 })} />
          </div>
          <button type="submit" disabled={swd} className="btn-primary text-[13px]">
            {swd ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </Section>
    </div>
  )
}
