import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: number
}

export default function Modal({ open, onClose, title, children, width = 460 }: Props) {
  useEffect(() => {
    if (!open) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(6,9,22,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              role="dialog" aria-modal="true" aria-label={title}
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.18, ease: [0.3, 0.7, 0.2, 1] }}
              className="card w-full overflow-hidden pointer-events-auto"
              style={{ maxWidth: width, boxShadow: '0 30px 80px -20px rgba(0,0,0,.45)' }}
            >
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <h2 className="text-[16px] font-bold" style={{ color: 'var(--text)' }}>{title}</h2>
                <button onClick={onClose} aria-label="Close"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg2)]"
                  style={{ color: 'var(--text2)' }}>
                  <X size={15} />
                </button>
              </div>
              <div className="p-5">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
