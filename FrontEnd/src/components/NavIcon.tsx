import type { Page } from './Sidebar'

// Menü simgeleri vektördür; renklerini CSS'teki currentColor'dan alırlar.
export default function NavIcon({ page }: { page: Page }) {
  const paths: Record<Page, string> = {
    reports: 'M3 3v18h18 M7 17v-5 M12 17V7 M17 17V4',
    customers: 'M3 21h18 M5 21V5h10v16 M15 11h4v10 M8 8h1 M11 8h1 M8 12h1 M11 12h1 M9 21v-5h3v5',
    dashboard: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    leads: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M16 3a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    tasks: 'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2 M8 16l3 3 5-6',
    campaigns: 'M3 10v4h4l12 5V5L7 10H3 M7 14l2 7h4l-2-5 M22 9v6',
    sales: 'M3 3v18h18 M7 16l5-5 4 3 5-8 M16 6h5v5',
  }
  return <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[page]} /></svg>
}
