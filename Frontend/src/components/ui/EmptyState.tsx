import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface Props { icon: LucideIcon; title: string; description: string; action?: ReactNode }

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="panel flex flex-col items-center justify-center py-16 px-6 text-center"
      style={{ borderStyle: 'dashed', borderColor: 'var(--border2)', background: 'transparent' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--brand-bg)' }}>
        <Icon size={22} style={{ color: 'var(--brand)' }} />
      </div>
      <h3 className="text-[17px] font-bold mb-1.5" style={{ color: 'var(--text)' }}>{title}</h3>
      <p className="text-[13.5px] mb-5 max-w-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{description}</p>
      {action}
    </div>
  )
}
