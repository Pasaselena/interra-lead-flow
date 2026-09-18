import { t } from '../i18n'
import FormModal from './FormModal'
import NavIcon from './NavIcon'
import CampaignEmailComposer from './CampaignEmailComposer'
import type { Customer } from '../data/customers'
import type { CampaignEmail, CampaignEmailDraft } from '../data/campaignEmails'
import { useState } from 'react'
import CampaignDetail from './CampaignDetail'
import { campaignStatuses, type Campaign } from '../data/campaigns'

type Props = { campaigns: Campaign[]; customers: Customer[]; emails: CampaignEmail[]; onSendDemo: (draft: CampaignEmailDraft) => void }

export default function CampaignList({ campaigns, customers, emails, onSendDemo }: Props) {
  const [composing, setComposing] = useState(false)
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
          <h2 id="campaign-list-title">{t("Tüm kampanyalar")}</h2>
          <span aria-live="polite">{visibleCampaigns.length} / {campaigns.length} {t("kampanya")} </span>
        </div>
        <div className="filters campaign-filters">
          <label className="search">{t("Kampanya ara ")}<input
              type="search"
              placeholder={t("Kampanya adı…")}
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </label>
          <label>{t("Durum ")}<select value={status} onChange={event => setStatus(event.target.value)}>
              <option value="">{t("Tüm durumlar")}</option>
              {campaignStatuses.map(value => <option key={value} value={value}>{t(value)}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="campaign-layout">
      <div className="campaign-grid">
        {visibleCampaigns.map(campaign => (
          <article className="panel campaign-card" key={campaign.id}>
            <div className="campaign-card-heading">
              <span className="campaign-card-icon"><NavIcon page="campaigns" /></span>
              <span className={`badge campaign-status-${campaign.status === 'Aktif' ? 'active' : campaign.status === 'Taslak' ? 'draft' : 'completed'}`}>
                {t(campaign.status)}
              </span>
            </div>
            <h3>{campaign.name}</h3>
            <p className="campaign-description">{campaign.description}</p>
            <div className="campaign-card-footer">
            <span className="campaign-channel">{t(campaign.channel)}</span>
            <button
              type="button"
              className="campaign-detail-button detail-arrow"
              aria-haspopup="dialog"
              aria-label={t("{0}: detayları gör", { 0: campaign.name })}
              title={t("{0}: detayları gör", { 0: campaign.name })}
              onClick={() => { setExpandedId(campaign.id); setComposing(false) }}
            ><span aria-hidden="true">↘</span>
            </button>
            </div>
          </article>
        ))}
      </div>
      {selectedCampaign && (composing ? (
        <FormModal title={t("Kampanya E-postası Hazırla")} onClose={() => setComposing(false)}>
          <p className="hint">{selectedCampaign.name}</p>
          <CampaignEmailComposer campaign={selectedCampaign} customers={customers}
            onCancel={() => setComposing(false)} onSave={draft => {
              onSendDemo(draft)
              setComposing(false)
            }} />
        </FormModal>
      ) : (
        <CampaignDetail key={selectedCampaign.id} emails={emails.filter(email => email.campaignId === selectedCampaign.id)}
          onCompose={() => { setComposing(true) }}
          campaign={selectedCampaign} onClose={() => setExpandedId(null)} />
      ))}
      </div>
      {visibleCampaigns.length === 0 && (
        <p className="panel empty">{t("Bu aramaya uygun kampanya bulunamadı. Aramanı değiştirebilir veya filtreleri temizleyebilirsin.")}</p>
      )}
    </section>
  )
}
