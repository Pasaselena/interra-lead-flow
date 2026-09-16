import { useState, type FormEvent } from 'react'
import FormModal from './FormModal'
import { dealStages, dealTotals, formatDealAmount, isOpenDeal, type Deal, type DealDraft, type DealStage } from '../data/deals'
import { formatDate, todayDate, type Lead } from '../data/leads'

type Props = {
  deals: Deal[]
  leads: Lead[]
  onSave: (draft: DealDraft, id?: string) => void
  onStageChange: (id: string, stage: DealStage) => void
  onOpenLead: (id: string) => void
}

function OpportunityForm({ deal, leads, onSave, onCancel }: {
  deal: Deal | null; leads: Lead[]; onSave: (draft: DealDraft, id?: string) => void; onCancel: () => void
}) {
  const [error, setError] = useState('')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const title = String(data.get('title') || '').trim()
    const leadId = String(data.get('leadId') || '')
    const rawAmount = String(data.get('amount') || '')
    const amount = rawAmount === '' ? null : Number(rawAmount)
    const stage = String(data.get('stage')) as DealStage
    if (!title) { setError('Lütfen fırsat adı gir.'); return }
    if (!leads.some(lead => lead.id === leadId)) { setError('Lütfen bir müşteri adayı seç.'); return }
    if (amount !== null && (!Number.isFinite(amount) || amount < 0)) { setError('Tutar sıfır veya pozitif olmalı.'); return }
    if (!dealStages.includes(stage)) return
    onSave({ title, leadId, amount, stage, closeDate: String(data.get('closeDate') || ''), notes: String(data.get('notes') || '').trim() }, deal?.id)
  }
  return <form onSubmit={submit}>
    <div className="form-grid">
      <label>Fırsat adı *<input autoFocus name="title" required maxLength={150} defaultValue={deal?.title} placeholder="Örn. Akıllı ev otomasyonu teklifi" /></label>
      <label>Müşteri adayı *<select name="leadId" required defaultValue={deal?.leadId || ''}><option value="" disabled>Aday seç</option>{leads.map(lead => <option key={lead.id} value={lead.id}>{lead.company} · {lead.name}</option>)}</select></label>
      <label>Tutar (₺)<input name="amount" type="number" min="0" max="999999999999" step="0.01" defaultValue={deal?.amount ?? ''} placeholder="Henüz belli değilse boş bırak" /></label>
      <label>Tahmini kapanış tarihi<input name="closeDate" type="date" defaultValue={deal?.closeDate || ''} /></label>
      <label>Aşama<select name="stage" defaultValue={deal?.stage || 'Görüşme'}>{dealStages.map(stage => <option key={stage}>{stage}</option>)}</select></label>
    </div>
    <label>Notlar<textarea name="notes" rows={3} maxLength={3000} defaultValue={deal?.notes} placeholder="Teklif kapsamı, sonraki adım veya görüşme notu…" /></label>
    <p role="alert" className="overdue">{error}</p>
    <div className="actions"><button type="submit" disabled={!leads.length}>{deal ? 'Değişiklikleri kaydet' : 'Fırsatı kaydet'}</button><button type="button" className="secondary" onClick={onCancel}>Vazgeç</button></div>
  </form>
}

