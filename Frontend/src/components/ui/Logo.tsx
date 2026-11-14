export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--brand)" />
      <path d="M8 21.5 13.5 15l4 3.5L24 10.5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="10.5" r="2.2" fill="var(--profit)" stroke="var(--brand)" strokeWidth="1.2" />
    </svg>
  )
}

export default function Logo({ size = 30, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      {withText && (
        <span className="font-display text-[18px] font-bold tracking-tight" style={{ color: 'var(--text)' }}>
          EdgeLedger
        </span>
      )}
    </span>
  )
}
