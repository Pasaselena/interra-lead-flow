import { t } from '../i18n'
import { useRef, useState } from 'react'
import type { Campaign } from '../data/campaigns'
import type { Customer } from '../data/customers'
import { hasEmail, type CampaignEmailDraft } from '../data/campaignEmails'
import './CampaignEmail.css'

type Props = { campaign: Campaign; customers: Customer[]; onSave: (draft: CampaignEmailDraft) => void; onCancel: () => void }

export default function CampaignEmailComposer({ campaign, customers, onSave, onCancel }: Props) {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [subject, setSubject] = useState(campaign.name)
  const [message, setMessage] = useState(`Merhaba,\n\n${campaign.description}\n\nDetaylı bilgi için bizimle iletişime geçebilirsiniz.\n\nInterra`)
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState('')
  const submitted = useRef(false)
  const filtered = customers.filter(customer => `${customer.company} ${customer.contact} ${customer.email}`.toLocaleLowerCase('tr-TR').includes(search.trim().toLocaleLowerCase('tr-TR')))
  const selected = customers.filter(customer => selectedIds.includes(customer.id) && hasEmail(customer.email))
  // Aynı e-posta adresi iki müşteri kaydında olsa bile tek alıcı oluştur.
  const recipients = [...new Map(selected.map(customer => [customer.email.trim().toLowerCase(), {
    customerId: customer.id, company: customer.company, email: customer.email.trim(),
  }])).values()]
  const valid = recipients.length > 0 && subject.trim().length > 0 && message.trim().length > 0

  return <section className="campaign-email" aria-label={t("Kampanya e-postası hazırla")}>
    <h4>{preview ? t("E-posta önizlemesi") : t("Müşterilere e-posta hazırla")}</h4>
    <p className="demo-notice">{t("Demo: Gerçek e-posta gönderilmez. Kayıtlar sayfa yenilendiğinde silinir.")}</p>
    {!preview ? <form onSubmit={event => { event.preventDefault(); if (!valid) { setError(t("En az bir geçerli alıcı seç; konu ve mesajı doldur.")); return } setError(''); setPreview(true) }}>
      <label>{t("Müşteri ara")}<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={t("Firma, kişi veya e-posta…")} /></label>
      <div className="actions"><button type="button" className="secondary" onClick={() => setSelectedIds(current => [...new Set([...current, ...filtered.filter(customer => hasEmail(customer.email)).map(customer => customer.id)])])}>{t("Görünen uygun müşterileri seç")}</button></div>
      <div className="email-recipients">{filtered.map(customer => <label key={customer.id} className="email-recipient">
        <input type="checkbox" checked={selectedIds.includes(customer.id)} disabled={!hasEmail(customer.email)} onChange={event => setSelectedIds(current => event.target.checked ? [...current, customer.id] : current.filter(id => id !== customer.id))} />
        <span><strong>{customer.company}</strong><small>{customer.contact} · {customer.email || t("E-posta yok")}</small>{!hasEmail(customer.email) && <small className="overdue">{t("Seçmek için Müşterilerim bölümünde geçerli e-posta ekle.")}</small>}</span>
      </label>)}</div>
      {!customers.length && <p className="empty">{t("Önce Müşterilerim bölümünden e-posta adresi olan bir müşteri ekle.")}</p>}
      {customers.length > 0 && !filtered.length && <p className="empty">{t("Aramaya uygun müşteri yok.")}</p>}
      <p className="hint" role="status">{selected.length} {t("müşteri seçili · ")} {recipients.length} {t("benzersiz e-posta adresi")} </p>
      <label>{t("Konu")}<input required maxLength={200} value={subject} onChange={event => setSubject(event.target.value)} /></label>
      <label>{t("Mesaj")}<textarea required rows={7} maxLength={10000} value={message} onChange={event => setMessage(event.target.value)} /></label>
      <p role="alert" className="overdue">{error}</p>
      <div className="actions"><button type="submit" disabled={!recipients.length}>{t("Önizle")}</button><button type="button" className="secondary" onClick={onCancel}>{t("Vazgeç")}</button></div>
    </form> : <div>
      <p className="hint">{recipients.length} {t("alıcı için demo oluşturulacak. Bu liste e-posta gövdesine eklenmez.")} </p>
      <ul className="email-preview-recipients">{recipients.map(recipient => <li key={recipient.email}>{recipient.company} · {recipient.email}</li>)}</ul>
      <article className="email-preview"><small>{t("KONU")}</small><h4>{subject.trim()}</h4><p>{message.trim()}</p></article>
      <div className="actions"><button type="button" onClick={() => {
        if (!valid || submitted.current) return
        submitted.current = true
        onSave({ campaignId: campaign.id, subject: subject.trim(), message: message.trim(), recipients })
      }}>{t("Demo gönderimini tamamla")}</button><button type="button" className="secondary" onClick={() => setPreview(false)}>{t("Düzenlemeye dön")}</button></div>
    </div>}
  </section>
}
