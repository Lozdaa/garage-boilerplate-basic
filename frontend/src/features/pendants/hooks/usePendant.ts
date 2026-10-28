'use client'

import { useEffect, useState } from "react";
import { onSnapshot, query, where } from "firebase/firestore";
import { pendantDoc, getAlertsCollection } from "@/lib/firebase/firestore";
import type { Pendant, PendantAlert } from "@/types/firestore";

export function usePendant(pendantID: string) {
    //Pendant data and then state of the data (loading and then if error'd)
    const [pendant, setPendant] = useState<Pendant | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        //Starting listener for pendants/{pendantID}
        const unsubscribe = onSnapshot(
            pendantDoc(pendantID),
            //Call it immeditelly with current data, then again EVERY time
            // it changes
            (snap) => {
                setPendant(snap.exists() ? {...snap.data(), id: snap.id} : null)
                setLoading(false)
            },
            // if listener fails such as through permissions
            (err) => {
                setError(err)
                setLoading(false)
            },
        )

        // When page is unloaded, react calls this to stop listening
        return unsubscribe
    }, [pendantID]) // Only re-subscribes if the pendant id changes

    return {pendant, loading, error}
}

export function useNow(intervalMs = 5000) {
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), intervalMs)
        return () => clearInterval(id) // stop timer when page closes
    }, [intervalMs])

    return now
}

export function usePendantAlerts(pendantID: string) {
    const [alerts, setAlerts] = useState<PendantAlert[]>([])
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        //Getting alerts only relating to this pendant
        const q = query(getAlertsCollection(), where('pendantID', '==', pendantID))

        const unsubscribe = onSnapshot(
            q,
            (snap) => {
                const list = snap.docs.map((d) => ({...d.data(), id: d.id}))
                //Newest alert first. Sorted here instead of orderBy()
                //because where+orderBy on different fields will need a direstore composite index
                list.sort((a, b) => b.startedAt.toMillis() - a.startedAt.toMillis())
                setAlerts(list)
            },
            (err) => setError(err),
        )
        return unsubscribe
    }, [pendantID])

    return {alerts, error}
}