import { useState } from 'react'
import Sidebar, { type Page } from './components/Sidebar'
import CampaignList from './components/CampaignList'
import { initialCampaigns } from './data/campaigns'
import LeadForm from './components/LeadForm'
import LeadTable from './components/LeadTable'
import LeadDetail from './components/LeadDetail'
import { initialLeads, statuses, todayDate, needsFollowUp, type Lead, type LeadDraft } from './data/leads'
import './App.css'







function App() {
  // State: değiştiğinde React'in ekranı yeniden oluşturduğu bilgiler.
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [owner, setOwner] = useState('')
  // Aktif bölüm değişir; ortak lead listesi App içinde korunur.
  const [page, setPage] = useState<Page>('dashboard')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  // Bunları ayrıca state'e koymuyoruz: güncel lead listesinden hesaplanıyorlar.
  const today = todayDate()
  const pending = leads.filter(needsFollowUp)
  const dueToday = pending.filter(lead => lead.followUp === today)
  const overdue = pending.filter(lead => lead.followUp < today)
  const selectedLead = leads.find(lead => lead.id === selectedId)
  const visibleLeads = leads.filter(lead =>
    `${lead.company} ${lead.name}`.toLocaleLowerCase('tr-TR').includes(search.trim().toLocaleLowerCase('tr-TR')) &&
    (!status || lead.status === status) && (!owner || lead.owner === owner),
  )
  const stats = [
    { label: 'Toplam lead', value: leads.length },
    { label: 'Yeni gelenler', value: leads.filter(lead => lead.status === 'Yeni').length },
    { label: 'Takip bekleyenler', value: dueToday.length + overdue.length },
    { label: 'Kazanılanlar', value: leads.filter(lead => lead.status === 'Kazanıldı').length },
  ]
  function addLead(draft: LeadDraft) {
    setLeads([...leads, { ...draft, id: crypto.randomUUID() }])
    setSearch(''); setStatus(''); setOwner('')
    setPage('leads')
    setMessage('Yeni lead eklendi.')
  }
  function saveLead(updated: Lead) {
    // map: yalnızca id'si eşleşen kaydı yenisiyle değiştirir.
    setLeads(leads.map(lead => lead.id === updated.id ? updated : lead))
    setSelectedId(null)
    setMessage('Lead güncellendi.')
  }
  function navigate(nextPage: Page) {
    setPage(nextPage)
    setSelectedId(null)
    setMessage('')
  }
  const titles = {
    dashboard: 'Genel Bakış',
    campaigns: 'Kampanyalar',
    leads: 'Müşteri Adayları',
    newLead: 'Yeni Lead Ekle',
  }
  return (
    <div className="app-layout">
      <Sidebar page={page} onNavigate={navigate} />
    <main className="dashboard">
      <header className="page-header"><div><p className="eyebrow">INTERRA / LEADFLOW</p><h1>{titles[page]}</h1><p>{page === 'campaigns' ? 'Tanıtım çalışmalarını, kanallarını ve kampanya takvimini bir arada gör.' : 'Müşteri adaylarını takip et, sıradaki görüşmeni planla.'}</p></div></header>
      <p className="demo-notice">Öğrenme sürümü · Örnek veriler kullanılıyor. Değişiklikler sayfa yenilendiğinde sıfırlanır.</p>
      <p role="status" className="feedback">{message}</p>
      {page === 'dashboard' && (
        <>
      <div className="stats">{stats.map(stat => <section className="stat" key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong></section>)}</div>
      <section className="follow-up" aria-label="Takip hatırlatmaları"><strong>Takip planın</strong><span>Bugün: {dueToday.length}</span><span className={overdue.length ? 'overdue' : ''}>Geciken: {overdue.length}</span><span className="hint">Tamamlanmamış, takip tarihi bugün veya geçmişte olan kayıtlar.</span></section>
        </>
      )}
      {page === 'campaigns' && <CampaignList campaigns={initialCampaigns} />}
      {page === 'newLead' && (
        <LeadForm onSave={addLead} onCancel={() => navigate('leads')} />
      )}
      {page === 'leads' && (
      <div className={selectedLead ? 'leads-layout has-detail' : 'leads-layout'}>
      <section className="panel lead-list" aria-labelledby="list-title">
        <div className="section-heading lead-list-heading">
          <div>
            <h2 id="list-title">Tüm lead'ler</h2>
            <small>{visibleLeads.length} kayıt</small>
          </div>
        </div>
        <div className="filters">
          <label className="search">Firma veya kişi ara<input type="search" placeholder="Firma veya kişi adı…" value={search} onChange={e => setSearch(e.target.value)} /></label>
          <label>Durum<select value={status} onChange={e => setStatus(e.target.value)}><option value="">Tüm durumlar</option>{statuses.map(value => <option key={value}>{value}</option>)}</select></label>
          <label>Sorumlu<select value={owner} onChange={e => setOwner(e.target.value)}><option value="">Tüm sorumlular</option>{[...new Set(leads.map(lead => lead.owner))].map(value => <option key={value}>{value}</option>)}</select></label>
          <button className="secondary" onClick={() => { setSearch(''); setStatus(''); setOwner('') }}>Temizle</button>
        </div>
        <LeadTable leads={visibleLeads} onSelect={id => { setSelectedId(id); setPage('leads') }} />
      </section>
        {selectedLead && (
          <LeadDetail
            key={selectedLead.id}
            lead={selectedLead}
            onSave={saveLead}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
      )}
    </main>
    </div>
  )
}
export default App
