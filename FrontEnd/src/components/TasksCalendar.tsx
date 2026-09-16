import FormModal from './FormModal'
import { useState } from 'react'
import { formatDate, todayDate, type Lead } from '../data/leads'

export type Task = { id: string; title: string; date: string; time: string; kind: string; leadId: string; done: boolean }
type Props = { tasks: Task[]; leads: Lead[]; onAdd: (task: Omit<Task, 'id' | 'done'>) => void; onToggle: (id: string) => void; onOpenLead: (id: string) => void }
const kinds = ['Arama', 'Toplantı', 'Saha ziyareti', 'Diğer']
const dateKey = (year: number, month: number, day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

export default function TasksCalendar({ tasks, leads, onAdd, onToggle, onOpenLead }: Props) {
  const today = todayDate()
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState('')
  const [filter, setFilter] = useState('pending')
  const [showForm, setShowForm] = useState(false)
  const [notice, setNotice] = useState('')
  const year = month.getFullYear(), monthIndex = month.getMonth()
  const offset = (new Date(year, monthIndex, 1).getDay() + 6) % 7
  const days = new Date(year, monthIndex + 1, 0).getDate()
  const visible = tasks.filter(task => (!selectedDate || task.date === selectedDate) && (
    filter === 'all' || (filter === 'done' ? task.done : !task.done && (filter === 'today' ? task.date === today : filter === 'overdue' ? task.date < today : true))
  )).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
  function moveMonth(delta: number) { setMonth(new Date(year, monthIndex + delta, 1)); setSelectedDate('') }

  return <section aria-label="Görevler ve takvim">
    <div className="section-heading task-heading"><div><h2>Gününü planla</h2><p className="hint">Aramalarını, toplantılarını ve ziyaretlerini müşteri adaylarıyla ilişkilendir.</p></div><button type="button" onClick={() => { setNotice(''); setShowForm(true) }} aria-haspopup="dialog">+ Yeni Görev</button></div>
    <div className="task-summary">
      <span>Bugün <strong>{tasks.filter(t => !t.done && t.date === today).length}</strong></span>
      <span>Geciken <strong className="overdue">{tasks.filter(t => !t.done && t.date < today).length}</strong></span>
      <span>Tamamlanan <strong>{tasks.filter(t => t.done).length}</strong></span>
    </div>
    {showForm && <FormModal title="Yeni Görev" onClose={() => setShowForm(false)}><form id="task-form" onSubmit={event => {
      event.preventDefault()
      const data = new FormData(event.currentTarget)
      const title = String(data.get('title') || '').trim()
      if (!title) {
        const input = event.currentTarget.elements.namedItem('title') as HTMLInputElement
        input.setCustomValidity('Lütfen görev başlığı gir.'); input.reportValidity(); return
      }
      onAdd({ title, date: String(data.get('date')), time: String(data.get('time')), kind: String(data.get('kind')), leadId: String(data.get('leadId')) })
      setFilter('pending'); setSelectedDate(''); setShowForm(false); setNotice('Yeni görev eklendi.')
    }}>
      <div className="form-grid">
        <label>Görev başlığı<input autoFocus name="title" onInput={event => event.currentTarget.setCustomValidity('')} required maxLength={150} placeholder="Örn. Teklif sonrası görüşme" /></label>
        <label>Tür<select name="kind">{kinds.map(kind => <option key={kind}>{kind}</option>)}</select></label>
        <label>Tarih<input type="date" name="date" required defaultValue={selectedDate || today} /></label>
        <label>Saat (isteğe bağlı)<input type="time" name="time" /></label>
        <label>Müşteri adayı<select name="leadId"><option value="">Bağımsız görev</option>{leads.map(lead => <option key={lead.id} value={lead.id}>{lead.company} · {lead.name}</option>)}</select></label>
      </div><div className="actions"><button type="submit">Görevi kaydet</button><button type="button" className="secondary" onClick={() => setShowForm(false)}>Vazgeç</button></div>
    </form></FormModal>}
    <p role="status" className="hint">{notice}</p>
    <div className="tasks-workspace">
      <section className="panel task-calendar" aria-label="Aylık takvim">
        <div className="section-heading"><button type="button" className="secondary" aria-label="Önceki ay" onClick={() => moveMonth(-1)}>‹</button><h3 aria-live="polite">{month.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</h3><button type="button" className="secondary" aria-label="Sonraki ay" onClick={() => moveMonth(1)}>›</button></div>
        <div className="calendar-grid">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => <span className="calendar-weekday" key={day}>{day}</span>)}
          {Array.from({ length: offset }, (_, i) => <span key={`empty-${i}`} />)}
          {Array.from({ length: days }, (_, i) => {
            const date = dateKey(year, monthIndex, i + 1)
            const count = tasks.filter(task => task.date === date && !task.done).length
            return <button type="button" key={date} className={`calendar-day ${date === today ? 'is-today' : ''}`} aria-current={date === today ? 'date' : undefined} aria-pressed={selectedDate === date} aria-label={`${formatDate(date)}, ${count} bekleyen görev`} onClick={() => { setSelectedDate(date); setFilter('all') }}>{i + 1}<span aria-hidden="true">{count ? `${count} iş` : '\u00a0'}</span></button>
          })}
        </div>
        <div className="actions"><button type="button" className="secondary" onClick={() => { setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); setSelectedDate(today); setFilter('all') }}>Bugün</button><button type="button" className="secondary" onClick={() => setSelectedDate('')}>Tüm tarihler</button></div>
      </section>
      <section className="panel task-list" aria-label="Görev listesi">
        <div className="section-heading"><h3>{selectedDate ? formatDate(selectedDate) : 'Tüm tarihler'}</h3><span className="badge">{visible.length} görev</span></div>
        <label>Görevleri göster<select value={filter} onChange={e => { setFilter(e.target.value); setSelectedDate('') }}><option value="pending">Bekleyen</option><option value="today">Bugün</option><option value="overdue">Geciken</option><option value="done">Tamamlanan</option><option value="all">Tümü</option></select></label>
        <div className="task-results">{visible.map(task => {
          const lead = leads.find(item => item.id === task.leadId)
          return <article className={`task-card ${task.done ? 'task-done' : ''}`} key={task.id}>
            <label className="task-check"><input type="checkbox" checked={task.done} onChange={() => onToggle(task.id)} /><span>{task.title}</span></label>
            <p className="hint">{task.kind} · {formatDate(task.date)}{task.time && ` · ${task.time}`}</p>
            {!task.done && task.date < today && <small className="overdue">Gecikti</small>}
            {lead && <button type="button" className="text-button" onClick={() => onOpenLead(lead.id)}>{lead.company} →</button>}
          </article>
        })}{!visible.length && <p className="empty">Bu filtreye uygun görev yok. Yeni bir görev ekleyebilir veya filtreyi değiştirebilirsin.</p>}</div>
      </section>
    </div>
  </section>
}
