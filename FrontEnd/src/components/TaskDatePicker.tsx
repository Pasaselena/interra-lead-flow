import { getLocale, t } from '../i18n'
import { useId, useLayoutEffect, useRef, useState } from 'react'
import { formatDate, todayDate } from '../data/leads'
import './TaskDatePicker.css'

// FormData, gizli input'taki ISO tarihini önceki date alanıyla aynı şekilde okur.
type Props = {
  defaultValue?: string
  value?: string
  onChange?: (date: string) => void
  name?: string
  label?: string
}
export default function TaskDatePicker({ defaultValue = '', value: controlledValue, onChange, name = 'date', label = t('Tarih') }: Props) {
  const [internalValue, setValue] = useState(defaultValue || todayDate())
  const value = controlledValue ?? internalValue
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => new Date(`${(value || todayDate()).slice(0, 7)}-01T12:00:00`))
  const trigger = useRef<HTMLButtonElement>(null)
  const calendar = useRef<HTMLElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const id = useId()
  useLayoutEffect(() => {
    if (!open) return
    function place() {
      if (!trigger.current || !calendar.current) return
      const field = trigger.current.getBoundingClientRect()
      const popup = calendar.current.getBoundingClientRect()
      const top = field.bottom + 6 + popup.height <= window.innerHeight - 12
        ? field.bottom + 6 : Math.max(12, field.top - popup.height - 6)
      const left = Math.max(12, Math.min(field.left, window.innerWidth - popup.width - 12))
      setPosition({ top, left })
    }
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !calendar.current?.contains(event.target) && !trigger.current?.contains(event.target)) setOpen(false)
    }
    function leave(event: FocusEvent) {
      if (event.target instanceof Node && !calendar.current?.contains(event.target) && !trigger.current?.contains(event.target)) setOpen(false)
    }
    place()
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('focusin', leave)
    window.addEventListener('resize', place)
    document.addEventListener('scroll', place, true)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('focusin', leave)
      window.removeEventListener('resize', place)
      document.removeEventListener('scroll', place, true)
    }
  }, [open, month])
  const year = month.getFullYear(), index = month.getMonth()
  const currentYear = new Date().getFullYear()
  const firstYear = Math.min(currentYear - 10, year)
  const lastYear = Math.max(currentYear + 20, year)
  const offset = (new Date(year, index, 1).getDay() + 6) % 7
  const days = new Date(year, index + 1, 0).getDate()
  function choose(date: string) { setValue(date); onChange?.(date); setOpen(false); trigger.current?.focus() }
  return <div className="task-date-field" onKeyDown={event => {
    if (open && event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus() }
  }}>
    <span id={`${id}-label`}>{label}</span>
    <input type="hidden" name={name} value={value} />
    <button ref={trigger} type="button" className="secondary task-date-trigger" aria-labelledby={`${id}-label ${id}-value`} aria-expanded={open} aria-controls={id} onClick={() => {
      if (!open) setMonth(new Date(`${(value || todayDate()).slice(0, 7)}-01T12:00:00`))
      setOpen(!open)
    }}><span id={`${id}-value`}>{formatDate(value)}</span><span aria-hidden="true">▦</span></button>
    {open && <section ref={calendar} id={id} style={position} className="task-date-calendar" aria-labelledby={`${id}-label`}>
      <div className="task-date-header">
        <button type="button" className="secondary" aria-label={t("Önceki ay")} onClick={() => setMonth(new Date(year, index - 1, 1))}>‹</button>
        <div className="task-date-selectors">
          <select aria-label={t("Ay seç")} value={index} onChange={event => setMonth(new Date(year, Number(event.target.value), 1))}>
            {Array.from({ length: 12 }, (_, monthIndex) => <option key={monthIndex} value={monthIndex}>{new Date(2026, monthIndex, 1).toLocaleDateString(getLocale(), { month: 'long' })}</option>)}
          </select>
          <select aria-label={t("Yıl seç")} value={year} onChange={event => setMonth(new Date(Number(event.target.value), index, 1))}>
            {Array.from({ length: lastYear - firstYear + 1 }, (_, offset) => firstYear + offset).map(optionYear => <option key={optionYear} value={optionYear}>{optionYear}</option>)}
          </select>
        </div>
        <button type="button" className="secondary" aria-label={t("Sonraki ay")} onClick={() => setMonth(new Date(year, index + 1, 1))}>›</button>
      </div>
      <div className="task-date-days">
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => <span className="task-date-weekday" key={day}>{t(day)}</span>)}
        {Array.from({ length: offset }, (_, day) => <span key={`blank-${day}`} />)}
        {Array.from({ length: days }, (_, day) => {
          const date = `${year}-${String(index + 1).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`
          return <button type="button" key={date} aria-label={formatDate(date)} aria-pressed={date === value} aria-current={date === todayDate() ? 'date' : undefined} onClick={() => choose(date)}>{day + 1}</button>
        })}
      </div>
      <div className="task-date-footer"><button type="button" className="secondary" onClick={() => choose(todayDate())}>{t("Bugünü seç")}</button><button type="button" className="secondary" onClick={() => { setOpen(false); trigger.current?.focus() }}>{t("Takvimi kapat")}</button></div>
    </section>}
  </div>
}
