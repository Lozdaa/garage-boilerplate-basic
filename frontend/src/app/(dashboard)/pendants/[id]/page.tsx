import type { Metadata } from 'next'
import { PendantDetails } from '@/components/pendants/PendantDetails'

export const metadata: Metadata = {
  title: 'Live Pendant',
}

export default async function LivePendantView({ params }: {params: Promise<{id: string}>}) {
  const { id } = await params

  return (
    <PendantDetails pendantID={id} />
  )
}
