import { t } from '../i18n'
import { cities } from '../data/cities'
import { useState, type FormEvent } from 'react'
import type { Customer, CustomerDraft } from '../data/customers'

type Props = { customer: Customer | null; onSave: (draft: CustomerDraft) => void; onCancel: () => void }

export default function CustomerForm({ customer, onSave, onCancel }: Props) {
  // Formun taslağı ayrı tutulur: Vazgeç'e basmak kayıtlı müşteriyi değiştirmez.
  const [draft, setDraft] = useState<CustomerDraft>(customer ?? {
    company: '', contact: '', email: '', phone: '', city: '', owner: '', notes: '',
  })
  const [error, setError] = useState('')
  function update(field: keyof CustomerDraft, value: string) {
    setDraft(current => ({ ...current, [field]: value }))
    setError('')
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.company.trim() || !draft.contact.trim()) {
      setError(t("Firma ve ilgili kişi alanlarını doldur.")); return
    }
    onSave({ company: draft.company.trim(), contact: draft.contact.trim(), email: draft.email.trim(),
      phone: draft.phone.trim(), city: draft.city.trim(), owner: draft.owner.trim() || 'Atanmadı', notes: draft.notes.trim() })
  }
  return <form onSubmit={submit}>
    <div className="form-grid">
      <label>{t("Firma *")}<input autoFocus required maxLength={150} value={draft.company} onChange={e => update('company', e.target.value)} /></label>
      <label>{t("İlgili kişi *")}<input required maxLength={100} value={draft.contact} onChange={e => update('contact', e.target.value)} /></label>
      <label>{t("E-posta")}<input type="email" maxLength={254} value={draft.email} onChange={e => update('email', e.target.value)} /></label>
      <label>{t("Telefon")}<input type="tel" maxLength={40} value={draft.phone} onChange={e => update('phone', e.target.value)} /></label>
      <label>{t("Şehir")}<select value={draft.city} onChange={e => update('city', e.target.value)}>
        <option value="">{t("Şehir seç")}</option>
        {draft.city && !cities.includes(draft.city) && <option value={draft.city}>{draft.city}</option>}
        {cities.map(city => <option key={city} value={city}>{city}</option>)}
      </select></label>
      <label>{t("Sorumlu")}<input maxLength={100} value={draft.owner} onChange={e => update('owner', e.target.value)} placeholder={t("Sorumlu adı")} /></label>
    </div>
    <label>{t("Notlar")}<textarea rows={3} maxLength={3000} value={draft.notes} onChange={e => update('notes', e.target.value)} placeholder={t("Müşteriyle ilgili önemli bilgiler…")} /></label>
    <p role="alert" className="overdue">{error}</p>
    <div className="actions"><button type="submit">{customer ? t("Değişiklikleri kaydet") : t("Müşteriyi kaydet")}</button><button type="button" className="secondary" onClick={onCancel}>{t("Vazgeç")}</button></div>
  </form>
}
