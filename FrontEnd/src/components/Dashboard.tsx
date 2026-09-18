import DashboardCharts from './DashboardCharts'
import { getLocale, ownerLabel, t } from '../i18n'
import type { Customer } from '../data/customers'
import type { Campaign } from '../data/campaigns'
import { formatDate, needsFollowUp, todayDate, type Lead } from '../data/leads'
import { formatDealAmount, type Deal } from '../data/deals'
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
    { label: t("Potansiyel müşteriler"), value: leads.length, detail: t("{0} aday yeni durumunda", { 0: leads.filter(lead => lead.status === 'Yeni').length }), page: 'leads' },
    { label: t("Mevcut müşteriler"), value: customers.length, detail: t("Müşterilerim kayıtları"), page: 'customers' },
    { label: t("Açık satış fırsatları"), value: report.openCount, detail: t("{0} belirtilen tutar", { 0: formatDealAmount(report.openAmount) }), page: 'sales' },
    { label: t("Bekleyen görevler"), value: tasks.filter(task => !task.done).length, detail: t("{0} bugün · {1} geciken", { 0: report.today, 1: report.overdue }), page: 'tasks' },
  ]
  return <section className="overview" aria-label={t("İş özeti")}>
    <section className="overview-welcome">
      <div><p className="eyebrow">{t("GÜNLÜK ÇALIŞMA ALANI")}</p><h2>{t("Bugünün öncelikleri, tek bakışta.")}</h2><p>{t("Müşteri ilişkilerini, satış fırsatlarını ve takiplerini buradan yönet.")}</p>
        <div className="actions"><button type="button" aria-haspopup="dialog" onClick={onAddLead}>{t("+ Yeni Lead Ekle")}</button><button type="button" className="secondary" onClick={() => onNavigate('reports')}>{t("Raporları incele ↗")}</button></div>
      </div>
      <div className="overview-date"><span>{new Date(`${today}T12:00:00`).toLocaleDateString(getLocale(), { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}</span><strong>{report.today}</strong><span>{t("bugün planlanan açık görev")}</span></div>
    </section>
    <div className="overview-kpis">{cards.map(card => <button type="button" className="overview-kpi" key={card.page} onClick={() => onNavigate(card.page)}>
      <span className="overview-kpi-label"><NavIcon page={card.page} />{card.label}<span aria-hidden="true">↗</span></span><strong>{card.value}</strong><small>{card.detail}</small>
    </button>)}</div>
    <DashboardCharts leads={leads} deals={deals} tasks={tasks} onNavigate={onNavigate} />
    <div className="overview-grid">
      <section className="panel"><div className="section-heading"><h2>{t("Öncelikli görevler")}</h2><button type="button" className="text-button" onClick={() => onNavigate('tasks')}>{t("Takvime git ↗")}</button></div><p className="hint">{t("Bugün ve geciken işler · Önce en eski tarih · ")}{dueTasks.length} {t("görev")} </p>
        <ul className="overview-list">{dueTasks.slice(0, 4).map(task => <li key={task.id}><div><strong>{task.title}</strong><small>{t(task.kind)} · {formatDate(task.date)}{task.time && ` · ${task.time}`}</small></div><span className={task.date < today ? 'overview-tag overdue' : 'overview-tag'}>{task.date < today ? t("Gecikti") : t("Bugün")}</span></li>)}</ul>
        {!dueTasks.length && <p className="overview-empty">{t("Bugün için bekleyen veya geciken görev yok. Takvimden sonraki işlerini planlayabilirsin.")}</p>}
        {dueTasks.length > 4 && <small>{t("İlk 4 görev gösteriliyor; tümünü takvimden inceleyebilirsin.")}</small>}
      </section>
      <section className="panel"><div className="section-heading"><h2>{t("İletişim bekleyen adaylar")}</h2><span className="badge">{followUps.length}</span></div><p className="hint">{t("Takip tarihi bugün veya geçmişte olan açık adaylar.")}</p>
        <ul className="overview-list">{followUps.slice(0, 4).map(lead => <li key={lead.id}><button type="button" className="text-button" onClick={() => onOpenLead(lead.id)}><strong>{lead.company} ↗</strong><small>{lead.name} · {ownerLabel(lead.owner)}</small></button><div className="overview-follow-date"><small>{formatDate(lead.followUp)}</small><span className={lead.followUp < today ? 'overdue' : 'hint'}>{lead.followUp < today ? t("Gecikti") : t("Bugün")}</span></div></li>)}</ul>
        {!followUps.length && <p className="overview-empty">{t("Takip tarihi gelen müşteri adayı yok.")}</p>}
        {followUps.length > 4 && <button type="button" className="text-button" onClick={() => onNavigate('leads')}>{t("Tüm adayları gör ↗")}</button>}
      </section>
    </div>
    <section className="panel overview-campaigns"><div className="section-heading"><div><h2>{t("Aktif kampanyalar")}</h2><small>{activeCampaigns.length} {t("aktif / ")} {campaigns.length} {t("toplam kampanya")} </small></div><button type="button" className="text-button" onClick={() => onNavigate('campaigns')}>{t("Kampanyaları aç ↗")}</button></div>
      <div className="overview-campaign-grid">{activeCampaigns.slice(0, 3).map(campaign => <article key={campaign.id}><span className="badge">{t(campaign.channel)}</span><h3>{campaign.name}</h3><small>{formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}</small><small>{t("Sorumlu: ")}{ownerLabel(campaign.owner)}</small></article>)}</div>
      {!activeCampaigns.length && <p className="overview-empty">{t("Şu anda aktif durumunda kampanya yok.")}</p>}
      {activeCampaigns.length > 3 && <p className="hint">{t("İlk 3 aktif kampanya gösteriliyor.")}</p>}
    </section>
  </section>
}
