import { useState, type FormEvent } from 'react'
import { statuses, type Lead, type LeadStatus } from '../data/leads'

type Props = { lead: Lead; onSave: (lead: Lead) => void; onClose: () => void }
export default function LeadDetail({ lead, onSave, onClose }: Props) {
  const [status, setStatus] = useState(lead.status)
  const [notes, setNotes] = useState(lead.notes)
  const [followUp, setFollowUp] = useState(lead.followUp)
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({ ...lead, status, notes, followUp })
  }
  return (
    <section className="panel detail" aria-labelledby="detail-title">
      <div className="section-heading"><div><p className="eyebrow">LEAD DETAYI</p><h2 id="detail-title">{lead.company}</h2></div><button autoFocus className="secondary" onClick={onClose}>Kapat</button></div>
      <p>{lead.name} · {lead.owner}</p>
      <p>{lead.email || 'E-posta eklenmedi'} · {lead.phone || 'Telefon eklenmedi'}</p>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>Durum<select value={status} onChange={e => setStatus(e.target.value as LeadStatus)}>{statuses.map(value => <option key={value}>{value}</option>)}</select></label>
          <label>Sonraki takip<input type="date" value={followUp} onChange={e => setFollowUp(e.target.value)} /></label>
        </div>
        <label>Notlar<textarea rows={4} value={notes} onChange={e => setNotes(e.target.value)} /></label>
        <button type="submit">Değişiklikleri kaydet</button>
      </form>
    </section>
  )
}
