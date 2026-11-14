import { Link } from 'react-router-dom'
import { Brain, ShieldCheck, BarChart3, ArrowLeft } from 'lucide-react'
import Logo from '../ui/Logo'
import ThemeToggle from '../ui/ThemeToggle'

const POINTS = [
  { icon: Brain,       title: 'Tag the feeling behind every trade', text: 'Confident, fearful, FOMO or revenge. See what each one costs you.' },
  { icon: ShieldCheck, title: 'Write rules, get warned',            text: 'Position size, daily trade count, time cutoffs and revenge-trade checks.' },
  { icon: BarChart3,   title: 'Find your pattern',                  text: 'Sector, weekday, conviction and holding-period analytics from your own data.' },
]

export default function AuthShell({ title, subtitle, children, footer }: {
  title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col px-5 sm:px-10 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="EdgeLedger home"><Logo /></Link>
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium px-2 hover:underline" style={{ color: 'var(--text2)' }}>
              <ArrowLeft size={14} /> Back to home
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-[400px]">
            <h1 className="text-[32px] leading-[1.1] font-bold mb-2" style={{ color: 'var(--text)' }}>{title}</h1>
            <p className="text-[15px] mb-8" style={{ color: 'var(--text2)' }}>{subtitle}</p>
            {children}
            <p className="text-[14px] mt-6" style={{ color: 'var(--text2)' }}>{footer}</p>
          </div>
        </div>
      </div>

      {/* Product panel: always dark so it reads as a distinct surface in both themes */}
      <aside className="hidden lg:flex relative overflow-hidden flex-col justify-between p-12 xl:p-16"
        style={{ background: '#0A0E1F', color: '#EEF0FA' }}>
        <div aria-hidden className="absolute inset-0 opacity-60"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 10%, rgba(124,108,255,.35), transparent 45%), radial-gradient(circle at 10% 90%, rgba(45,212,160,.16), transparent 40%)' }} />
        <div className="relative">
          <h2 className="font-display text-[40px] xl:text-[46px] leading-[1.05] font-bold max-w-[460px]">
            Know your edge. Fix your leaks.
          </h2>
        </div>

        <div className="relative space-y-6 max-w-[460px]">
          {POINTS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(139,127,255,.16)', color: '#A89FFF' }}>
                <Icon size={19} />
              </span>
              <div>
                <p className="font-semibold text-[15px]">{title}</p>
                <p className="text-[14px] mt-0.5 leading-relaxed" style={{ color: '#A3AAC6' }}>{text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative rounded-2xl p-5 max-w-[460px]" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' }}>
          <p className="text-[12px] mb-2" style={{ color: '#6C7498' }}>Example insight</p>
          <p className="text-[15px] leading-relaxed">
            Trades tagged <span className="font-semibold" style={{ color: '#FF6B87' }}>FOMO</span> lost an average of{' '}
            <span className="mono font-semibold" style={{ color: '#FF6B87' }}>₹4,750</span>, while <span className="font-semibold" style={{ color: '#2DD4A0' }}>calm</span> entries made{' '}
            <span className="mono font-semibold" style={{ color: '#2DD4A0' }}>₹2,725</span>.
          </p>
        </div>
      </aside>
    </div>
  )
}
