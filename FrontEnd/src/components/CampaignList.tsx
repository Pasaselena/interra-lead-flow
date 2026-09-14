import { useState } from 'react'
import CampaignDetail from './CampaignDetail'
import { campaignStatuses, type Campaign } from '../data/campaigns'

type Props = { campaigns: Campaign[] }

export default function CampaignList({ campaigns }: Props) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  // Aynı anda tek kampanyanın ayrıntılarını gösteriyoruz.
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Arama ve durum filtresi birlikte çalışır; asıl kampanya listesi değişmez.
  const visibleCampaigns = campaigns.filter(campaign =>
    campaign.name.toLocaleLowerCase('tr-TR').includes(search.trim().toLocaleLowerCase('tr-TR')) &&
    (!status || campaign.status === status),
  )

  const selectedCampaign = visibleCampaigns.find(campaign => campaign.id === expandedId)

  return (
    <section className="campaigns-section" aria-labelledby="campaign-list-title">
      <div className="panel">
        <div className="section-heading">
          <h2 id="campaign-list-title">Tüm kampanyalar</h2>
          <span aria-live="polite">{visibleCampaigns.length} / {campaigns.length} kampanya</span>
        </div>
        <div className="filters campaign-filters">
          <label className="search">
            Kampanya ara
            <input
              type="search"
              placeholder="Kampanya adı…"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </label>
          <label>
            Durum
            <select value={status} onChange={event => setStatus(event.target.value)}>
              <option value="">Tüm durumlar</option>
              {campaignStatuses.map(value => <option key={value}>{value}</option>)}
            </select>
          </label>
          <button className="secondary" onClick={() => { setSearch(''); setStatus('') }}>
            Temizle
          </button>
        </div>
      </div>

      <div className="campaign-layout">
      <div className="campaign-grid">
        {visibleCampaigns.map(campaign => (
          <article className="panel campaign-card" key={campaign.id}>
            <div className="campaign-card-heading">
              <span className={`badge campaign-status-${campaign.status === 'Aktif' ? 'active' : campaign.status === 'Taslak' ? 'draft' : 'completed'}`}>
                {campaign.status}
              </span>
            </div>
            <h3>{campaign.name}</h3>
            <p className="campaign-description">{campaign.description}</p>
            <button
              type="button"
              className="campaign-detail-button"
              aria-haspopup="dialog"
              aria-label={`${campaign.name}: detayları gör`}
              onClick={() => setExpandedId(campaign.id)}
            >
              Detayları Gör
              <span aria-hidden="true">↗</span>
            </button>
          </article>
        ))}
      </div>
      {selectedCampaign && (
        <CampaignDetail campaign={selectedCampaign} onClose={() => setExpandedId(null)} />
      )}
      </div>
      {visibleCampaigns.length === 0 && (
        <p className="panel empty">Bu aramaya uygun kampanya bulunamadı. Aramanı değiştirebilir veya filtreleri temizleyebilirsin.</p>
      )}
    </section>
  )
}
