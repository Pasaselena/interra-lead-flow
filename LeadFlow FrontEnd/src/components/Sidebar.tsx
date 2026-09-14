// Sayfa isimlerini tek bir tipte tutarak yanlış isim kullanımını önleriz.
export type Page = 'dashboard' | 'campaigns' | 'leads' | 'newLead'

type Props = {
  page: Page
  onNavigate: (page: Page) => void
}

export default function Sidebar({ page, onNavigate }: Props) {
  const items: { page: Page; label: string }[] = [
    { page: 'dashboard', label: 'Genel Bakış' },
    { page: 'campaigns', label: 'Kampanyalar' },
    { page: 'leads', label: 'Müşteri Adayları' },
    { page: 'newLead', label: '+ Yeni Lead Ekle' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">INTERRA <span>LeadFlow</span></div>
      <nav aria-label="Ana menü">
        {items.map(item => (
          <button
            key={item.page}
            type="button"
            className={page === item.page ? 'nav-button active' : 'nav-button'}
            aria-current={page === item.page ? 'page' : undefined}
            onClick={() => onNavigate(item.page)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
