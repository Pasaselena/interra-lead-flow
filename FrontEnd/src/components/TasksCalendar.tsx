import { getLocale, t } from '../i18n'
import TaskDatePicker from './TaskDatePicker'
import FormModal from './FormModal'
import { useEffect, useRef, useState } from 'react'
import { formatDate, todayDate, type Lead } from '../data/leads'

export type Task = { id: string; title: string; date: string; time: string; kind: string; leadId: string; notes: string; done: boolean }
type Props = { tasks: Task[]; leads: Lead[]; onAdd: (task: Omit<Task, 'id' | 'done'>) => void; onUpdate: (task: Task) => void; onDelete: (id: string) => void; onToggle: (id: string) => void; onOpenLead: (id: string) => void }
const kinds = ['Arama', 'Toplantı', 'Saha ziyareti', 'Diğer']
// Her görev türünün simgesi aynı dosyada tanımlı; ayrı bileşen gerekmiyor.
const taskIconPaths: Record<string, string> = {
  Arama: 'M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2C10 21 3 14 3 5a2 2 0 0 1 2-2Z',
  Toplantı: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M17 3a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-4',
  'Saha ziyareti': 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  Diğer: 'M5 3h14v18H5Z M8 8h8 M8 12h8 M8 16h5',
}
const dateKey = (year: number, month: number, day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

export default function TasksCalendar({ tasks, leads, onAdd, onUpdate, onDelete, onToggle, onOpenLead }: Props) {
  const today = todayDate()
  const taskStatus = (task: Task) => task.done ? 'completed' : task.date < today ? 'overdue' : 'pending'
  const statusLabel = (status: string) => t(status === 'overdue' ? 'Gecikti' : status === 'completed' ? 'Tamamlandı' : 'Bekleyen')
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState('')
  const [filter, setFilter] = useState('pending')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [context, setContext] = useState<{ date: string; x: number; y: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!context) return
    menuRef.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true })
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) setContext(null)
    }
    function close() { setContext(null) }
    document.addEventListener('pointerdown', dismiss)
    window.addEventListener('resize', close)
    return () => { document.removeEventListener('pointerdown', dismiss); window.removeEventListener('resize', close) }
  }, [context])
  const [editAction, setEditAction] = useState<'edit' | 'note' | 'delete'>('edit')
  function editTask(task: Task, action: 'edit' | 'note' | 'delete' = 'edit') {
    setEditAction(action)
    setConfirmDelete(action === 'delete')
    setEditing(task)
    setTaskHour(task.time ? task.time.split(':')[0] : '')
    setTaskMinute(task.time ? task.time.split(':')[1] : '00')
    setContext(null)
    setShowForm(true)
  }
  const [showForm, setShowForm] = useState(false)
  const [taskHour, setTaskHour] = useState('')
  const [taskMinute, setTaskMinute] = useState('00')
  const year = month.getFullYear(), monthIndex = month.getMonth()
  const offset = (new Date(year, monthIndex, 1).getDay() + 6) % 7
  const days = new Date(year, monthIndex + 1, 0).getDate()
  const visible = tasks.filter(task => (!selectedDate || task.date === selectedDate) && (
    filter === 'all' || (filter === 'done' ? task.done : !task.done && (filter === 'today' ? task.date === today : filter === 'overdue' ? task.date < today : true))
  )).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
  const currentYear = new Date().getFullYear()
  const firstYear = Math.min(currentYear - 10, year)
  const lastYear = Math.max(currentYear + 20, year)
  function changeMonth(nextYear: number, nextMonth: number) {
    setMonth(new Date(nextYear, nextMonth, 1))
    setSelectedDate('')
    setContext(null)
  }
  function moveMonth(delta: number) { changeMonth(year, monthIndex + delta) }

  return <section aria-label={t("Görevler ve takvim")}>
    <div className="section-heading task-heading"><div><h2>{t("Gününü planla")}</h2><p className="hint">{t("Aramalarını, toplantılarını ve ziyaretlerini müşteri adaylarıyla ilişkilendir.")}</p></div><button type="button" onClick={() => { setEditAction('edit'); setConfirmDelete(false); setEditing(null); setTaskHour(''); setTaskMinute('00'); setShowForm(true) }} aria-haspopup="dialog">{t("+ Yeni Görev")}</button></div>
    <div className="task-summary">
      <span>{t("Bugün ")}<strong>{tasks.filter(t => !t.done && t.date === today).length}</strong></span>
      <span>{t("Geciken ")}<strong className="overdue">{tasks.filter(t => !t.done && t.date < today).length}</strong></span>
      <span>{t("Tamamlanan ")}<strong>{tasks.filter(t => t.done).length}</strong></span>
    </div>
    {showForm && <FormModal title={editing ? t("Görevi Düzenle") : t("Yeni Görev")} onClose={() => setShowForm(false)}><form id="task-form" onSubmit={event => {
      event.preventDefault()
      const data = new FormData(event.currentTarget)
      const title = String(data.get('title') || '').trim()
      if (!title) {
        const input = event.currentTarget.elements.namedItem('title') as HTMLInputElement
        input.setCustomValidity(t("Lütfen görev başlığı gir.")); input.reportValidity(); return
      }
      const draft = { title, date: String(data.get('date')), time: String(data.get('time')), kind: String(data.get('kind')), leadId: String(data.get('leadId')), notes: String(data.get('notes') || '').trim() }
      if (editing) onUpdate({ ...editing, ...draft })
      else onAdd(draft)
      setMonth(new Date(`${draft.date.slice(0, 7)}-01T12:00:00`))
      setFilter(editing?.done ? 'done' : 'pending'); setSelectedDate(''); setShowForm(false)
    }}>
      <div className="form-grid">
        <label>{t("Görev başlığı")}<input autoFocus={editAction === 'edit'} defaultValue={editing?.title} name="title" onInput={event => event.currentTarget.setCustomValidity('')} required maxLength={150} placeholder={t("Örn. Teklif sonrası görüşme")} /></label>
        <label>{t("Tür")}<select name="kind" defaultValue={editing?.kind}>{kinds.map(kind => <option key={kind} value={kind}>{t(kind)}</option>)}</select></label>
        <TaskDatePicker defaultValue={editing?.date || selectedDate || today} />
        <fieldset className="task-time-field">
          <legend>{t("Saat (isteğe bağlı)")}</legend>
          <div className="task-time-selectors">
            <select aria-label={t("Saat seç")} value={taskHour} onChange={event => { setTaskHour(event.target.value); if (!event.target.value) setTaskMinute('00') }}>
              <option value="">{t("Saat yok")}</option>
              {Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0')).map(hour => <option key={hour} value={hour}>{hour}</option>)}
            </select>
            <span aria-hidden="true">:</span>
            <select aria-label={t("Dakika seç")} value={taskMinute} disabled={taskHour === ''} onChange={event => setTaskMinute(event.target.value)}>
              {Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, '0')).map(minute => <option key={minute} value={minute}>{minute}</option>)}
            </select>
          </div>
          <input type="hidden" name="time" value={taskHour === '' ? '' : `${taskHour}:${taskMinute}`} />
        </fieldset>
        <label>{t("Müşteri adayı")}<select name="leadId" defaultValue={editing?.leadId || ''}><option value="">{t("Bağımsız görev")}</option>{leads.map(lead => <option key={lead.id} value={lead.id}>{lead.company} · {lead.name}</option>)}</select></label>
      </div>
      <label>{t("Notlar")}<textarea autoFocus={editAction === 'note'} name="notes" rows={3} maxLength={3000} defaultValue={editing?.notes || ''} placeholder={t("Görüşme notu veya görevle ilgili ayrıntılar…")} /></label>
      <div className="actions"><button type="submit">{editing ? t("Değişiklikleri kaydet") : t("Görevi kaydet")}</button><button type="button" className="secondary" onClick={() => setShowForm(false)}>{t("Vazgeç")}</button></div>
      {editing && <div className="task-delete-area">
        {confirmDelete ? <div role="group" aria-label={t("Görevi silme onayı")}>
          <p>“{editing.title}{t("” görevi silinsin mi? Bu işlem geri alınamaz.")}</p>
          <div className="actions"><button type="button" className="secondary overdue" onClick={() => { onDelete(editing.id); setShowForm(false); setEditing(null); setConfirmDelete(false) }}>{t("Evet, görevi sil")}</button><button autoFocus={editAction === 'delete'} type="button" className="secondary" onClick={() => setConfirmDelete(false)}>{t("Silmekten vazgeç")}</button></div>
        </div> : <button type="button" className="secondary overdue" onClick={() => setConfirmDelete(true)}>{t("Görevi sil")}</button>}
      </div>}
    </form></FormModal>}
    {context && <div ref={menuRef} className="task-context-menu" style={{ left: context.x, top: context.y }} role="group" aria-label={t("Görevi düzenle")} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); setContext(null) } }}>
      <strong>{formatDate(context.date)}</strong>
      {tasks.filter(task => task.date === context.date).map(task => <div key={task.id} className="task-context-group">
        <p><strong>{task.title}</strong><small>{t(task.kind)} · {task.time || t("Saat yok")}{task.done ? t(" · Tamamlandı") : ''}</small></p>
        <button type="button" aria-haspopup="dialog" onClick={() => editTask(task)}>{t("Görevi düzenle")}</button>
        <button type="button" aria-haspopup="dialog" onClick={() => editTask(task, 'note')}>{t("Not ekle")}</button>
        <button type="button" className="task-context-delete" aria-haspopup="dialog" onClick={() => editTask(task, 'delete')}>{t("Görevi sil")}</button>
      </div>)}
    </div>}
    <div className="tasks-workspace">
      <section className="panel task-calendar" aria-label={t("Aylık takvim")}>
        <div className="section-heading calendar-navigation"><button type="button" className="secondary" aria-label={t("Önceki ay")} onClick={() => moveMonth(-1)}>‹</button><div className="calendar-month-selectors">
          <select aria-label={t('Ay seç')} value={monthIndex} onChange={event => changeMonth(year, Number(event.target.value))}>
            {Array.from({ length: 12 }, (_, index) => <option key={index} value={index}>{new Date(2026, index, 1).toLocaleDateString(getLocale(), { month: 'long' })}</option>)}
          </select>
          <select aria-label={t('Yıl seç')} value={year} onChange={event => changeMonth(Number(event.target.value), monthIndex)}>
            {Array.from({ length: lastYear - firstYear + 1 }, (_, index) => firstYear + index).map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </div><span className="sr-only" aria-live="polite">{month.toLocaleDateString(getLocale(), { month: 'long', year: 'numeric' })}</span><button type="button" className="secondary" aria-label={t("Sonraki ay")} onClick={() => moveMonth(1)}>›</button></div>
        <p className="hint">{t("Görevli güne sağ tıklayarak düzenle. Görev kartındaki Düzenle düğmesini de kullanabilirsin.")}</p>
        <div className="task-color-legend">{['overdue', 'pending', 'completed'].map(status => <span key={status} className={`task-status-${status}`}><i aria-hidden="true" />{statusLabel(status)}</span>)}</div>
        <div className="calendar-grid">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => <span className="calendar-weekday" key={day}>{t(day)}</span>)}
          {Array.from({ length: offset }, (_, i) => <span key={`empty-${i}`} />)}
          {Array.from({ length: days }, (_, i) => {
            const date = dateKey(year, monthIndex, i + 1)
            const dayTasks = tasks.filter(task => task.date === date)
            const count = dayTasks.filter(task => !task.done).length
            const dayStatus = count ? (date < today ? 'overdue' : 'pending') : 'completed'
            const groups = kinds.flatMap(kind => ['overdue', 'pending', 'completed'].map(status => ({ kind, status, items: dayTasks.filter(task => task.kind === kind && taskStatus(task) === status) }))).filter(group => group.items.length)
            const summary = groups.map(group => `${group.items.length} ${t(group.kind)} (${statusLabel(group.status)})`).join(', ')
            return <button type="button" key={date} className={`calendar-day ${date === today ? 'is-today' : ''} ${dayTasks.length ? `has-tasks task-status-${dayStatus}` : ''}`} aria-current={date === today ? 'date' : undefined} aria-pressed={selectedDate === date} aria-label={t("{0}, {1} bekleyen görev{2}", { 0: formatDate(date), 1: count, 2: summary ? `, ${summary}` : '' })} onContextMenu={event => {
              if (!dayTasks.length) return
              event.preventDefault()
              const bounds = event.currentTarget.getBoundingClientRect()
              setContext({ date, x: Math.max(8, Math.min(event.clientX || bounds.left, window.innerWidth - 288)), y: Math.max(8, Math.min(event.clientY || bounds.bottom, window.innerHeight - 280)) })
            }} onClick={() => { setContext(null); setSelectedDate(date); setFilter('all') }}>
              {i + 1}
              <span className="calendar-task-icons" aria-hidden="true">{groups.map(({ kind, status, items }) => <span key={`${kind}-${status}`} className={`calendar-task-symbol task-status-${status}`} title={`${t(kind)} · ${statusLabel(status)} · ${items.length}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={taskIconPaths[kind]} /></svg>
                {items.length > 1 && <span>{items.length}</span>}
              </span>)}</span>
              <span aria-hidden="true">{dayTasks.length ? (count ? (date < today ? `${count} ${t("Gecikti")}` : t("{0} bekleyen", { 0: count })) : t("Tamamlandı")) : '\u00a0'}</span>
            </button>
          })}
        </div>
        <div className="actions"><button type="button" className="secondary" onClick={() => { setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); setSelectedDate(today); setFilter('all') }}>{t("Bugün")}</button><button type="button" className="secondary" onClick={() => setSelectedDate('')}>{t("Tüm tarihler")}</button></div>
      </section>
      <section className="panel task-list" aria-label={t("Görev listesi")}>
        <div className="section-heading"><h3>{selectedDate ? formatDate(selectedDate) : t("Tüm tarihler")}</h3><span className="badge">{visible.length} {t("görev")} </span></div>
        <label>{t("Görevleri göster")}<select value={filter} onChange={e => { setFilter(e.target.value); setSelectedDate('') }}><option value="pending">{t("Bekleyen")}</option><option value="today">{t("Bugün")}</option><option value="overdue">{t("Geciken")}</option><option value="done">{t("Tamamlanan")}</option><option value="all">{t("Tümü")}</option></select></label>
        <div className="task-results">{visible.map(task => {
          const lead = leads.find(item => item.id === task.leadId)
          return <article className={`task-card task-status-${taskStatus(task)} ${task.done ? 'task-done' : ''}`} key={task.id}>
            <label className="task-check"><input type="checkbox" checked={task.done} onChange={() => onToggle(task.id)} /><span>{task.title}</span></label>
            <button type="button" className="secondary compact-button" aria-haspopup="dialog" onClick={() => editTask(task)}>{t("Düzenle")}</button>
            <p className="hint">{t(task.kind)} · {formatDate(task.date)}{task.time && ` · ${task.time}`}</p>
            {task.notes && <p className="task-notes">{task.notes}</p>}
            <small className="task-status-label">{statusLabel(taskStatus(task))}</small>
            {lead && <button type="button" className="text-button" onClick={() => onOpenLead(lead.id)}>{lead.company} →</button>}
          </article>
        })}{!visible.length && <p className="empty">{t("Bu filtreye uygun görev yok. Yeni bir görev ekleyebilir veya filtreyi değiştirebilirsin.")}</p>}</div>
      </section>
    </div>
  </section>
}
