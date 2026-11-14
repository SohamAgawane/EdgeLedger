import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Brain, ShieldCheck, BarChart3, Upload, Bookmark, Target, AlertTriangle, Check, Plus, Minus } from 'lucide-react'
import Logo from '../components/ui/Logo'
import ThemeToggle from '../components/ui/ThemeToggle'
import EmotionPill from '../components/trade/EmotionPill'
import PnlBadge from '../components/trade/PnlBadge'
import { useAuthStore } from '../store/authStore'
import { emotionColor, fCurrency, fCompact, labelMap } from '../utils/formatters'

/* ------------------------------------------------------------------ */
/* Illustrative sample trades. Every number on this page is computed   */
/* from this list, so the story it tells is internally consistent.     */
/* ------------------------------------------------------------------ */
const SAMPLE = [
  { symbol: 'RELIANCE',   emotion: 'calm',      mistake: 'none',               pnl:  4200 },
  { symbol: 'HDFCBANK',   emotion: 'confident', mistake: 'none',               pnl:  3100 },
  { symbol: 'ADANIENT',   emotion: 'fomo',      mistake: 'fomo_entry',         pnl: -5600 },
  { symbol: 'INFY',       emotion: 'calm',      mistake: 'none',               pnl:  2400 },
  { symbol: 'TATAMOTORS', emotion: 'revenge',   mistake: 'revenge_trade',      pnl: -7800 },
  { symbol: 'SBIN',       emotion: 'confident', mistake: 'none',               pnl:  1900 },
  { symbol: 'ZOMATO',     emotion: 'fomo',      mistake: 'chasing_news',       pnl: -3900 },
  { symbol: 'ITC',        emotion: 'calm',      mistake: 'none',               pnl:  1500 },
  { symbol: 'PAYTM',      emotion: 'greedy',    mistake: 'oversized_position', pnl: -4300 },
  { symbol: 'LT',         emotion: 'confident', mistake: 'none',               pnl:  3600 },
  { symbol: 'BAJFINANCE', emotion: 'revenge',   mistake: 'revenge_trade',      pnl: -6100 },
  { symbol: 'TCS',        emotion: 'calm',      mistake: 'none',               pnl:  2800 },
]
const net   = SAMPLE.reduce((a, t) => a + t.pnl, 0)
const wins  = SAMPLE.filter((t) => t.pnl > 0).length
const EMOTIONS = ['calm', 'confident', 'greedy', 'fomo', 'revenge'] as const

const container = 'mx-auto w-full max-w-[1180px] px-5 sm:px-8'

/* ------------------------------ Nav -------------------------------- */
function Nav() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  return (
    <header className="sticky top-0 z-40" style={{ background: 'color-mix(in srgb, var(--bg) 80%, transparent)', backdropFilter: 'blur(14px)', borderBottom: '1px solid var(--border)' }}>
      <div className={`${container} flex items-center justify-between h-[68px]`}>
        <Link to="/" aria-label="EdgeLedger home"><Logo /></Link>
        <nav className="hidden md:flex items-center gap-8 text-[14.5px] font-medium" style={{ color: 'var(--text2)' }}>
          <a href="#demo" className="hover:text-[var(--text)] transition-colors">See it work</a>
          <a href="#features" className="hover:text-[var(--text)] transition-colors">Features</a>
          <a href="#how" className="hover:text-[var(--text)] transition-colors">How it works</a>
          <a href="#faq" className="hover:text-[var(--text)] transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isLoggedIn ? (
            <Link to="/dashboard" className="btn-primary !py-2.5 text-[14px]">Open dashboard <ArrowRight size={15} /></Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex btn-ghost !py-2.5 text-[14px]">Log in</Link>
              <Link to="/register" className="btn-primary !py-2.5 text-[14px]">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

/* ------------------------ Hero product preview --------------------- */
function EquityPreview() {
  const W = 560, H = 210, PAD = 14
  const cum = useMemo(() => SAMPLE.reduce<number[]>((a, t) => [...a, (a[a.length - 1] ?? 0) + t.pnl], [0]), [])
  const lo = Math.min(...cum, 0), hi = Math.max(...cum, 0)
  const x = (i: number) => PAD + (i / (cum.length - 1)) * (W - PAD * 2)
  const y = (v: number) => PAD + (1 - (v - lo) / (hi - lo)) * (H - PAD * 2)
  const d = cum.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Sample equity curve ending below zero despite most trades winning">
      <line x1={PAD} x2={W - PAD} y1={y(0)} y2={y(0)} stroke="var(--border2)" strokeDasharray="3 5" />
      <path d={d} pathLength={1} fill="none" stroke="var(--loss)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className="animate-draw" style={{ strokeDasharray: 1, strokeDashoffset: 1 }} />
      {SAMPLE.map((t, i) => t.mistake !== 'none' && (
        <circle key={i} cx={x(i + 1)} cy={y(cum[i + 1])} r="5" fill={emotionColor[t.emotion]} stroke="var(--card)" strokeWidth="2.5" />
      ))}
    </svg>
  )
}

