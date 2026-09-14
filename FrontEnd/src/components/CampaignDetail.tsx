import { useEffect, useRef } from 'react'
import type { Campaign } from '../data/campaigns'
import { formatDate } from '../data/leads'

type Props = { campaign: Campaign; onClose: () => void }

// Karttaki düğme bu alanı açar. Kampanyanın tüm mevcut bilgileri burada okunur.
export default function CampaignDetail({ campaign, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Native dialog, klavye odağını pencerenin içinde tutar.
  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [])

  // null bilinmeyen tutardır; 0 ise gerçekten sıfır lira demektir.
  function formatMoney(value: number | null) {
    return value === null ? 'Belirtilmedi' : new Intl.NumberFormat('tr-TR', {
      style: 'currency', currency: campaign.currency,
    }).format(value)
  }
  return (
    <dialog
      ref={dialogRef}
      onCancel={event => { event.preventDefault(); onClose() }}
      onClick={event => {
        if (event.target !== event.currentTarget) return
        const bounds = event.currentTarget.getBoundingClientRect()
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) onClose()
      }}
      id={`campaign-detail-${campaign.id}`}
      className="campaign-detail campaign-modal"
      aria-labelledby={`campaign-detail-title-${campaign.id}`}
    >
      <div className="section-heading">
        <p className="eyebrow">KAMPANYA DETAYI</p>
        <button autoFocus type="button" className="secondary compact-button" onClick={onClose}>Kapat</button>
      </div>
      <h3 id={`campaign-detail-title-${campaign.id}`}>{campaign.name}</h3>
      <dl className="campaign-info">
        <div><dt>Kanal</dt><dd>{campaign.channel}</dd></div>
        <div><dt>Durum</dt><dd>{campaign.status}</dd></div>
        <div><dt>Başlangıç tarihi</dt><dd>{formatDate(campaign.startDate)}</dd></div>
        <div><dt>Bitiş tarihi</dt><dd>{formatDate(campaign.endDate)}</dd></div>
        <div><dt>Sorumlu</dt><dd>{campaign.owner}</dd></div>
      </dl>
      <h4 className="campaign-budget-title">Bütçe ve harcama</h4>
      <dl className="campaign-info">
        <div><dt>Planlanan bütçe</dt><dd>{formatMoney(campaign.plannedBudget)}</dd></div>
        <div><dt>Gerçekleşen harcama</dt><dd>{formatMoney(campaign.actualSpend)}</dd></div>
      </dl>
      <p className="campaign-detail-note">Müşteri adayı bağlantısı henüz eklenmedi.</p>
    </dialog>
  )
}
