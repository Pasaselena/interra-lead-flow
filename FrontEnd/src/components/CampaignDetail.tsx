import { getLocale, ownerLabel, t } from '../i18n'
import './CampaignEmail.css'
import type { CampaignEmail } from '../data/campaignEmails'
import { useEffect, useRef } from 'react'
import type { Campaign } from '../data/campaigns'
import { formatDate } from '../data/leads'

type Props = { campaign: Campaign; emails: CampaignEmail[]; onCompose: () => void; onClose: () => void }

// Karttaki düğme bu alanı açar. Kampanyanın tüm mevcut bilgileri burada okunur.
export default function CampaignDetail({ campaign, emails, onCompose, onClose }: Props) {
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
    return value === null ? 'Belirtilmedi' : new Intl.NumberFormat(getLocale(), {
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
        <p className="eyebrow">{t("KAMPANYA DETAYI")}</p>
        <button autoFocus type="button" className="secondary compact-button" onClick={onClose}>{t("Kapat")}</button>
      </div>
      <h3 id={`campaign-detail-title-${campaign.id}`}>{campaign.name}</h3>
      <dl className="campaign-info">
        <div><dt>{t("Kanal")}</dt><dd>{t(campaign.channel)}</dd></div>
        <div><dt>{t("Durum")}</dt><dd>{t(campaign.status)}</dd></div>
        <div><dt>{t("Başlangıç tarihi")}</dt><dd>{formatDate(campaign.startDate)}</dd></div>
        <div><dt>{t("Bitiş tarihi")}</dt><dd>{formatDate(campaign.endDate)}</dd></div>
        <div><dt>{t("Sorumlu")}</dt><dd>{ownerLabel(campaign.owner)}</dd></div>
      </dl>
      <h4 className="campaign-budget-title">{t("Bütçe ve harcama")}</h4>
      <dl className="campaign-info">
        <div><dt>{t("Planlanan bütçe")}</dt><dd>{formatMoney(campaign.plannedBudget)}</dd></div>
        <div><dt>{t("Gerçekleşen harcama")}</dt><dd>{formatMoney(campaign.actualSpend)}</dd></div>
      </dl>
      <div className="actions"><button type="button" aria-haspopup="dialog" onClick={onCompose}>{t("E-posta Hazırla")}</button></div>
      <section className="email-history" aria-label={t("Demo gönderim geçmişi")}><h4>{t("Demo gönderim geçmişi")}</h4>
        {!emails.length && <p className="hint">{t("Henüz demo gönderimi yok.")}</p>}
        {emails.map(email => <details key={email.id}><summary>{email.subject} · {email.recipients.length} {t("alıcı · ")} {new Date(email.createdAt).toLocaleString(getLocale())} {t("· Demo")} </summary>
          <ul className="email-preview-recipients">{email.recipients.map(recipient => <li key={recipient.email}>{recipient.company} · {recipient.email}</li>)}</ul><p>{email.message}</p>
        </details>)}
      </section>
    </dialog>
  )
}
