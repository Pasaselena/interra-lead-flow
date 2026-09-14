// Lead'in hangi alanlardan oluştuğunu TypeScript'e anlatıyoruz.
export const statuses = ['Yeni', 'İletişimde', 'Teklif', 'Kazanıldı', 'Kaybedildi'] as const
export type LeadStatus = typeof statuses[number]
export type Lead = {
  id: string
  company: string
  name: string
  email: string
  phone: string
  source: string
  status: LeadStatus
  owner: string
  followUp: string
  notes: string
}
export type LeadDraft = Omit<Lead, 'id'>

// Yerel tarihi kullanırız; UTC dönüşümü günü değiştirebilir.
export function todayDate() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function needsFollowUp(lead: Lead) {
  return lead.status !== 'Kazanıldı' && lead.status !== 'Kaybedildi' && Boolean(lead.followUp)
}
export function formatDate(value: string) {
  return value ? new Date(`${value}T12:00:00`).toLocaleDateString('tr-TR') : 'Planlanmadı'
}
export const initialLeads: Lead[] = [
  { id: '1', company: 'Atlas Mimarlık', name: 'Deniz Yılmaz', email: 'deniz@example.com', phone: '', source: 'Web sitesi', status: 'Yeni', owner: 'Selena', followUp: todayDate(), notes: 'Örnek kayıt: Akıllı ev çözümleriyle ilgileniyor.' },
  { id: '2', company: 'Nova Yapı', name: 'Ece Demir', email: 'ece@example.com', phone: '', source: 'Fuar', status: 'Teklif', owner: 'Selena', followUp: '2026-09-10', notes: 'Örnek kayıt: Teklif sonrası görüşme yapılacak.' },
  { id: '3', company: 'Mavi Otel', name: 'Can Kaya', email: 'can@example.com', phone: '', source: 'Referans', status: 'Kazanıldı', owner: 'Atanmadı', followUp: '', notes: 'Örnek kayıt.' },
]
