import { useState } from 'react'
import NavIcon from './NavIcon'

export type Page = 'dashboard' | 'campaigns' | 'leads' | 'tasks' | 'sales' | 'customers' | 'reports'
type Props = { page: Page; onNavigate: (page: Page) => void }

export default function Sidebar({ page, onNavigate }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const items: { page: Page; label: string }[] = [
    { page: 'dashboard', label: 'Genel Bakış' },
    { page: 'leads', label: 'Müşteri Adayları' },
    { page: 'customers', label: 'Müşterilerim' },
    { page: 'tasks', label: 'Görevler ve Takvim' },
    { page: 'campaigns', label: 'Kampanyalar' },
  ]
  function navigate(next: Page) { onNavigate(next); setMobileOpen(false) }
  return <aside className="sidebar">
    <div className="sidebar-brand">
      <img className="brand-icon" src={`${import.meta.env.BASE_URL}leadflow-icon.svg`} alt="" width="40" height="40" />
      <div>INTERRA <span>LeadFlow</span></div>
      <button type="button" className="mobile-menu-toggle secondary" aria-expanded={mobileOpen} aria-controls="main-navigation" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? 'Kapat' : 'Menü'}</button>
    </div>
    <nav id="main-navigation" className={mobileOpen ? 'is-open' : ''} aria-label="Ana menü">
      <p className="sidebar-group-label">Çalışma alanı</p>
      {items.map(item => <button key={item.page} type="button" className={page === item.page ? 'nav-button active' : 'nav-button'} aria-current={page === item.page ? 'page' : undefined} onClick={() => navigate(item.page)}>
        <NavIcon page={item.page} /><span>{item.label}</span>
      </button>)}
      <p className="sidebar-group-label">Satış yönetimi</p>
      <button type="button" className={page === 'sales' ? 'nav-button active' : 'nav-button'} aria-current={page === 'sales' ? 'page' : undefined} onClick={() => navigate('sales')}>
        <NavIcon page="sales" /><span>Satış Fırsatları</span>
      </button>
      <button type="button" className={page === 'reports' ? 'nav-button active' : 'nav-button'} aria-current={page === 'reports' ? 'page' : undefined} onClick={() => navigate('reports')}>
        <NavIcon page="reports" /><span>Raporlar</span>
      </button>
    </nav>
    <div className="sidebar-footer"><span className="workspace-mark" aria-hidden="true">IL</span><div><strong>Interra çalışma alanı</strong><small>Demo sürümü</small></div></div>
  </aside>
}
