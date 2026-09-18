import { statuses, type Lead } from '../data/leads'
import { dealStages, type Deal } from '../data/deals'
import type { Customer } from '../data/customers'
import type { Task } from '../components/TasksCalendar'

export type ChartRow = { label: string; value: number }
// Aynı yazımın boşluk/büyük harf farklarını birleştir; boş alanları gizleme.
export function groupCounts(values: string[], fallback: string): ChartRow[] {
  const groups = new Map<string, ChartRow>()
  for (const raw of values) {
    const label = raw.trim().replace(/\s+/g, ' ') || fallback
    const key = label.normalize('NFKC').toLocaleLowerCase('tr-TR')
    const existing = groups.get(key)
    if (existing) existing.value += 1
    else groups.set(key, { label, value: 1 })
  }
  return [...groups.values()].sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'tr'))
}

export function buildCharts(leads: Lead[], customers: Customer[], deals: Deal[], tasks: Task[], today: string) {
  return {
    statuses: statuses.map(label => ({ label, value: leads.filter(lead => lead.status === label).length })),
    sources: groupCounts(leads.map(lead => lead.source), 'Belirtilmedi'),
    cities: groupCounts(customers.map(customer => customer.city), 'Belirtilmedi'),
    owners: groupCounts(leads.map(lead => lead.owner), 'Atanmadı'),
    stages: dealStages.map(label => {
      const items = deals.filter(deal => deal.stage === label)
      return { label, value: items.length, amount: items.reduce((sum, item) => sum + (item.amount ?? 0), 0), missing: items.filter(item => item.amount === null).length }
    }),
    // Geciken işler, bekleyenlerden ayrı sayılır; toplam görev sayısı korunur.
    tasks: [
      { label: 'Bekleyen', value: tasks.filter(task => !task.done && (!task.date || task.date >= today)).length },
      { label: 'Geciken', value: tasks.filter(task => !task.done && task.date && task.date < today).length },
      { label: 'Tamamlanan', value: tasks.filter(task => task.done).length },
    ],
  }
}
