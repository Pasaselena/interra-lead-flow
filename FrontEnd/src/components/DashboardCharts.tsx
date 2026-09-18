import { useId, useState, type CSSProperties, type ReactNode } from 'react'
import { t, getLocale, formatPercent } from '../i18n'
import { todayDate, type Lead } from '../data/leads'
import { formatDealAmount, type Deal } from '../data/deals'
import type { Task } from './TasksCalendar'
import type { Page } from './Sidebar'
import { buildCharts, type ChartRow } from '../utils/charts'
import './Charts.css'

type Props = { leads: Lead[]; deals: Deal[]; tasks: Task[]; onNavigate: (page: Page) => void }
const count = (value: number) => value.toLocaleString(getLocale())
const color = (index: number): CSSProperties => ({ '--series-color': `var(--chart-${index % 5})` } as CSSProperties)

function ChartCard({ title, description, tag, children, footer }: { title: string; description: string; tag: string; children: ReactNode; footer: string }) {
  const id = useId()
  return <section className="chart-card" aria-labelledby={id}>
    <header><div><h2 id={id}>{title}</h2><p>{description}</p></div><span className="chart-tag">{tag}</span></header>
    <div className="chart-card-body">{children}</div>
    <footer>{footer}</footer>
  </section>
}
function EmptyChart({ message, onOpen }: { message: string; onOpen: () => void }) {
  return <div className="chart-empty">
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="42" height="42" rx="12"/><path d="M13 33V23m11 10V15m11 18V20"/></svg>
    <p>{message}</p><button type="button" className="text-button" onClick={onOpen}>{t('charts.addData')} ↗</button>
  </div>
}
function Donut({ rows, total, label }: { rows: ChartRow[]; total: number; label: string }) {
  const [active, setActive] = useState<number | null>(null)
  const selected = active === null ? null : rows[active]
  const circumference = 2 * Math.PI * 70
  return <div className="chart-donut-layout">
    <div className="chart-donut">
      <svg viewBox="0 0 180 180" role="img" aria-label={`${label}: ${rows.map(row => `${t(row.label)} ${count(row.value)}`).join(', ')}`} onMouseLeave={() => setActive(null)}>
        <circle className="chart-ring-track" cx="90" cy="90" r="70" fill="none" strokeWidth="18" />
        {rows.map((row, index) => {
          const length = row.value / total * circumference
          const start = rows.slice(0, index).reduce((sum, item) => sum + item.value / total * circumference, 0)
          return row.value > 0 && <circle key={row.label} className={`chart-ring-segment ${active !== null && active !== index ? 'is-muted' : ''}`} style={color(index)} cx="90" cy="90" r="70" fill="none" strokeWidth={active === index ? 22 : 18} strokeDasharray={`${Math.max(0, length - (row.value === total ? 0 : 3))} ${circumference}`} strokeDashoffset={-start} transform="rotate(-90 90 90)" onMouseEnter={() => setActive(index)}><title>{t(row.label)}: {count(row.value)} · {formatPercent(row.value / total * 100)}</title></circle>
        })}
      </svg>
      <div className="chart-donut-center" aria-hidden="true"><strong>{count(selected?.value ?? total)}</strong><span>{selected ? t(selected.label) : label}</span><small>{selected ? formatPercent(selected.value / total * 100) : t('charts.total')}</small></div>
    </div>
    <ul className="chart-legend">{rows.map((row, index) => <li key={row.label}>
      <button type="button" style={color(index)} aria-label={`${t(row.label)}: ${count(row.value)} · ${formatPercent(row.value / total * 100)}`} onMouseEnter={() => setActive(index)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(index)} onBlur={() => setActive(null)} onClick={() => setActive(index)}>
        <span className="chart-dot" /><span>{t(row.label)}</span><strong>{count(row.value)}</strong><small>{formatPercent(row.value / total * 100)}</small>
      </button>
    </li>)}</ul>
  </div>
}
export default function DashboardCharts({ leads, deals, tasks, onNavigate }: Props) {
  const data = buildCharts(leads, [], deals, tasks, todayDate())
  const [metric, setMetric] = useState<'count' | 'amount'>('count')
  const stageMaximum = Math.max(1, ...data.stages.map(row => metric === 'count' ? row.value : row.amount))
  const missing = data.stages.reduce((sum, row) => sum + row.missing, 0)
  const totalAmount = data.stages.reduce((sum, row) => sum + row.amount, 0)
  return <section className="charts-page dashboard-charts" aria-label={t('dashboard.charts')}>
    <div className="charts-grid">
      <ChartCard title={t('charts.statusTitle')} description={t('charts.statusDescription')} tag={t('charts.leads')} footer={t('charts.statusFooter')}>
        {leads.length ? <Donut rows={data.statuses} total={leads.length} label={t('charts.leads')} /> : <EmptyChart message={t('charts.noLeads')} onOpen={() => onNavigate('leads')} />}
      </ChartCard>
      <ChartCard title={t('charts.salesTitle')} description={t('charts.salesDescription')} tag="TRY" footer={t('charts.salesFooter')}>
        {deals.length ? <>
          <div className="chart-sales-toolbar"><strong>{metric === 'count' ? t('charts.dealCount', { 0: count(deals.length) }) : formatDealAmount(totalAmount)}</strong><div className="chart-metric-switch" role="group" aria-label={t('charts.metric')}><button type="button" aria-pressed={metric === 'count'} onClick={() => setMetric('count')}>{t('charts.count')}</button><button type="button" aria-pressed={metric === 'amount'} onClick={() => setMetric('amount')}>{t('charts.amount')}</button></div></div>
          <div className="chart-columns">{data.stages.map((row, index) => {
            const value = metric === 'count' ? row.value : row.amount
            return <button type="button" className="chart-column" key={row.label} style={color(index)} aria-label={`${t(row.label)}: ${t('charts.dealCount', { 0: count(row.value) })}, ${formatDealAmount(row.amount)}, ${t('charts.unknown', { 0: row.missing })}`}>
              <span className="chart-column-plot"><span className="chart-column-bar" style={{ height: `${value / stageMaximum * 100}%` }} /></span><span className="chart-column-value">{metric === 'count' ? count(row.value) : new Intl.NumberFormat(getLocale(), { notation: 'compact', maximumFractionDigits: 1 }).format(row.amount)}</span><span className="chart-column-label">{t(row.label)}</span>
              <span className="chart-tooltip">{t(row.label)} · {count(row.value)}<br />{formatDealAmount(row.amount)}<br />{t('charts.unknown', { 0: row.missing })}</span>
            </button>
          })}</div>
          {missing > 0 && <p className="chart-data-note">{t('charts.missingAmounts', { 0: missing })}</p>}
        </> : <EmptyChart message={t('charts.noDeals')} onOpen={() => onNavigate('sales')} />}
      </ChartCard>
      <ChartCard title={t('charts.tasksTitle')} description={t('charts.tasksDescription')} tag={t('charts.tasks')} footer={t('charts.tasksFooter')}>
        {tasks.length ? <Donut rows={data.tasks} total={tasks.length} label={t('charts.tasks')} /> : <EmptyChart message={t('charts.noTasks')} onOpen={() => onNavigate('tasks')} />}
      </ChartCard>
    </div>
  </section>
}
