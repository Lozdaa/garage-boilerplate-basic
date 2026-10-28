'use client'

import Link from "next/link"
import { useNow, usePendants } from "@/features/pendants/hooks/usePendant"
import { getStatus, secondsAgo } from "./pendantStatus"

export function PendantList() {
    const {pendants, loading, error} = usePendants()
    const now = useNow()

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error.message}</p>
    if (pendants.length === 0) return <p>No pendants have reported yet.</p>

    return (
        <ul className="divide-y rounded border">
            {pendants.map((pendant) => {
                const [status, colour] = getStatus(pendant,now)
                return (
                    <li key={pendant.id}>
                        <Link
                            href={`/pendants/${pendant.id}`}
                            className="flex items-center justify-between p-4 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            <div>
                                <p className="font-medium">{pendant.id}</p>
                                <p className="text-xs text-zinc-500">
                                    Last seen {secondsAgo(pendant.lastPing?.toMillis(), now)}
                                </p>
                            </div>
                            <span className={`rounded-full ${colour} px-3 py-1 text-sm font-semibold text-black`}>
                                {status}
                            </span>
                        </Link>
                    </li>
                )
            })}
        </ul>
    )
}
