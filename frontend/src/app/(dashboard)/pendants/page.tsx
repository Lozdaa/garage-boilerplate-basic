import type { Metadata } from 'next'
import { PendantList } from '@/components/pendants/PendantList'

export const metadata: Metadata = {
    title: 'Pendants',
}

export default function PendantsPage() {
    return (
        <div className='space-y-6'>
            <h1 className='text-2xl font-bold tracking-tight'>
                Pendants
            </h1>
            <PendantList />
        </div>
    )
}