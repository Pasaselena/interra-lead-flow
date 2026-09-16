// Müşteri kaydının veri yapısı. Gerçek müşteri bilgileri formdan eklenecek.
export type Customer = {
  id: string
  company: string
  contact: string
  email: string
  phone: string
  city: string
  owner: string
  notes: string
}

// Yeni kaydın kimliği henüz oluşmadığından formda id alanı bulunmaz.
export type CustomerDraft = Omit<Customer, 'id'>
