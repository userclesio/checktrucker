import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import RenderClient from './RenderClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const link = await prisma.link.findUnique({ where: { slug: params.slug } })
  return {
    title: link?.name ?? 'Checkout',
    robots: { index: false, follow: false },
  }
}

export default async function RenderPage({ params }: Props) {
  const [link, settings] = await Promise.all([
    prisma.link.findUnique({ where: { slug: params.slug } }),
    prisma.settings.findUnique({ where: { id: 1 } }),
  ])

  if (!link) notFound()

  return (
    <RenderClient
      link={{
        id: link.id,
        url: link.url,
        pixelId: link.pixelId ?? undefined,
        fbToken: link.fbToken ?? undefined,
        value: link.value,
        currency: link.currency,
      }}
      globalSettings={settings ?? { pixelId: '', fbToken: '' }}
    />
  )
}
