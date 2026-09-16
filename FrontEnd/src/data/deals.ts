export const dealStages = ['Görüşme', 'Teklif', 'Müzakere', 'Kazanıldı', 'Kaybedildi'] as const
export type DealStage = typeof dealStages[number]
export type Deal = {
  id: string
  title: string
  leadId: string
  amount: number | null
  closeDate: string
  stage: DealStage
  notes: string
}
export type DealDraft = Omit<Deal, 'id'>

export function isOpenDeal(deal: Deal) {
  return deal.stage !== 'Kazanıldı' && deal.stage !== 'Kaybedildi'
}

// Belirtilmeyen tutar null olarak tutulur; sıfır tutarlı bir satıştan farklıdır.
export function dealTotals(deals: Deal[]) {
  return {
    count: deals.length,
    amount: deals.reduce((total, deal) => total + (deal.amount ?? 0), 0),
    unspecified: deals.filter(deal => deal.amount === null).length,
  }
}

export function formatDealAmount(amount: number | null) {
  return amount === null ? 'Tutar belirtilmedi' : new Intl.NumberFormat('tr-TR', {
    style: 'currency', currency: 'TRY', maximumFractionDigits: 2,
  }).format(amount)
}
