import { useState } from 'react'
import type { Customer, CustomerDraft } from '../data/customers'
import CustomerForm from './CustomerForm'
import FormModal from './FormModal'

type Props = { customers: Customer[]; onSave: (draft: CustomerDraft, id?: string) => void }

export default function Customers({ customers, onSave }: Props) {
  const [customerId, setCustomerId] = useState('')
  const [owner, setOwner] = useState('')
  // null: kapalı, 'new': yeni kayıt, Customer: düzenlenecek mevcut kayıt.
  const [editor, setEditor] = useState<Customer | 'new' | null>(null)
  const [notice, setNotice] = useState('')
  const visible = customers.filter(customer =>
    (!customerId || customer.id === customerId) && (!owner || customer.owner === owner))

  return <section className="panel" aria-labelledby="customers-title">
    <div className="section-heading lead-list-heading">
      <div><h2 id="customers-title">Mevcut müşteriler</h2><small>{visible.length} / {customers.length} müşteri</small></div>
      <button type="button" aria-haspopup="dialog" onClick={() => { setNotice(''); setEditor('new') }}>+ Yeni Müşteri</button>
    </div>
    <div className="filters">
      <label className="search">Müşteri seç<select value={customerId} onChange={e => setCustomerId(e.target.value)}>
        <option value="">Tüm müşteriler</option>
        {[...customers].sort((a, b) => a.company.localeCompare(b.company, 'tr')).map(customer => <option key={customer.id} value={customer.id}>{customer.company} · {customer.contact}</option>)}
      </select></label>
      <label>Sorumlu<select value={owner} onChange={e => setOwner(e.target.value)}><option value="">Tüm sorumlular</option>{[...new Set(customers.map(customer => customer.owner))].map(value => <option key={value}>{value}</option>)}</select></label>
      <button type="button" className="secondary" onClick={() => { setCustomerId(''); setOwner('') }}>Temizle</button>
    </div>
    <p role="status" className="feedback">{notice}</p>
    {visible.length ? <div className="table-scroll"><table>
      <caption className="sr-only">Mevcut müşteriler ve iletişim bilgileri</caption>
      <thead><tr><th scope="col">Firma / İlgili kişi</th><th scope="col">İletişim</th><th scope="col">Şehir</th><th scope="col">Sorumlu</th><th scope="col">İşlem</th></tr></thead>
      <tbody>{visible.map(customer => <tr key={customer.id}>
        <td><strong>{customer.company}</strong><small>{customer.contact}</small></td>
        <td>{customer.email || 'E-posta belirtilmedi'}<small>{customer.phone || 'Telefon belirtilmedi'}</small></td>
        <td>{customer.city || 'Belirtilmedi'}</td><td>{customer.owner}</td>
        <td><button type="button" className="secondary compact-button" aria-haspopup="dialog" aria-label={`${customer.company}: detayları aç ve düzenle`} onClick={() => { setNotice(''); setEditor(customer) }}>Detay / Düzenle</button></td>
      </tr>)}</tbody>
    </table></div> : <p className="empty">{customers.length ? 'Aramana uygun müşteri bulunamadı. Filtreleri değiştirebilirsin.' : 'Henüz müşteri kaydı yok. Yeni Müşteri butonuyla çalıştığınız firmaları ekleyebilirsin.'}</p>}
    {editor !== null && <FormModal title={editor === 'new' ? 'Yeni Müşteri' : 'Müşteri Bilgileri'} onClose={() => setEditor(null)}>
      <CustomerForm customer={editor === 'new' ? null : editor} onCancel={() => setEditor(null)} onSave={draft => {
        onSave(draft, editor === 'new' ? undefined : editor.id)
        setNotice(editor === 'new' ? 'Müşteri eklendi.' : 'Müşteri bilgileri güncellendi.')
        setEditor(null); setCustomerId(''); setOwner('')
      }} />
    </FormModal>}
  </section>
}
