import type { Pendant } from '@/types/firestore'

export const OFFLINE_AFTER_MS = 90_000

export type Status = 'SOS' | 'DANGER' | 'OFFLINE' | 'WARNING' | 'OK'

//Ordering pendant status, worst is manual help
export function getStatus(pendant: Pendant, now: number): [Status, string] {
    if (pendant.sosActive) return ['SOS', 'bg-orange-500']
    if (pendant.dangerActive) return ['DANGER', 'bg-red-500']

    const lastPing = pendant.lastPing?.toMillis()
    if (lastPing === undefined || now - lastPing > OFFLINE_AFTER_MS) return ['OFFLINE', "bg-zinc-200"]

    if (pendant.warnings && pendant.warnings.length > 0) return ['WARNING', "bg-yellow-400"]
    
    return ['OK', "bg-green-500"]
}

export function secondsAgo(ms: number | undefined, now: number): string {
    if (ms === undefined) return 'never'
    const sec = Math.max(0, Math.round((now - ms) / 1000))

    return sec < 60 ? `${sec}s ago` : `${Math.round(sec/60)} min ago`
}

export const REASON_LABELS: Record<string, string> = {
    TEMPERATURE: 'Temperature',
    HUMIDITY: 'Humidity',
    PRESSURE: 'Pressure',
    TURNED_OVER: 'Turned over',
    TILTED: 'Tilted',
}

// Border colour
export function tileBorder(reason: string, dangers: string[], warnings: string[]): string {
  if (dangers.includes(reason)) return 'border-red-500 border-4'
  if (warnings.includes(reason)) return 'border-yellow-400 border-4'
  return ''
}