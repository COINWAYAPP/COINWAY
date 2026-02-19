import type { Metadata } from 'next'
import { IBM_Plex_Mono, Syne } from 'next/font/google'
import { Providers } from '@/components/Providers'
import './globals.css'

const syne = Syne({ subsets: ['latin'], weight: ['400','500','600','700','800'], variable: '--font-syne' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['300','400','500','600'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Coinway — x402 Payment Gateway for AI Agents',
  description: 'The Stripe for AI agents. Accept USDC payments with one endpoint. No KYC. Built on Conway.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${mono.variable}`}>
      <body><Providers>{children}</Providers></body>
    </html>
  )
}
