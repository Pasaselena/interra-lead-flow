import { useState } from 'react'
import { campaignStatuses, type Campaign } from '../data/campaigns'
import { formatDate } from '../data/leads'

type Props = { campaigns: Campaign[] }

export default function CampaignList({ campaigns }: Props) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  // Arama ve durum filtresi birlikte çalışır; asıl kampanya listesi değişmez.
  const visibleCampaigns = campaigns.filter(campaign =>
    campaign.name.toLocaleLowerCase('tr-TR').includes(search.trim().toLocaleLowerCase('tr-TR')) &&
    (!status || campaign.status === status),
  )

  return (
    <section aria-labelledby="campaign-list-title">
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

      <div className="campaign-grid">
        {visibleCampaigns.map(campaign => (
          <article className="panel campaign-card" key={campaign.id}>
            <div className="campaign-card-heading">
              <span className="campaign-channel">{campaign.channel}</span>
              <span className={`badge campaign-status-${campaign.status === 'Aktif' ? 'active' : campaign.status === 'Taslak' ? 'draft' : 'completed'}`}>
                {campaign.status}
              </span>
            </div>
            <h3>{campaign.name}</h3>
            <p className="campaign-description">{campaign.description}</p>
            <dl className="campaign-info">
              <div><dt>Başlangıç</dt><dd>{formatDate(campaign.startDate)}</dd></div>
              <div><dt>Bitiş</dt><dd>{formatDate(campaign.endDate)}</dd></div>
              <div><dt>Sorumlu</dt><dd>{campaign.owner}</dd></div>
            </dl>
          </article>
        ))}
      </div>
      {visibleCampaigns.length === 0 && (
        <p className="panel empty">Bu aramaya uygun kampanya bulunamadı. Aramanı değiştirebilir veya filtreleri temizleyebilirsin.</p>
      )}
    </section>
  )
}
