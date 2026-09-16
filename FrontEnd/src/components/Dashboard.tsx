import type { Customer } from '../data/customers'
import type { Campaign } from '../data/campaigns'
import { formatDate, needsFollowUp, statuses, todayDate, type Lead } from '../data/leads'
import { dealStages, formatDealAmount, type Deal } from '../data/deals'
import { buildReport } from '../utils/reports'
import type { Task } from './TasksCalendar'
import type { Page } from './Sidebar'
import NavIcon from './NavIcon'
import './Dashboard.css'

type Props = {
  leads: Lead[]; customers: Customer[]; deals: Deal[]; tasks: Task[]; campaigns: Campaign[]
  onNavigate: (page: Page) => void; onOpenLead: (id: string) => void; onAddLead: () => void
}

export default function Dashboard({ leads, customers, deals, tasks, campaigns, onNavigate, onOpenLead, onAddLead }: Props) {
  const today = todayDate()
  // Raporlar ile aynı hesaplama kullanılır; iki ekranda farklı toplamlar oluşmaz.
  const report = buildReport(leads, deals, tasks, today)
  const followUps = leads.filter(lead => needsFollowUp(lead) && lead.followUp <= today)
    .sort((a, b) => a.followUp.localeCompare(b.followUp))
  const dueTasks = tasks.filter(task => !task.done && task.date && task.date <= today)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
  const activeCampaigns = campaigns.filter(campaign => campaign.status === 'Aktif')
  const cards: { label: string; value: number; detail: string; page: Page }[] = [
    { label: 'Potansiyel müşteriler', value: leads.length, detail: `${leads.filter(lead => lead.status === 'Yeni').length} aday yeni durumunda`, page: 'leads' },
    { label: 'Mevcut müşteriler', value: customers.length, detail: 'Müşterilerim kayıtları', page: 'customers' },
    { label: 'Açık satış fırsatları', value: report.openCount, detail: `${formatDealAmount(report.openAmount)} belirtilen tutar`, page: 'sales' },
    { label: 'Bekleyen görevler', value: tasks.filter(task => !task.done).length, detail: `${report.today} bugün · ${report.overdue} geciken`, page: 'tasks' },
  ]
  return <section className="overview" aria-label="İş özeti">
    <section className="overview-welcome">
      <div><p className="eyebrow">GÜNLÜK ÇALIŞMA ALANI</p><h2>Bugünün öncelikleri, tek bakışta.</h2><p>Müşteri ilişkilerini, satış fırsatlarını ve takiplerini buradan yönet.</p>
        <div className="actions"><button type="button" aria-haspopup="dialog" onClick={onAddLead}>+ Yeni Lead Ekle</button><button type="button" className="secondary" onClick={() => onNavigate('reports')}>Raporları incele ↗</button></div>
      </div>
      <div className="overview-date"><span>{new Date(`${today}T12:00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}</span><strong>{report.today}</strong><span>bugün planlanan açık görev</span></div>
    </section>
    <div className="overview-kpis">{cards.map(card => <button type="button" className="overview-kpi" key={card.page} onClick={() => onNavigate(card.page)}>
      <span className="overview-kpi-label"><NavIcon page={card.page} />{card.label}<span aria-hidden="true">↗</span></span><strong>{card.value}</strong><small>{card.detail}</small>
    </button>)}</div>
    <div className="overview-grid">
      <section className="panel"><div className="section-heading"><h2>Öncelikli görevler</h2><button type="button" className="text-button" onClick={() => onNavigate('tasks')}>Takvime git ↗</button></div><p className="hint">Bugün ve geciken işler · Önce en eski tarih · {dueTasks.length} görev</p>
        <ul className="overview-list">{dueTasks.slice(0, 4).map(task => <li key={task.id}><div><strong>{task.title}</strong><small>{task.kind} · {formatDate(task.date)}{task.time && ` · ${task.time}`}</small></div><span className={task.date < today ? 'overview-tag overdue' : 'overview-tag'}>{task.date < today ? 'Gecikti' : 'Bugün'}</span></li>)}</ul>
        {!dueTasks.length && <p className="overview-empty">Bugün için bekleyen veya geciken görev yok. Takvimden sonraki işlerini planlayabilirsin.</p>}
        {dueTasks.length > 4 && <small>İlk 4 görev gösteriliyor; tümünü takvimden inceleyebilirsin.</small>}
      </section>
      <section className="panel"><div className="section-heading"><h2>İletişim bekleyen adaylar</h2><span className="badge">{followUps.length}</span></div><p className="hint">Takip tarihi bugün veya geçmişte olan açık adaylar.</p>
        <ul className="overview-list">{followUps.slice(0, 4).map(lead => <li key={lead.id}><button type="button" className="text-button" onClick={() => onOpenLead(lead.id)}><strong>{lead.company} ↗</strong><small>{lead.name} · {lead.owner}</small></button><div className="overview-follow-date"><small>{formatDate(lead.followUp)}</small><span className={lead.followUp < today ? 'overdue' : 'hint'}>{lead.followUp < today ? 'Gecikti' : 'Bugün'}</span></div></li>)}</ul>
        {!followUps.length && <p className="overview-empty">Takip tarihi gelen müşteri adayı yok.</p>}
        {followUps.length > 4 && <button type="button" className="text-button" onClick={() => onNavigate('leads')}>Tüm adayları gör ↗</button>}
      </section>
      <section className="panel"><div className="section-heading"><h2>Satışın görünümü</h2><button type="button" className="text-button" onClick={() => onNavigate('sales')}>Panoya git ↗</button></div>
        <div className="overview-revenue"><span>Açık fırsat tutarı</span><strong>{formatDealAmount(report.openAmount)}</strong><small>{report.openUnknown ? `${report.openUnknown} fırsatta tutar henüz belirtilmedi.` : 'Görüşme, teklif ve müzakere aşamaları.'}</small></div>
        <div className="overview-stage-grid">{dealStages.map(stage => <div key={stage}><span>{stage}</span><strong>{deals.filter(deal => deal.stage === stage).length}</strong></div>)}</div>
        {!deals.length && <p className="hint">Henüz fırsat yok. Satış panosundan ilk fırsatını oluşturabilirsin.</p>}
      </section>
      <section className="panel"><h2>Aday dağılımı</h2><p className="hint">{leads.length} adayın mevcut durumları</p><ul className="overview-distribution">{statuses.map(status => {
        const count = leads.filter(lead => lead.status === status).length
        return <li key={status}><span>{status}</span><div className="overview-track" aria-hidden="true"><span style={{ width: `${leads.length ? count / leads.length * 100 : 0}%` }} /></div><strong>{count}</strong></li>
      })}</ul>{!leads.length && <p className="hint">İlk aday eklendiğinde dağılım burada görünecek.</p>}</section>
    </div>
    <section className="panel overview-campaigns"><div className="section-heading"><div><h2>Aktif kampanyalar</h2><small>{activeCampaigns.length} aktif / {campaigns.length} toplam kampanya</small></div><button type="button" className="text-button" onClick={() => onNavigate('campaigns')}>Kampanyaları aç ↗</button></div>
      <div className="overview-campaign-grid">{activeCampaigns.slice(0, 3).map(campaign => <article key={campaign.id}><span className="badge">{campaign.channel}</span><h3>{campaign.name}</h3><small>{formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}</small><small>Sorumlu: {campaign.owner}</small></article>)}</div>
      {!activeCampaigns.length && <p className="overview-empty">Şu anda aktif durumunda kampanya yok.</p>}
      {activeCampaigns.length > 3 && <p className="hint">İlk 3 aktif kampanya gösteriliyor.</p>}
    </section>
  </section>
}
