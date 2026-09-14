import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { leadLocations } from '../data/leadLocations'
import type { Lead } from '../data/leads'

type Props = { leads: Lead[]; onOpenLead: (id: string) => void }

export default function LeadMap({ leads, onOpenLead }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const [district, setDistrict] = useState('')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tileError, setTileError] = useState(false)
  const located = useMemo(() => leads.flatMap(lead => {
    const location = leadLocations.find(item => item.leadId === lead.id)
    return location ? [{ ...lead, ...location }] : []
  }), [leads])
  const visible = useMemo(() => located.filter(lead => (!district || lead.district === district) &&
    lead.company.toLocaleLowerCase('tr-TR').includes(search.trim().toLocaleLowerCase('tr-TR'))), [located, district, search])
  const selected = visible.find(lead => lead.id === selectedId)

  // Harita yalnızca bölüm açıldığında kurulur, kapanınca temizlenir.
  useEffect(() => {
    if (!container.current) return
    const map = L.map(container.current, { scrollWheelZoom: false }).setView([41.025, 29.015], 12)
    mapRef.current = map
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).on('tileerror', () => setTileError(true)).addTo(map)
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(container.current)
    return () => { observer.disconnect(); map.remove(); mapRef.current = null }
  }, [])

  // Filtreler değişince işaretleri güncelle; firma adını HTML olarak yorumlama.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const group = L.layerGroup().addTo(map)
    visible.forEach(lead => {
      const label = document.createElement('span')
      label.textContent = `${lead.company} · ${lead.district}`
      L.circleMarker([lead.lat, lead.lng], {
        radius: lead.id === selectedId ? 12 : 8,
        color: '#00717a', fillColor: '#00adbb', fillOpacity: 0.85, weight: 3,
      }).bindTooltip(label).on('click', () => setSelectedId(lead.id)).addTo(group)
    })
    if (selected) map.setView([selected.lat, selected.lng], 14, { animate: false })
    else if (visible.length) map.fitBounds(L.latLngBounds(visible.map(lead => [lead.lat, lead.lng])), { padding: [40, 40], maxZoom: 13, animate: false })
    return () => { group.remove() }
  }, [visible, selected, selectedId])

  return (
    <section className="map-section" aria-label="Müşteri adayları haritası">
      <div className="map-intro">
        <div><p className="eyebrow">BÖLGESEL GÖRÜNÜM</p><h2>Adaylarına konum üzerinden ulaş</h2><p>İstanbul · Örnek ilçe konumları, gerçek firma adresleri değildir.</p></div>
        <span className="badge">{located.length} konumlu aday</span>
      </div>
      <div className="map-workspace">
        <aside className="map-list panel" aria-label="Haritadaki adaylar">
          <label>Firma ara<input type="search" value={search} placeholder="Firma adı…" onChange={e => { setSearch(e.target.value); setSelectedId(null) }} /></label>
          <label>Bölge<select value={district} onChange={e => { setDistrict(e.target.value); setSelectedId(null) }}><option value="">Tüm bölgeler</option>{[...new Set(located.map(lead => lead.district))].map(value => <option key={value}>{value}</option>)}</select></label>
          <p className="hint" role="status">{visible.length} aday gösteriliyor · {leads.length - located.length} adayın konumu yok</p>
          <div className="map-results">
            {visible.map(lead => (
              <button className={`map-result ${selectedId === lead.id ? 'selected' : ''}`} key={lead.id} onClick={() => setSelectedId(lead.id)} aria-pressed={selectedId === lead.id}>
                <strong>{lead.company}</strong><span>{lead.district} · İstanbul</span><small>{lead.status} · {lead.owner}</small>
              </button>
            ))}
            {!visible.length && <p className="empty">Bu aramaya uygun konum bulunamadı.</p>}
          </div>
          <button className="secondary" onClick={() => { setSearch(''); setDistrict(''); setSelectedId(null) }}>Filtreleri temizle</button>
        </aside>
        <div className="map-canvas-panel">
          <div ref={container} className="lead-map-canvas" aria-label="İstanbul aday konumları; aynı adaylar soldaki listeden de seçilebilir" />
          {tileError && <p role="status" className="map-error">Harita görüntüleri yüklenemedi. İnternet bağlantını kontrol edip sayfayı yenileyebilirsin; aday listesi kullanılabilir.</p>}
          <div className="map-selection">
            {selected ? <><div><strong>{selected.company}</strong><small>{selected.district} · Örnek konum</small></div><button onClick={() => onOpenLead(selected.id)}>Aday detayları</button></> : <p>Bir konuma veya listedeki firmaya dokunarak adayı seç.</p>}
          </div>
        </div>
      </div>
    </section>
  )
}