export default function SalesPipeline({ deals, leads, onSave, onStageChange, onOpenLead }: Props) {
  const [search, setSearch] = useState('')
  const [owner, setOwner] = useState('')
  const [editor, setEditor] = useState<Deal | 'new' | null>(null)
  const [notice, setNotice] = useState('')
  const today = todayDate()
  const filtered = deals.filter(deal => {
    const lead = leads.find(item => item.id === deal.leadId)
    return `${deal.title} ${lead?.company || ''} ${lead?.name || ''}`.toLocaleLowerCase('tr-TR').includes(search.trim().toLocaleLowerCase('tr-TR')) && (!owner || lead?.owner === owner)
  })
  const open = dealTotals(filtered.filter(isOpenDeal))
  const won = dealTotals(filtered.filter(deal => deal.stage === 'Kazanıldı'))
  const overdue = filtered.filter(deal => isOpenDeal(deal) && deal.closeDate && deal.closeDate < today).length
  const owners = [...new Set(leads.map(lead => lead.owner))]

  return <section aria-label="Satış fırsatları">
    <div className="section-heading sales-heading"><div><h2>Satış sürecini takip et</h2><p className="hint">Bir müşteri adayına birden fazla fırsat ekleyebilir, her satışı ayrı takip edebilirsin.</p></div><button type="button" aria-haspopup="dialog" disabled={!leads.length} onClick={() => { setNotice(''); setEditor('new') }}>+ Yeni Fırsat</button></div>
    {!leads.length && <p className="demo-notice">Fırsat oluşturmak için önce Müşteri Adayları bölümünden bir kayıt ekle.</p>}
    <div className="stats sales-stats">
      <section className="stat"><span>Açık fırsatlar</span><strong>{open.count}</strong></section>
      <section className="stat"><span>Açık fırsat tutarı</span><strong>{formatDealAmount(open.amount)}</strong><small>{open.unspecified ? `${open.unspecified} fırsatın tutarı henüz belirtilmedi` : 'Görüşme, teklif ve müzakere toplamı'}</small></section>
      <section className="stat"><span>Kazanılan tutar</span><strong>{formatDealAmount(won.amount)}</strong><small>{won.count} kazanılan fırsat{won.unspecified ? ` · ${won.unspecified} tutar belirtilmedi` : ''}</small></section>
      <section className="stat"><span>Kapanışı geciken</span><strong className={overdue ? 'overdue' : ''}>{overdue}</strong></section>
    </div>
    <div className="filters sales-filters">
      <label className="search">Fırsat veya firma ara<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Fırsat, firma veya kişi adı…" /></label>
      <label>Aday sorumlusu<select value={owner} onChange={event => setOwner(event.target.value)}><option value="">Tüm sorumlular</option>{owners.map(value => <option key={value}>{value}</option>)}</select></label>
      <button type="button" className="secondary" onClick={() => { setSearch(''); setOwner('') }}>Temizle</button>
    </div>
    <p className="hint">{filtered.length} fırsat gösteriliyor. Özetler seçili filtrelere göre hesaplanır. Kartın aşama alanından satışın durumunu değiştirebilirsin.</p>
    <p role="status" className="hint">{notice}</p>
    {!deals.length && <p className="demo-notice">Henüz satış fırsatı yok. “Yeni Fırsat” ile ilk teklifini oluştur.</p>}
    <div className="sales-board" role="region" aria-label="Satış aşamaları, yatay kaydırılabilir" tabIndex={0}>
      {dealStages.map((stage, index) => {
        const stageDeals = filtered.filter(deal => deal.stage === stage)
        const totals = dealTotals(stageDeals)
        return <section className={`sales-column sales-stage-${index}`} key={stage} aria-labelledby={`stage-${index}`}>
          <header className="sales-column-heading"><div className="section-heading"><h3 id={`stage-${index}`}>{stage}</h3><span className="badge">{totals.count}</span></div><small>{formatDealAmount(totals.amount)}{totals.unspecified > 0 && ` · ${totals.unspecified} belirsiz tutar`}</small></header>
          <div className="sales-cards">{stageDeals.map(deal => {
            const lead = leads.find(item => item.id === deal.leadId)
            return <article className="sales-card" key={deal.id}>
              <button className="text-button sales-card-title" type="button" aria-haspopup="dialog" aria-label={`${deal.title}: düzenle`} onClick={() => { setNotice(''); setEditor(deal) }}>{deal.title}</button>
              {lead && <button type="button" className="text-button sales-company" onClick={() => onOpenLead(lead.id)}>{lead.company} ↗</button>}
              <strong className="sales-amount">{formatDealAmount(deal.amount)}</strong>
              <p className="hint">Tahmini kapanış: {formatDate(deal.closeDate)}</p>
              {isOpenDeal(deal) && deal.closeDate && deal.closeDate < today && <p className="overdue">Kapanış tarihi geçti</p>}
              <small>Sorumlu: {lead?.owner || 'Atanmadı'}</small>
              <label className="sales-stage-label">Aşama<select aria-label={`${deal.title} aşaması`} value={deal.stage} onChange={event => { const next = event.target.value as DealStage; onStageChange(deal.id, next); setNotice(`${deal.title}: ${next} aşamasına taşındı.`) }}>{dealStages.map(value => <option key={value}>{value}</option>)}</select></label>
            </article>
          })}{!stageDeals.length && <p className="sales-empty">{search || owner ? 'Filtreye uygun fırsat yok.' : 'Bu aşamada fırsat yok.'}</p>}</div>
        </section>
      })}
    </div>
    {editor !== null && <FormModal title={editor === 'new' ? 'Yeni Satış Fırsatı' : 'Satış Fırsatını Düzenle'} onClose={() => setEditor(null)}>
      <OpportunityForm deal={editor === 'new' ? null : editor} leads={leads} onCancel={() => setEditor(null)} onSave={(draft, id) => { onSave(draft, id); setEditor(null); setSearch(''); setOwner(''); setNotice(id ? 'Satış fırsatı güncellendi.' : 'Yeni satış fırsatı eklendi.') }} />
    </FormModal>}
  </section>
}
