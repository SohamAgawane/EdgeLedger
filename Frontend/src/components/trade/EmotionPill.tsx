import { emotionColor, labelMap } from '../../utils/formatters'

export default function EmotionPill({ emotion }: { emotion: string }) {
  const c = emotionColor[emotion] ?? { bg: 'var(--bg2)', text: 'var(--text2)' }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize"
      style={{ background: c.bg, color: c.text }}
    >
      {labelMap[emotion] ?? emotion}
    </span>
  )
}
