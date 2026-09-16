// Kampanya alanları burada; ekrandaki kartların tasarımı CampaignList.tsx içinde.
export const campaignStatuses = ['Taslak', 'Aktif', 'Tamamlandı'] as const
export type Campaign = {
  id: string
  name: string
  description: string
  channel: string
  status: typeof campaignStatuses[number]
  startDate: string
  endDate: string
  plannedBudget: number | null
  actualSpend: number | null
  currency: 'TRY'
  owner: string
}

// İlk tasarımı incelemek için örnek kampanyalar. Henüz lead bağlantısı yok.
export const initialCampaigns: Campaign[] = [
  {
    id: 'campaign-1',
    name: 'Akıllı Ev Tanıtımı',
    description: 'Akıllı ev çözümlerini mimarlık ofisleri ve proje ekipleriyle buluşturuyoruz.',
    channel: 'Fuar',
    status: 'Aktif',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    plannedBudget: null,
    actualSpend: null,
    currency: 'TRY',
    owner: 'Selena',
  },
  {
    id: 'campaign-2',
    name: 'Yeni Nesil Otel Çözümleri',
    description: 'Otel projeleri için oda kontrolü ve konfor çözümlerinin tanıtımı.',
    channel: 'E-posta',
    status: 'Taslak',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    plannedBudget: null,
    actualSpend: null,
    currency: 'TRY',
    owner: 'Atanmadı',
  },
  {
    id: 'campaign-3',
    name: 'Yaz Dönemi İş Ortakları',
    description: 'Mevcut ve potansiyel iş ortaklarıyla ürün tanıtım görüşmeleri.',
    channel: 'Bayi etkinliği',
    status: 'Tamamlandı',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    plannedBudget: null,
    actualSpend: null,
    currency: 'TRY',
    owner: 'Selena',
  },
]
