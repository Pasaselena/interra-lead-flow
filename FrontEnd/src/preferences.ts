export type Theme = 'dark' | 'light'
export type Profile = { name: string; email: string; phone: string; title: string; company: string; department: string; city: string; country: string; bio: string }
export const defaultProfile: Profile = { name: 'Kullanıcı', email: 'demo@example.com', phone: '', title: '', company: 'Interra', department: '', city: '', country: '', bio: '' }

export function readTheme(): Theme {
  try { return localStorage.getItem('leadflow-theme') === 'light' ? 'light' : 'dark' } catch { return 'dark' }
}
export function readProfile(): Profile {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('leadflow-profile') || 'null')
    if (value && typeof value === 'object' && 'name' in value && 'email' in value && 'title' in value &&
      typeof value.name === 'string' && typeof value.email === 'string' && typeof value.title === 'string') {
      // Yeni alanlar eski kayıtlarda bulunmayabilir; mevcut bilgileri koru.
      const extra = (key: string) => key in value && typeof (value as Record<string, unknown>)[key] === 'string' ? (value as Record<string, string>)[key] : ''
      return { name: value.name === 'Demo Kullanıcı' ? 'Kullanıcı' : value.name, email: value.email, phone: 'phone' in value && typeof value.phone === 'string' ? value.phone : '', title: value.title, company: extra('company'), department: extra('department'), city: extra('city'), country: extra('country'), bio: extra('bio') }
    }
  } catch { /* Bozuk veya erişilemeyen kayıt yerine demo profili kullan. */ }
  return { ...defaultProfile }
}
export function persistPreference(key: 'profile' | 'theme', value: Profile | Theme): boolean {
  try {
    localStorage.setItem(`leadflow-${key}`, typeof value === 'string' ? value : JSON.stringify(value))
    return true
  } catch { return false }
}
