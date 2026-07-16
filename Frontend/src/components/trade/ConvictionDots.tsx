export default function ConvictionDots({ score }: { score?: number }) {
  if (!score) return <span style={{ color: 'var(--text3)' }} className="text-[11px]">—</span>
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: 5, height: 5,
            background: i < score ? 'var(--brand)' : 'var(--border2)',
          }}
        />
      ))}
      <span className="ml-1 text-[11px] mono" style={{ color: 'var(--text3)' }}>{score}</span>
    </div>
  )
}
