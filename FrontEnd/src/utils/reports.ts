import type { Lead } from '../data/leads'
import type { Deal } from '../data/deals'
import type { Task } from '../components/TasksCalendar'

// Saf fonksiyon: verilen listeleri değiştirmeden rapor sayılarını üretir.
export function buildReport(leads: Lead[], deals: Deal[], tasks: Task[], today: string) {
  const sources = new Map<string, number>()
  for (const lead of leads) {
    const source = lead.source.trim() || 'Belirtilmedi'
    sources.set(source, (sources.get(source) ?? 0) + 1)
  }
  const won = deals.filter(deal => deal.stage === 'Kazanıldı')
  const lost = deals.filter(deal => deal.stage === 'Kaybedildi')
  const open = deals.filter(deal => deal.stage !== 'Kazanıldı' && deal.stage !== 'Kaybedildi')
  const pending = tasks.filter(task => !task.done)
  return {
    sources: [...sources].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'tr')),
    openCount: open.length,
    openAmount: open.reduce((total, deal) => total + (deal.amount ?? 0), 0),
    openUnknown: open.filter(deal => deal.amount === null).length,
    wonAmount: won.reduce((total, deal) => total + (deal.amount ?? 0), 0),
    wonUnknown: won.filter(deal => deal.amount === null).length,
    // Yalnızca sonuçlanan fırsatlar üzerinden oran hesaplanır.
    winRate: won.length + lost.length ? won.length / (won.length + lost.length) * 100 : null,
    closedCount: won.length + lost.length,
    overdue: pending.filter(task => task.date && task.date < today).length,
    today: pending.filter(task => task.date === today).length,
    upcoming: pending.filter(task => task.date > today).length,
    unscheduled: pending.filter(task => !task.date).length,
    completed: tasks.filter(task => task.done).length,
  }
}
