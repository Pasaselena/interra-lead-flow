import Dashboard from './components/Dashboard'
import FormModal from './components/FormModal'
import Reports from './components/Reports'
import Customers from './components/Customers'
import type { Customer, CustomerDraft } from './data/customers'
import SalesPipeline from './components/SalesPipeline'
import type { Deal } from './data/deals'
import LeadMap from './components/LeadMap'
import TasksCalendar, { type Task } from './components/TasksCalendar'
import { useState } from 'react'
import Sidebar, { type Page } from './components/Sidebar'
import CampaignList from './components/CampaignList'
import { initialCampaigns } from './data/campaigns'
import LeadForm from './components/LeadForm'
import LeadTable from './components/LeadTable'
import LeadDetail from './components/LeadDetail'
import { initialLeads, statuses, type Lead, type LeadDraft } from './data/leads'
import './App.css'
import './panel-theme.css'







function App() {
  // State: değiştiğinde React'in ekranı yeniden oluşturduğu bilgiler.
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [owner, setOwner] = useState('')
  // Aktif bölüm değişir; ortak lead listesi App içinde korunur.
  const [leadView, setLeadView] = useState<'list' | 'map'>('list')
  const [page, setPage] = useState<Page>('dashboard')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const selectedLead = leads.find(lead => lead.id === selectedId)
  const visibleLeads = leads.filter(lead =>
    `${lead.company} ${lead.name}`.toLocaleLowerCase('tr-TR').includes(search.trim().toLocaleLowerCase('tr-TR')) &&
    (!status || lead.status === status) && (!owner || lead.owner === owner),
  )
  function addLead(draft: LeadDraft) {
    setLeads([...leads, { ...draft, id: crypto.randomUUID() }])
    setSearch(''); setStatus(''); setOwner('')
    setPage('leads')
    setLeadView('list')
    setShowLeadForm(false)
    setMessage('Yeni lead eklendi.')
  }
  function saveLead(updated: Lead) {
    // map: yalnızca id'si eşleşen kaydı yenisiyle değiştirir.
    setLeads(leads.map(lead => lead.id === updated.id ? updated : lead))
    setSelectedId(null)
    setMessage('Lead güncellendi.')
  }
  function saveCustomer(draft: CustomerDraft, id?: string) {
    // Kimlik varsa aynı kaydı güncelle; yoksa yeni kimlikle listeye ekle.
    setCustomers(current => id
      ? current.map(customer => customer.id === id ? { ...draft, id } : customer)
      : [...current, { ...draft, id: crypto.randomUUID() }])
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
    customers: 'Müşterilerim',
    tasks: 'Görevler ve Takvim',
    sales: 'Satış Fırsatları',
    reports: 'Raporlar',
  }
  return (
    <div className="app-layout">
      <Sidebar page={page} onNavigate={navigate} />
    <div className="app-main">
      <header className="app-topbar">
        <div className="topbar-breadcrumb"><span>Çalışma alanı</span><span aria-hidden="true">/</span><strong>{titles[page]}</strong></div>
        <div className="topbar-identity"><span className="demo-label">Demo</span><span className="profile-avatar" aria-hidden="true">IL</span><span>Interra LeadFlow</span></div>
      </header>
    <main className="dashboard">
      <header className="page-header"><div><p className="eyebrow">INTERRA / LEADFLOW</p><h1>{titles[page]}</h1><p>{page === 'dashboard' ? 'Müşteriler, satışlar ve günlük işlerin için özet çalışma alanın.' : page === 'campaigns' ? 'Tanıtım çalışmalarını, kanallarını ve kampanya takvimini bir arada gör.' : page === 'sales' ? 'Görüşmeden satışa kadar fırsatlarını ve tekliflerini takip et.' : page === 'customers' ? 'Birlikte çalıştığınız firmaları ve müşteri iletişim bilgilerini bir arada tut.' : page === 'reports' ? 'Müşteri adaylarını, satış fırsatlarını ve görevlerini sayılarla değerlendir.' : 'Müşteri adaylarını takip et, sıradaki görüşmeni planla.'}</p></div></header>
      <p className="demo-notice">Öğrenme sürümü · Örnek veriler kullanılıyor. Değişiklikler sayfa yenilendiğinde sıfırlanır.</p>
      <p role="status" className="feedback">{message}</p>
      {page === 'dashboard' && <Dashboard leads={leads} customers={customers} deals={deals} tasks={tasks} campaigns={initialCampaigns}
        onNavigate={navigate}
        onAddLead={() => { setMessage(''); setShowLeadForm(true) }}
        onOpenLead={id => { navigate('leads'); setLeadView('list'); setSearch(''); setStatus(''); setOwner(''); setSelectedId(id) }}
      />}
      {page === 'campaigns' && <CampaignList campaigns={initialCampaigns} />}
      {page === 'reports' && <Reports leads={leads} customers={customers} deals={deals} tasks={tasks} campaigns={initialCampaigns} />}
      {page === 'customers' && <Customers customers={customers} onSave={saveCustomer} />}
      {page === 'sales' && <SalesPipeline deals={deals} leads={leads}
        onSave={(draft, id) => setDeals(current => id
          ? current.map(deal => deal.id === id ? { ...draft, id } : deal)
          : [...current, { ...draft, id: crypto.randomUUID() }])}
        onStageChange={(id, stage) => setDeals(current => current.map(deal => deal.id === id ? { ...deal, stage } : deal))}
        onOpenLead={id => { navigate('leads'); setLeadView('list'); setSearch(''); setStatus(''); setOwner(''); setSelectedId(id) }}
      />}
      {page === 'tasks' && <TasksCalendar tasks={tasks} leads={leads}
        onDelete={id => setTasks(current => current.filter(task => task.id !== id))}
        onUpdate={updated => setTasks(current => current.map(task => task.id === updated.id ? updated : task))}
        onAdd={draft => setTasks(current => [...current, { ...draft, id: crypto.randomUUID(), done: false }])}
        onToggle={id => setTasks(current => current.map(task => task.id === id ? { ...task, done: !task.done } : task))}
        onOpenLead={id => { navigate('leads'); setLeadView('list'); setSearch(''); setStatus(''); setOwner(''); setSelectedId(id) }}
      />}
      {showLeadForm && <FormModal title="Yeni Lead Ekle" onClose={() => setShowLeadForm(false)}>
        <LeadForm onSave={addLead} onCancel={() => setShowLeadForm(false)} />
      </FormModal>}
      {page === 'leads' && (
      <>
        <div className="lead-view-switch" role="group" aria-label="Müşteri adayı görünümü">
          <button type="button" aria-pressed={leadView === 'list'} onClick={() => { setLeadView('list'); setSelectedId(null) }}>Liste</button>
          <button type="button" aria-pressed={leadView === 'map'} onClick={() => { setLeadView('map'); setSelectedId(null) }}>Harita</button>
        </div>
        {leadView === 'map' ? (
          <LeadMap leads={leads} onOpenLead={id => {
            setSearch(''); setStatus(''); setOwner('')
            setSelectedId(id)
            setLeadView('list')
          }} />
        ) : (
      <div className={selectedLead ? 'leads-layout has-detail' : 'leads-layout'}>
      <section className="panel lead-list" aria-labelledby="list-title">
        <div className="section-heading lead-list-heading">
          <div>
            <h2 id="list-title">Tüm lead'ler</h2>
            <small>{visibleLeads.length} kayıt</small>
          </div>
          <button type="button" className="compact-button" aria-haspopup="dialog" onClick={() => { setMessage(''); setShowLeadForm(true) }}>+ Yeni Lead Ekle</button>
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
      </>
      )}
    </main>
    </div>
    </div>
  )
}
export default App
