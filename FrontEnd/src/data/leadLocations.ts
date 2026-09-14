// Tasarım için örnek ilçe merkezleri; firmaların gerçek adresleri değildir.
export type LeadLocation = { leadId: string; district: string; lat: number; lng: number }
export const leadLocations: LeadLocation[] = [
  { leadId: '1', district: 'Kadıköy', lat: 40.991, lng: 29.027 },
  { leadId: '2', district: 'Beşiktaş', lat: 41.043, lng: 29.007 },
  { leadId: '3', district: 'Şişli', lat: 41.061, lng: 28.987 },
]