function HeroPreview() {
  const leaks = useMemo(() => {
    const m = new Map<string, { n: number; pnl: number }>()
    SAMPLE.filter((t) => t.mistake !== 'none').forEach((t) => {
      const c = m.get(t.mistake) ?? { n: 0, pnl: 0 }
      m.set(t.mistake, { n: c.n + 1, pnl: c.pnl + t.pnl })
    })
    return [...m.entries()].sort((a, b) => a[1].pnl - b[1].pnl)
  }, [])

  return (
    <div className="card p-5 sm:p-6 w-full" style={{ boxShadow: '0 40px 80px -40px color-mix(in srgb, var(--brand) 45%, transparent), var(--shadow)' }}>
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <p className="text-[13px]" style={{ color: 'var(--text2)' }}>Net P&L · 12 sample trades</p>
          <p className="font-display text-[40px] sm:text-[46px] font-bold leading-tight num" style={{ color: 'var(--loss)' }}>{fCurrency(net)}</p>
        </div>
        <div className="text-right">
          <p className="text-[13px]" style={{ color: 'var(--text2)' }}>Win rate</p>
          <p className="font-display text-[28px] font-bold leading-tight num" style={{ color: 'var(--profit)' }}>{Math.round((wins / SAMPLE.length) * 100)}%</p>
        </div>
      </div>
      <p className="text-[13.5px] mb-3" style={{ color: 'var(--text2)' }}>
        {wins} of {SAMPLE.length} trades won. The account is still down. The dots mark the trades that did the damage.
      </p>
      <EquityPreview />
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[12.5px]" style={{ color: 'var(--text2)' }}>
        {Array.from(new Set(SAMPLE.filter((t) => t.mistake !== 'none').map((t) => t.emotion))).map((e) => (
          <span key={e} className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: emotionColor[e] }} />{labelMap[e]} entry</span>
        ))}
      </div>
      <div className="mt-4 pt-4 space-y-2.5" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>Leaks EdgeLedger found</p>
        {leaks.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between text-[13.5px]">
            <span className="flex items-center gap-2" style={{ color: 'var(--text2)' }}>
              <AlertTriangle size={14} style={{ color: 'var(--warn)' }} />
              {labelMap[k]} <span style={{ color: 'var(--text3)' }}>· {v.n} {v.n > 1 ? 'trades' : 'trade'}</span>
            </span>
            <span className="mono font-medium" style={{ color: 'var(--loss)' }}>{fCurrency(v.pnl)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Hero() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 grid-fade" />
      <div aria-hidden className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, var(--brand), transparent)' }} />
      <div className={`${container} relative grid xl:grid-cols-[minmax(0,1fr)_minmax(0,540px)] gap-12 xl:gap-14 items-center pt-14 pb-20 sm:pt-20 sm:pb-28`}>
        <div>
          <h1 className="text-[42px] sm:text-[56px] xl:text-[60px] leading-[1.04] font-extrabold" style={{ color: 'var(--text)' }}>
            Your P&L shows what happened. EdgeLedger shows why.
          </h1>
          <p className="mt-6 text-[17px] sm:text-[19px] leading-relaxed max-w-[560px]" style={{ color: 'var(--text2)' }}>
            A trading journal for people who want to stop repeating expensive mistakes. Log each trade with the emotion behind it, then see which feelings, habits and broken rules actually cost you money.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to={isLoggedIn ? '/dashboard' : '/register'} className="btn-primary !px-6 !py-3.5 !text-[15.5px]">
              {isLoggedIn ? 'Open dashboard' : 'Create your account'} <ArrowRight size={17} />
            </Link>
            {!isLoggedIn && <Link to="/login" className="btn-ghost !px-6 !py-3.5 !text-[15.5px]">Log in</Link>}
          </div>
          <p className="mt-4 text-[13.5px]" style={{ color: 'var(--text3)' }}>Log your first trade in under a minute. Import past trades from a CSV.</p>
        </div>
        <HeroPreview />
      </div>
    </section>
  )
}

