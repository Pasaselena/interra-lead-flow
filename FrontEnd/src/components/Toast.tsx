import { t } from '../i18n'
import { useEffect, useRef } from 'react'
import './Toast.css'

type Props = { title: string; message: string; notificationId?: string; onDismiss: () => void }

export default function Toast({ title, message, notificationId, onDismiss }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  // Üst katmanda göster: kampanya detay penceresi açıkken de bildirim görünür.
  useEffect(() => {
    const element = ref.current
    if (!element) return
    element.setAttribute('popover', 'manual')
    if (message) element.showPopover()
    else element.hidePopover()
    return () => { element.hidePopover() }
  }, [message, notificationId])
  return <div ref={ref} className="toast-region" role="status" aria-live="polite" aria-atomic="true">
    {message && <div className="toast-success">
      <span className="toast-check" aria-hidden="true">✓</span>
      <div><strong>{title}</strong><p>{message}</p></div>
      <button type="button" className="toast-dismiss" aria-label={t("Bildirimi kapat")} onClick={onDismiss}>×</button>
    </div>}
  </div>
}
