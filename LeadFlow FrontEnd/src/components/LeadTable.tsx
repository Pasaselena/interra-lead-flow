import { formatDate, type Lead } from '../data/leads'

type Props = { leads: Lead[]; onSelect: (id: string) => void }
export default function LeadTable({ leads, onSelect }: Props) {
  if (!leads.length) return <p className="empty">Bu filtrelere uygun lead bulunamadı. Filtreleri temizleyebilir veya yeni lead ekleyebilirsin.</p>
  return (
    <div className="table-scroll">
      <table>
        <caption className="sr-only">Müşteri adayları</caption>
        <thead><tr>{['Firma / kişi', 'İletişim', 'Kaynak', 'Durum', 'Sorumlu', 'Sonraki takip', 'İşlemler'].map(title => <th scope="col" key={title}>{title}</th>)}</tr></thead>
        <tbody>{leads.map(lead => (
          <tr key={lead.id}>
            <td><strong>{lead.company}</strong><small>{lead.name}</small></td>
            <td>{lead.email || 'E-posta yok'}<small>{lead.phone || 'Telefon yok'}</small></td>
            <td>{lead.source}</td><td><span className="badge">{lead.status}</span></td><td>{lead.owner}</td><td>{formatDate(lead.followUp)}</td>
            <td className="lead-actions">
              <button
                type="button"
                className="secondary compact-button"
                aria-label={`${lead.company} detaylarını aç`}
                onClick={() => onSelect(lead.id)}
              >
                Detaylar
              </button>
            </td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}
