export default function ConvictionDots({ score }: { score?: number }) {
  if (!score) return <span style={{ color: 'var(--text3)' }} className="text-[12px]">—</span>
  return (
    <div className="flex items-center gap-2" title={`Conviction ${score}/10`}>
      <div className="h-1.5 w-14 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded-full" style={{ width: `${score * 10}%`, background: 'var(--brand)' }} />
      </div>
      <span className="text-[11.5px] mono" style={{ color: 'var(--text3)' }}>{score}</span>
    </div>
  )
}
