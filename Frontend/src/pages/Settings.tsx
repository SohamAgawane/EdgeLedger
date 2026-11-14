import { useForm } from 'react-hook-form'
import { useAuthStore } from '../store/authStore'
import { User, Wallet, Lock } from 'lucide-react'
import api from '../api/axiosInstance'
import toast from 'react-hot-toast'

function Section({ icon: Icon, title, text, children }: { icon: typeof User; title: string; text?: string; children: React.ReactNode }) {
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-5">
        <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--brand-bg)', color: 'var(--brand)' }}><Icon size={17} /></span>
        <div>
          <h3 className="text-[17px] font-bold leading-tight" style={{ color: 'var(--text)' }}>{title}</h3>
          {text && <p className="text-[13px] mt-1 leading-relaxed max-w-[460px]" style={{ color: 'var(--text3)' }}>{text}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  const { user, setUser } = useAuthStore()

  const { register: regProfile, handleSubmit: hsProfile, formState: { isSubmitting: sp } } =
    useForm({ defaultValues: { fullName: user?.fullName, accountCapital: user?.accountCapital } })
  const { register: regPwd, handleSubmit: hsPwd, reset: resetPwd, formState: { isSubmitting: swd } } =
    useForm<{ currentPassword: string; newPassword: string }>()

  const saveProfile = async (d: any) => {
    try {
      const payload = { ...d, accountCapital: d.accountCapital === '' || d.accountCapital == null ? undefined : Number(d.accountCapital) }
      const { data } = await api.patch('/users/profile', payload)
      setUser(data.data)
      toast.success('Settings saved')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Could not save your settings')
    }
  }

  const savePwd = async (d: any) => {
    try {
      await api.patch('/users/change-password', d)
      toast.success('Password changed')
      resetPwd()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Could not change your password')
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <Section icon={User} title="Profile">
        <form onSubmit={hsProfile(saveProfile)} className="space-y-4">
          <div>
            <label className="label" htmlFor="s-name">Full name</label>
            <input id="s-name" className="input-base" {...regProfile('fullName')} />
          </div>
          <div>
            <label className="label" htmlFor="s-email">Email</label>
            <input id="s-email" className="input-base" value={user?.email ?? ''} disabled readOnly />
          </div>
          <button type="submit" disabled={sp} className="btn-primary text-[13.5px]">{sp ? 'Saving…' : 'Save changes'}</button>
        </form>
      </Section>

      <Section icon={Wallet} title="Account capital" text="Your “max capital per trade” rule uses this number. Set it to the money you actually trade with.">
        <form onSubmit={hsProfile(saveProfile)} className="space-y-4">
          <div>
            <label className="label" htmlFor="s-cap">Capital (₹)</label>
            <input id="s-cap" type="number" className="input-base mono" placeholder="100000" {...regProfile('accountCapital')} />
          </div>
          <button type="submit" disabled={sp} className="btn-primary text-[13.5px]">{sp ? 'Saving…' : 'Update capital'}</button>
        </form>
      </Section>

      <Section icon={Lock} title="Password">
        <form onSubmit={hsPwd(savePwd)} className="space-y-4">
          <div>
            <label className="label" htmlFor="s-cur">Current password</label>
            <input id="s-cur" type="password" autoComplete="current-password" className="input-base" {...regPwd('currentPassword', { required: true })} />
          </div>
          <div>
            <label className="label" htmlFor="s-new">New password</label>
            <input id="s-new" type="password" autoComplete="new-password" placeholder="At least 6 characters" className="input-base" {...regPwd('newPassword', { required: true, minLength: 6 })} />
          </div>
          <button type="submit" disabled={swd} className="btn-primary text-[13.5px]">{swd ? 'Changing…' : 'Change password'}</button>
        </form>
      </Section>
    </div>
  )
}