/* --------------------------- Interactive demo ---------------------- */
function EmotionDemo() {
  const [active, setActive] = useState<string>('all')
  const matches = (e: string) => active === 'all' || e === active
  const subset = SAMPLE.filter((t) => matches(t.emotion))
  const total = subset.reduce((a, t) => a + t.pnl, 0)
  const avg = subset.length ? total / subset.length : 0
  const totalFor = (e: string) => SAMPLE.filter((t) => t.emotion === e).reduce((a, t) => a + t.pnl, 0)

  return (
    <section id="demo" className="py-20 sm:py-28" style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className={`${container} grid lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] gap-12 lg:gap-16 items-start`}>
        <div className="lg:sticky lg:top-28">
          <h2 className="text-[34px] sm:text-[44px] leading-[1.06] font-bold" style={{ color: 'var(--text)' }}>
            Every emotion has a price. Pick one and see it.
          </h2>
          <p className="mt-5 text-[16.5px] leading-relaxed" style={{ color: 'var(--text2)' }}>
            These are the same twelve sample trades from above. Filter by the emotion tagged before entry and watch the total change. Your own journal does this for every trade you log.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5" role="group" aria-label="Filter sample trades by emotion">
            <button onClick={() => setActive('all')} aria-pressed={active === 'all'}
              className="px-4 py-2 rounded-full text-[14px] font-medium transition-colors"
              style={{ border: '1px solid', borderColor: active === 'all' ? 'var(--text)' : 'var(--border2)', background: active === 'all' ? 'var(--text)' : 'var(--card)', color: active === 'all' ? 'var(--card)' : 'var(--text)' }}>
              All trades
            </button>
            {EMOTIONS.map((e) => {
              const on = active === e, t = totalFor(e), c = emotionColor[e]
              return (
                <button key={e} onClick={() => setActive(on ? 'all' : e)} aria-pressed={on}
                  className="flex items-center gap-2 pl-3 pr-3.5 py-2 rounded-full text-[14px] font-medium transition-all"
                  style={{ border: '1px solid', borderColor: on ? c : 'var(--border2)', background: on ? `color-mix(in srgb, ${c} 14%, var(--card))` : 'var(--card)', color: 'var(--text)', boxShadow: on ? `0 0 0 3px color-mix(in srgb, ${c} 20%, transparent)` : 'none' }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                  {labelMap[e]}
                  <span className="mono text-[12.5px]" style={{ color: t >= 0 ? 'var(--profit)' : 'var(--loss)' }}>{fCompact(t)}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="grid grid-cols-3 text-center" style={{ borderBottom: '1px solid var(--border)' }}>
            {[
              { l: 'Trades', v: String(subset.length), c: 'var(--text)' },
              { l: 'Total P&L', v: fCurrency(total), c: total >= 0 ? 'var(--profit)' : 'var(--loss)' },
              { l: 'Average per trade', v: fCurrency(avg), c: avg >= 0 ? 'var(--profit)' : 'var(--loss)' },
            ].map((s, i) => (
              <div key={s.l} className="py-4 px-2" style={{ borderLeft: i ? '1px solid var(--border)' : 'none' }}>
                <p className="text-[12.5px]" style={{ color: 'var(--text3)' }}>{s.l}</p>
                <p className="mono text-[18px] sm:text-[22px] font-semibold mt-0.5" style={{ color: s.c }}>{s.v}</p>
              </div>
            ))}
          </div>
          <ul>
            {SAMPLE.map((t, i) => (
              <li key={i} className="flex items-center gap-3 px-4 sm:px-5 py-3 transition-opacity duration-200"
                style={{ opacity: matches(t.emotion) ? 1 : 0.28, borderBottom: i < SAMPLE.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span className="mono text-[13px] font-semibold w-[104px] shrink-0" style={{ color: 'var(--text)' }}>{t.symbol}</span>
                <span className="shrink-0"><EmotionPill emotion={t.emotion} /></span>
                <span className="hidden sm:block text-[12.5px] flex-1 truncate" style={{ color: 'var(--text3)' }}>{t.mistake !== 'none' ? labelMap[t.mistake] : ''}</span>
                <span className="ml-auto sm:ml-0"><PnlBadge pnl={t.pnl} /></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------ Features --------------------------- */
function Tile({ className = '', icon: Icon, title, text, children }: {
  className?: string; icon: typeof Brain; title: string; text: string; children?: React.ReactNode
}) {
  return (
    <div className={`card p-6 sm:p-7 flex flex-col ${className}`}>
      <span className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--brand-bg)', color: 'var(--brand)' }}><Icon size={19} /></span>
      <h3 className="text-[21px] font-bold leading-tight" style={{ color: 'var(--text)' }}>{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed max-w-[460px]" style={{ color: 'var(--text2)' }}>{text}</p>
      {children && <div className="mt-6 flex-1 flex flex-col justify-end">{children}</div>}
    </div>
  )
}

function Features() {
  const days = [['Mon', 2.1], ['Tue', 3.4], ['Wed', -1.2], ['Thu', -3.8], ['Fri', 1.6]] as const
  const sectors = [['Banking', 38, true], ['IT', 24, false], ['Energy', 18, false]] as const
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className={container}>
        <h2 className="text-[34px] sm:text-[46px] leading-[1.06] font-bold max-w-[760px]" style={{ color: 'var(--text)' }}>
          Everything you need to review your trading honestly.
        </h2>
        <div className="mt-12 grid lg:grid-cols-6 gap-5">
          <Tile className="lg:col-span-4" icon={ShieldCheck} title="Rules that warn you in the moment"
            text="Set a position-size cap, a daily trade limit, a time cutoff and a revenge-trade check. When a trade breaks one, you get a warning as you log it. Nothing is blocked, so you stay in control.">
            <div className="rounded-xl p-4 space-y-2.5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              {[['Max 3 trades per day', true], ['No trades after 15:30', true], ['Warn if trading within 30 min of a loss', true]].map(([l, on]) => (
                <div key={String(l)} className="flex items-center justify-between text-[13.5px]" style={{ color: 'var(--text)' }}>
                  {l}
                  <span className="w-9 h-5 rounded-full relative" style={{ background: on ? 'var(--brand)' : 'var(--border2)' }}>
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full" style={{ background: 'var(--card)' }} />
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium" style={{ background: 'var(--warn-bg)', color: 'var(--warn)' }}>
                <AlertTriangle size={15} /> This is your 4th trade today. Your limit is 3.
              </div>
            </div>
          </Tile>

          <Tile className="lg:col-span-2" icon={BarChart3} title="Patterns by weekday and sector"
            text="Find the days and sectors where you actually make money.">
            <div className="flex justify-between gap-2">
              {days.map(([d, v]) => (
                <div key={d} className="flex-1 flex flex-col items-center">
                  <div className="h-[56px] w-full flex items-end"><div className="w-full rounded-t-md" style={{ height: v > 0 ? `${v * 14}px` : 0, background: 'var(--profit)' }} /></div>
                  <div className="h-px w-full" style={{ background: 'var(--border2)' }} />
                  <div className="h-[56px] w-full"><div className="w-full rounded-b-md" style={{ height: v < 0 ? `${-v * 14}px` : 0, background: 'var(--loss)' }} /></div>
                  <span className="text-[12px] mt-1" style={{ color: 'var(--text3)' }}>{d}</span>
                </div>
              ))}
            </div>
          </Tile>

          <Tile className="lg:col-span-2" icon={Target} title="Risk concentration"
            text="See how much of your capital sits in each sector, flagged at 30%.">
            <div className="space-y-3">
              {sectors.map(([s, p, flag]) => (
                <div key={s}>
                  <div className="flex justify-between text-[13px] mb-1" style={{ color: 'var(--text2)' }}>
                    <span>{s}</span><span className="mono" style={{ color: flag ? 'var(--warn)' : 'var(--text)' }}>{p}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--bg2)', boxShadow: 'inset 0 0 0 1px var(--border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${p}%`, background: flag ? 'var(--warn)' : 'var(--brand)' }} />
                  </div>
                </div>
              ))}
            </div>
          </Tile>

          <Tile className="lg:col-span-2" icon={Upload} title="Bring your history with you"
            text="Import past trades from a CSV. Rows that fail are listed with the reason, so nothing disappears quietly.">
            <div className="rounded-xl px-4 py-3 text-[13.5px] flex items-center gap-2.5" style={{ background: 'var(--profit-bg)', color: 'var(--profit)' }}>
              <Check size={16} /> 184 imported · 3 need a fix
            </div>
          </Tile>

          <Tile className="lg:col-span-2" icon={Bookmark} title="A watchlist that remembers why"
            text="Save the symbol, tag it, and write the thesis while it is fresh.">
            <div className="rounded-xl p-4" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="mono text-[14px] font-semibold" style={{ color: 'var(--text)' }}>TATAMOTORS</span>
                <span className="text-[11.5px] font-medium px-1.5 py-0.5 rounded" style={{ background: 'var(--brand-bg)', color: 'var(--brand)' }}>breakout</span>
              </div>
              <p className="text-[13px]" style={{ color: 'var(--text2)' }}>Wait for the retest above the base before entering.</p>
            </div>
          </Tile>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------- How it works ------------------------- */
function How() {
  const steps = [
    { icon: Plus,      title: 'Log the trade',          text: 'Symbol, prices, quantity and dates. Your estimated P&L updates as you type.' },
    { icon: Brain,     title: 'Tag how you felt',       text: 'Pick your emotion before and after, a conviction score from 1 to 10, and any mistake you made.' },
    { icon: BarChart3, title: 'Review what repeats',    text: 'Your dashboard ranks your costliest mistakes and shows win rate, profit factor and streaks.' },
    { icon: ShieldCheck, title: 'Turn it into a rule',  text: 'Write the rule that would have prevented it. EdgeLedger warns you the next time you drift.' },
  ]
  return (
    <section id="how" className="py-20 sm:py-28" style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className={container}>
        <h2 className="text-[34px] sm:text-[46px] leading-[1.06] font-bold max-w-[640px]" style={{ color: 'var(--text)' }}>
          A loop you can run in five minutes after the close.
        </h2>
        <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 relative">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-11 h-11 rounded-full flex items-center justify-center font-display text-[17px] font-bold shrink-0"
                  style={{ background: 'var(--card)', border: '1px solid var(--border2)', color: 'var(--brand)' }}>{i + 1}</span>
                {i < steps.length - 1 && <span aria-hidden className="hidden lg:block h-px flex-1" style={{ background: 'var(--border2)' }} />}
              </div>
              <h3 className="text-[19px] font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}><Icon size={17} style={{ color: 'var(--brand)' }} />{title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: 'var(--text2)' }}>{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* -------------------------------- FAQ ------------------------------ */
const FAQ = [
  { q: 'Does EdgeLedger connect to my broker?', a: 'Not yet. You can log a trade in under a minute, or import your history from a CSV file.' },
  { q: 'Will the rules stop me from placing trades?', a: 'No. EdgeLedger is a journal, not a trading platform. Rules show you a warning when a logged trade breaks one, and the decision stays yours.' },
  { q: 'Which markets and currency does it use?', a: 'Amounts are shown in Indian rupees, and sectors follow common Indian market groupings. You can log any equity symbol you trade.' },
  { q: 'Is this investment advice?', a: 'No. EdgeLedger helps you review your own past behavior. It does not recommend trades or predict markets.' },
]

function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className={`${container} grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-10 lg:gap-20`}>
        <h2 className="text-[34px] sm:text-[44px] leading-[1.06] font-bold" style={{ color: 'var(--text)' }}>Questions traders ask first</h2>
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {FAQ.map((f, i) => {
            const on = open === i
            return (
              <div key={f.q} style={{ borderBottom: '1px solid var(--border)' }}>
                <button onClick={() => setOpen(on ? null : i)} aria-expanded={on}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left">
                  <span className="text-[17px] font-semibold" style={{ color: 'var(--text)' }}>{f.q}</span>
                  <span className="shrink-0" style={{ color: 'var(--text3)' }}>{on ? <Minus size={18} /> : <Plus size={18} />}</span>
                </button>
                {on && <p className="pb-5 -mt-1 text-[15.5px] leading-relaxed max-w-[620px]" style={{ color: 'var(--text2)' }}>{f.a}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------- Final CTA + footer ------------------- */
function Cta() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  return (
    <section className={`${container} pb-20 sm:pb-28`}>
      <div className="relative overflow-hidden rounded-[28px] px-6 sm:px-14 py-14 sm:py-20" style={{ background: '#0A0E1F', color: '#EEF0FA' }}>
        <div aria-hidden className="absolute inset-0 opacity-70"
          style={{ backgroundImage: 'radial-gradient(circle at 85% 0%, rgba(124,108,255,.5), transparent 50%), radial-gradient(circle at 0% 100%, rgba(45,212,160,.18), transparent 45%)' }} />
        <div className="relative max-w-[640px]">
          <h2 className="text-[34px] sm:text-[48px] leading-[1.05] font-bold">Find your leaks before the next trade does.</h2>
          <p className="mt-4 text-[17px]" style={{ color: '#A3AAC6' }}>Start with the trades you already have. The patterns are usually there.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={isLoggedIn ? '/dashboard' : '/register'} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[10px] font-semibold text-[15.5px] transition-transform active:scale-[.98]"
              style={{ background: '#EEF0FA', color: '#0A0E1F' }}>
              {isLoggedIn ? 'Open dashboard' : 'Create your account'} <ArrowRight size={17} />
            </Link>
            {!isLoggedIn && (
              <Link to="/login" className="inline-flex items-center px-6 py-3.5 rounded-[10px] font-medium text-[15.5px]"
                style={{ border: '1px solid rgba(255,255,255,.22)', color: '#EEF0FA' }}>Log in</Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)' }}>
      <div className={`${container} py-10 flex flex-col sm:flex-row gap-6 sm:items-center justify-between`}>
        <div>
          <Logo size={26} />
          <p className="mt-3 text-[13px] max-w-[460px] leading-relaxed" style={{ color: 'var(--text3)' }}>
            EdgeLedger is a journaling and analytics tool. It does not provide investment advice. The trades on this page are illustrative samples.
          </p>
        </div>
        <div className="flex items-center gap-6 text-[14px] font-medium" style={{ color: 'var(--text2)' }}>
          <Link to="/login" className="hover:text-[var(--text)]">Log in</Link>
          <Link to="/register" className="hover:text-[var(--text)]">Sign up</Link>
          <span style={{ color: 'var(--text3)' }}>© {new Date().getFullYear()} EdgeLedger</span>
        </div>
      </div>
    </footer>
  )
}

export default function Landing() {
  return (
    <div style={{ background: 'var(--bg)' }}>
      <Nav />
      <main>
        <Hero />
        <EmotionDemo />
        <Features />
        <How />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  )
}
