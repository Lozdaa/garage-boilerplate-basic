'use client'

import { useNow, usePendant } from "@/features/pendants/hooks/usePendant"
import type { Pendant } from "@/types/firestore"
import { PendantTile } from "./PendantTiles"
import { AlertList } from "./AlertList"
import { useTransition } from "react"
import { toast } from "sonner"
import { resolveSOS } from "@/features/pendants/actions/pendants.actions"
import { getStatus, secondsAgo } from './pendantStatus'

export function PendantDetails({pendantID}: {pendantID: string}) {
    const {pendant, loading, error} = usePendant(pendantID)
    const [isResolving, startResolving] = useTransition()
    const now = useNow()

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error.message}</p>
    if (!pendant) return <p>No data from {pendantID} yet</p>

    const [status, colour] = getStatus(pendant, now)

    const reading = pendant.lastReading ?? {}

    const tiles= [
        {label: "Temperature", value: reading.temperature?.toFixed(1), unit: "°C"},
        {label: "Humidity", value: reading.humidity?.toFixed(0), unit: "%"},
        {label: "Pressure", value: reading.pressure?.toFixed(0), unit: "hPa"},
        {label: "Acceleration", value: reading.acceleration ? `X: ${reading.acceleration?.x.toFixed(1)}\nY: ${reading.acceleration?.y.toFixed(1)}\nZ: ${reading.acceleration?.z.toFixed(1)}` : undefined, unit: ""},
    ]

    function onResolve() {
        startResolving(async () => {
            const result = await resolveSOS(pendantID)
            if (result.success) toast.success('SOS Resolved')
            else toast.error(result.error ?? 'Something went wrong')
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pendant: {pendant.id}</h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Last seen {secondsAgo(pendant.lastPing?.toMillis(), now)}
                    </p>
                </div>
                <span className={`rounded-full ${colour} px-3 py-1 text-sm font-semibold text-black`}>Safety Status: {status}</span>
            </div>

            {pendant.sosActive && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-orange-500 p-4 text-white">
                    <p className="font-semibold">SOS: wearer has requested help</p>
                    <button
                        onClick={onResolve}
                        disabled={isResolving}
                        className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-orange-700 disabled:opacity-60"
                    >
                        {isResolving ? 'Resolving...' : 'Mark as resolved'}
                    </button>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tiles.map((t) =>(
                    <PendantTile key={t.label} label={t.label} value={t.value} unit={t.unit} />
                ))}
            </div>

            <AlertList pendantID={pendantID} />

        </div>
    )

    
}