import { useSyncExternalStore } from 'react'
import tr from './locales/tr.json'
import en from './locales/en.json'

export type Language = 'tr' | 'en'
const dictionaries: Record<Language, Record<string, string>> = { tr, en }
const listeners = new Set<() => void>()
const storageKey = 'leadflow-language'
function initialLanguage(): Language {
  try { return localStorage.getItem(storageKey) === 'en' ? 'en' : 'tr' } catch { return 'tr' }
}
let language: Language = initialLanguage()
export function getLanguage() { return language }
export function getLocale() { return language === 'tr' ? 'tr-TR' : 'en-GB' }
export function setLanguage(next: Language) {
  language = next
  document.documentElement.lang = next
  try { localStorage.setItem(storageKey, next) } catch { /* Dil, depolama kapalıyken de çalışır. */ }
  listeners.forEach(listener => listener())
}
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } }
export function useLanguage() { return useSyncExternalStore(subscribe, getLanguage, () => 'tr' as Language) }

// Sabit arayüz metinlerini çevirir; müşteri adları ve notlara uygulanmaz.
export function t(key: string, values: Record<string, string | number> = {}) {
  const text = dictionaries[language][key] ?? key
  return text.replace(/\{(\d+)\}/g, (match, token: string) => String(values[token] ?? match))
}
export function formatPercent(value: number) {
  return new Intl.NumberFormat(getLocale(), { style: 'percent', maximumFractionDigits: 1 }).format(value / 100)
}
export function ownerLabel(value: string) { return value === 'Atanmadı' ? t('Atanmadı') : value }
