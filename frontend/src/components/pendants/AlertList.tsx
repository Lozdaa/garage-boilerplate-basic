'use client'

import { formatDatetime } from "@/lib/utils"
import { usePendantAlerts } from "@/features/pendants/hooks/usePendant"

export function AlertList({pendantID}: {pendantID: string}) {
    const {alerts, error} = usePendantAlerts(pendantID)

    if (error) return <p className="text-sm text-red-600">Couldn&apos;t load alerts: {error.message}</p>
    if (alerts.length === 0) return <p className="text-sm text-zinc-500">No alerts for this pendant.</p>

    return (
        <ul className="divide-y rounded border">
            {alerts.map((alert) => (
                <li key={alert.id} className="flex items-center justify-between p-3">
                    <div>
                        <p className="font-medium">{alert.reasons.join(', ')}</p>
                        {/**The evidence: what the sensors read when it triggered */}
                        <p className="text-xs text-zinc-500">
                            {alert.evidence.temperature !== null && `${alert.evidence.temperature}°C · `}
                            started {formatDatetime(alert.startedAt.toDate())}
                            {alert.resolvedAt && ` · resolved ${formatDatetime(alert.resolvedAt.toDate())}`}
                        </p>
                    </div>
                    <span className={alert.status === 'active' ? 'font-semibold text-red-600' : 'text-zinc-500'}>
                        {alert.status}
                    </span>
                </li>
            ))}
        </ul>
    )
}