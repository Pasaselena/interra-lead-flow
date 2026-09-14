import { formatDate, type Lead } from '../data/leads'

type Props = { leads: Lead[]; onSelect: (id: string) => void }
export default function LeadTable({ leads, onSelect }: Props) {
  if (!leads.length) return <p className="empty">Bu filtrelere uygun lead bulunamadı. Filtreleri temizleyebilir veya yeni lead ekleyebilirsin.</p>
  return (
    <div className="table-scroll">
      <table>
        <caption className="sr-only">Müşteri adayları</caption>
        <thead><tr>{['Firma / kişi', 'İletişim', 'Kaynak', 'Durum', 'Sorumlu', 'Sonraki takip'].map(title => <th scope="col" key={title}>{title}</th>)}</tr></thead>
        <tbody>{leads.map(lead => (
          <tr key={lead.id} onClick={() => onSelect(lead.id)}>
            <td><button className="text-button" onClick={() => onSelect(lead.id)}>{lead.company}</button><small>{lead.name}</small></td>
            <td>{lead.email || 'E-posta yok'}<small>{lead.phone || 'Telefon yok'}</small></td>
            <td>{lead.source}</td><td><span className="badge">{lead.status}</span></td><td>{lead.owner}</td><td>{formatDate(lead.followUp)}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}
