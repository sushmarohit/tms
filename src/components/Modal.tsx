import React, { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/60" aria-hidden onClick={onClose} />
      <div
        className="relative flex max-h-[90vh] w-full flex-col rounded-t-xl border border-slate-600 bg-slate-800 shadow-xl sm:max-h-[85vh] sm:max-w-lg sm:rounded-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-600 px-4 py-3 sm:px-6 sm:py-4">
          <h2 id="modal-title" className="min-w-0 truncate text-base font-semibold text-white sm:text-lg">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
            aria-label="Close"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-6">{children}</div>
      </div>
    </div>
  )
}
