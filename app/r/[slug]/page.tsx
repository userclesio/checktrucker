import { notFound } from 'next/navigation'
import { readDB } from '@/lib/db'
import RenderClient from './RenderClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const db = readDB()
  const link = db.links.find((l) => l.slug === params.slug)
  return {
    title: link?.name ?? 'Checkout',
    robots: { index: false, follow: false },
  }
}

export default function RenderPage({ params }: Props) {
  const db = readDB()
  const link = db.links.find((l) => l.slug === params.slug)

  if (!link) notFound()

  return (
    <RenderClient
      link={{
        id: link.id,
        url: link.url,
        pixelId: link.pixelId,
        fbToken: link.fbToken,
        value: link.value,
        currency: link.currency,
      }}
      globalSettings={db.settings}
    />
  )
}
