import { emotionColor, labelMap } from '../../utils/formatters'

export default function EmotionPill({ emotion }: { emotion: string }) {
  const c = emotionColor[emotion] ?? 'var(--text2)'
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11.5px] font-medium"
      style={{ background: `color-mix(in srgb, ${c} 14%, transparent)`, color: `color-mix(in srgb, ${c} 82%, var(--text))` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
      {labelMap[emotion] ?? emotion}
    </span>
  )
}
