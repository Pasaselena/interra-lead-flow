import { ownerLabel, t, useLanguage } from '../i18n'
import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { leadLocations } from '../data/leadLocations'
import type { Lead } from '../data/leads'
import './LeadMap.css'

type Props = { leads: Lead[]; onOpenLead: (id: string) => void }

// Leaflet bir HTML elemanı alır. textContent, kayıtları HTML olarak çalıştırmadan gösterir.
function createHoverCard(lead: Lead & { district: string }) {
  const card = document.createElement('div')
  card.className = 'map-hover-card'
  const title = document.createElement('strong')
  title.className = 'map-hover-title'
  title.textContent = lead.company
  const location = document.createElement('span')
  location.className = 'map-hover-location'
  location.textContent = `${lead.district} · İstanbul · ${t("Örnek konum")}`
  const status = document.createElement('span')
  status.className = 'map-hover-status'
  status.textContent = t(lead.status)
  card.append(title, location, status)
  const details = document.createElement('dl')
  for (const [label, value] of [
    ['İlgili kişi', lead.name], ['Sorumlu', lead.owner],
    ['Telefon', lead.phone], ['E-posta', lead.email],
  ]) {
    const row = document.createElement('div')
    const term = document.createElement('dt')
    term.textContent = t(label)
    const description = document.createElement('dd')
    description.textContent = ownerLabel(value) || t('Belirtilmedi')
    row.append(term, description)
    details.append(row)
  }
  card.append(details)
  return card
}

export default function LeadMap({ leads, onOpenLead }: Props) {
  const language = useLanguage()
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
      const marker = L.circleMarker([lead.lat, lead.lng], {
        radius: lead.id === selectedId ? 12 : 8,
        color: '#00717a', fillColor: '#00adbb', fillOpacity: 0.85, weight: 3,
      }).bindTooltip(createHoverCard(lead), {
        className: 'lead-hover-tooltip', direction: 'auto',
        offset: L.point(12, 0), opacity: 1, interactive: true,
      }).on('click', () => setSelectedId(lead.id)).addTo(group)
      // Dokunmatik ekranda veya soldaki listeden seçimde de kartı göster.
      if (lead.id === selectedId) marker.openTooltip()
    })
    if (selected) map.setView([selected.lat, selected.lng], 14, { animate: false })
    else if (visible.length) map.fitBounds(L.latLngBounds(visible.map(lead => [lead.lat, lead.lng])), { padding: [40, 40], maxZoom: 13, animate: false })
    const dismissTooltip = (event: KeyboardEvent) => {
      if (event.key === 'Escape') group.eachLayer(layer => layer.closeTooltip())
    }
    document.addEventListener('keydown', dismissTooltip)
    return () => { document.removeEventListener('keydown', dismissTooltip); group.remove() }
  }, [visible, selected, selectedId, language])

  return (
    <section className="map-section" aria-label={t("Müşteri adayları haritası")}>
      <div className="map-intro">
        <div><p className="eyebrow">{t("BÖLGESEL GÖRÜNÜM")}</p><h2>{t("Adaylarına konum üzerinden ulaş")}</h2><p>{t("İstanbul · Örnek ilçe konumları, gerçek firma adresleri değildir.")}</p></div>
        <span className="badge">{located.length} {t("konumlu aday")} </span>
      </div>
      <div className="map-workspace">
        <aside className="map-list panel" aria-label={t("Haritadaki adaylar")}>
          <label>{t("Firma ara")}<input type="search" value={search} placeholder={t("Firma adı…")} onChange={e => { setSearch(e.target.value); setSelectedId(null) }} /></label>
          <label>{t("Bölge")}<select value={district} onChange={e => { setDistrict(e.target.value); setSelectedId(null) }}><option value="">{t("Tüm bölgeler")}</option>{[...new Set(located.map(lead => lead.district))].map(value => <option key={value} value={value}>{value}</option>)}</select></label>
          <p className="hint" role="status">{visible.length} {t("aday gösteriliyor · ")} {leads.length - located.length} {t("adayın konumu yok")} </p>
          <div className="map-results">
            {visible.map(lead => (
              <button className={`map-result ${selectedId === lead.id ? 'selected' : ''}`} key={lead.id} onClick={() => setSelectedId(lead.id)} aria-pressed={selectedId === lead.id}>
                <strong>{lead.company}</strong><span>{lead.district} {t("· İstanbul")} </span><small>{t(lead.status)} · {ownerLabel(lead.owner)}</small>
              </button>
            ))}
            {!visible.length && <p className="empty">{t("Bu aramaya uygun konum bulunamadı.")}</p>}
          </div>
        </aside>
        <div className="map-canvas-panel">
          <div ref={container} className="lead-map-canvas" aria-label={t("İstanbul aday konumları; aynı adaylar soldaki listeden de seçilebilir")} />
          {tileError && <p role="status" className="map-error">{t("Harita görüntüleri yüklenemedi. İnternet bağlantını kontrol edip sayfayı yenileyebilirsin; aday listesi kullanılabilir.")}</p>}
          <div className="map-selection">
            {selected ? <><div><strong>{selected.company}</strong><small>{selected.district} {t("· Örnek konum")} </small></div><button type="button" className="detail-arrow" aria-label={t("Aday detayları")} title={t("Aday detayları")} onClick={() => onOpenLead(selected.id)}><span aria-hidden="true">↘</span></button></> : <p>{t("Bilgi kartı için işaretin üzerine gel. Dokunarak veya soldaki listeden de seçim yapabilirsin.")}</p>}
          </div>
        </div>
      </div>
    </section>
  )
}
