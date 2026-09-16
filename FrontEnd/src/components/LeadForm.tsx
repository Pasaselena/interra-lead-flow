import { useState, type FormEvent } from 'react'
import { statuses, type LeadDraft } from '../data/leads'

type Props = { onSave: (lead: LeadDraft) => void; onCancel: () => void }

export default function LeadForm({ onSave, onCancel }: Props) {
  // Formdaki yazılar, kaydet düğmesine basılana kadar burada tutulur.
  const [draft, setDraft] = useState<LeadDraft>({ company: '', name: '', email: '', phone: '', source: 'Web sitesi', status: 'Yeni', owner: '', followUp: '', notes: '' })
  function update(field: keyof LeadDraft, value: string) {
    setDraft({ ...draft, [field]: value })
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.company.trim() || !draft.name.trim()) return
    onSave({ ...draft, company: draft.company.trim(), name: draft.name.trim(), owner: draft.owner.trim() || 'Atanmadı' })
  }
  return (
    <div>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>Firma *<input autoFocus required value={draft.company} onChange={e => update('company', e.target.value)} /></label>
          <label>İlgili kişi *<input required value={draft.name} onChange={e => update('name', e.target.value)} /></label>
          <label>E-posta<input type="email" value={draft.email} onChange={e => update('email', e.target.value)} /></label>
          <label>Telefon<input type="tel" value={draft.phone} onChange={e => update('phone', e.target.value)} /></label>
          <label>Kaynak<select value={draft.source} onChange={e => update('source', e.target.value)}>{['Web sitesi', 'Fuar', 'Referans', 'Sosyal medya', 'Diğer'].map(source => <option key={source}>{source}</option>)}</select></label>
          <label>Durum<select value={draft.status} onChange={e => update('status', e.target.value)}>{statuses.map(status => <option key={status}>{status}</option>)}</select></label>
          <label>Sorumlu<input value={draft.owner} onChange={e => update('owner', e.target.value)} placeholder="Örn. Selena" /></label>
          <label>Sonraki takip<input type="date" value={draft.followUp} onChange={e => update('followUp', e.target.value)} /></label>
        </div>
        <label>Notlar<textarea rows={3} value={draft.notes} onChange={e => update('notes', e.target.value)} /></label>
        <div className="actions"><button type="submit">Lead'i kaydet</button><button type="button" className="secondary" onClick={onCancel}>Vazgeç</button></div>
      </form>
    </div>
  )
}
