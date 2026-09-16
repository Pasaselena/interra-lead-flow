import { statuses, todayDate, type Lead } from '../data/leads'
import { dealStages, dealTotals, formatDealAmount, type Deal } from '../data/deals'
import type { Customer } from '../data/customers'
import type { Campaign } from '../data/campaigns'
import type { Task } from './TasksCalendar'
import { buildReport } from '../utils/reports'
import './Reports.css'

type Props = { leads: Lead[]; customers: Customer[]; deals: Deal[]; tasks: Task[]; campaigns: Campaign[] }

function Distribution({ rows, total }: { rows: { label: string; count: number }[]; total: number }) {
  return <ul className="report-bars">{rows.map(row => {
    const percentage = total ? Math.round(row.count / total * 100) : 0
    return <li key={row.label}>
      <div className="report-bar-label"><span>{row.label}</span><strong>{row.count} <small>(%{percentage})</small></strong></div>
      <div className="report-track" aria-hidden="true"><span style={{ width: `${percentage}%` }} /></div>
    </li>
  })}</ul>
}

export default function Reports({ leads, customers, deals, tasks, campaigns }: Props) {
  // Props değiştiğinde React tekrar çalıştırır; güncel verilerden yeniden hesaplarız.
  const report = buildReport(leads, deals, tasks, todayDate())
  const taskRows = [
    { label: 'Geciken', count: report.overdue }, { label: 'Bugün', count: report.today },
    { label: 'Gelecek', count: report.upcoming }, { label: 'Tamamlanan', count: report.completed },
    ...(report.unscheduled ? [{ label: 'Tarihsiz', count: report.unscheduled }] : []),
  ]
  return <section aria-label="İş raporları">
    <div className="section-heading report-heading"><div><h2>İşinin güncel görünümü</h2><p className="hint">Tüm mevcut kayıtların anlık özeti · Geçmiş dönem karşılaştırması içermez.</p></div><span className="badge">Güncel kayıtlar</span></div>
    <div className="stats">
      <section className="stat"><span>Potansiyel müşteri</span><strong>{leads.length}</strong><small>Müşteri adayları listesindeki kayıtlar</small></section>
      <section className="stat"><span>Mevcut müşteri</span><strong>{customers.length}</strong><small>Müşterilerim bölümündeki kayıtlar</small></section>
      <section className="stat"><span>Açık satış fırsatı</span><strong>{report.openCount}</strong><small>Görüşme, teklif ve müzakere</small></section>
      <section className="stat"><span>Aktif kampanya</span><strong>{campaigns.filter(campaign => campaign.status === 'Aktif').length}</strong><small>{campaigns.length} kampanya içinde</small></section>
    </div>
    <div className="report-grid">
      <section className="panel"><h3>Adayların durum dağılımı</h3><p className="hint">Her durumdaki aday sayısı ve toplam içindeki payı.</p>
        {leads.length ? <Distribution total={leads.length} rows={statuses.map(label => ({ label, count: leads.filter(lead => lead.status === label).length }))} /> : <p className="empty">Henüz müşteri adayı yok.</p>}
      </section>
      <section className="panel"><h3>Adaylar nereden geliyor?</h3><p className="hint">Aday kaydında belirtilen kaynağa göre dağılım.</p>
        {leads.length ? <Distribution rows={report.sources} total={leads.length} /> : <p className="empty">Kaynak dağılımı için müşteri adayı ekle.</p>}
      </section>
      <section className="panel"><h3>Satış özeti</h3>
        <dl className="report-metrics">
          <div><dt>Açık fırsat tutarı</dt><dd>{formatDealAmount(report.openAmount)}{report.openUnknown > 0 && <small>{report.openUnknown} fırsatın tutarı belirtilmedi.</small>}</dd></div>
          <div><dt>Kazanılan fırsat tutarı</dt><dd>{formatDealAmount(report.wonAmount)}{report.wonUnknown > 0 && <small>{report.wonUnknown} kazanılan fırsatın tutarı belirtilmedi.</small>}</dd></div>
          <div><dt>Satış kazanma oranı</dt><dd>{report.winRate === null ? 'Henüz hesaplanamıyor' : `%${report.winRate.toLocaleString('tr-TR', { maximumFractionDigits: 1 })}`}<small>{report.closedCount} sonuçlanan fırsat</small></dd></div>
        </dl>
        <p className="hint">Oran = kazanılan / (kazanılan + kaybedilen). Tutarlar TRY cinsindedir; tahsilat veya gelir raporu değildir.</p>
      </section>
      <section className="panel"><h3>Görev takibi</h3><p className="hint">{tasks.length} görev · Gecikme, tamamlanmamış görevlerin tarihine göre hesaplanır.</p>
        {tasks.length ? <Distribution rows={taskRows} total={tasks.length} /> : <p className="empty">Görev oluşturduğunda takip özeti burada görünecek.</p>}
      </section>
    </div>
    <section className="panel"><h3>Satış aşamalarına göre fırsatlar</h3>
      {deals.length ? <div className="table-scroll"><table><caption className="sr-only">Aşama bazında fırsat sayısı ve tutarı</caption><thead><tr><th scope="col">Aşama</th><th scope="col">Fırsat sayısı</th><th scope="col">Belirtilen tutar toplamı</th><th scope="col">Tutarı eksik</th></tr></thead><tbody>{dealStages.map(stage => {
        const totals = dealTotals(deals.filter(deal => deal.stage === stage))
        return <tr key={stage}><th scope="row">{stage}</th><td>{totals.count}</td><td>{formatDealAmount(totals.amount)}</td><td>{totals.unspecified}</td></tr>
      })}</tbody></table></div> : <p className="empty">Satış fırsatı eklediğinde aşama bazındaki sayılar ve tutarlar burada görünecek.</p>}
    </section>
    <p className="hint">Müşteriler ve adaylar ayrı listelerdir; müşteri sayısından dönüşüm oranı çıkarılmaz. Kampanyaların adaylarla bağlantısı henüz kurulmadığı için kampanya getirisi hesaplanmaz.</p>
  </section>
}
