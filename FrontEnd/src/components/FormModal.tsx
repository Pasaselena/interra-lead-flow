import { useEffect, useId, useRef, type ReactNode } from 'react'

type Props = { title: string; onClose: () => void; children: ReactNode }

export default function FormModal({ title, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current
    const previousFocus = document.activeElement
    const overflow = document.body.style.overflow
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = overflow
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [])
  return <dialog ref={ref} className="form-modal" aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); onClose() }}>
    <div className="section-heading form-modal-heading">
      <h2 id={titleId}>{title}</h2>
      <button type="button" className="secondary compact-button" onClick={onClose} aria-label={`${title} penceresini kapat`}>Kapat ×</button>
    </div>
    {children}
  </dialog>
}
