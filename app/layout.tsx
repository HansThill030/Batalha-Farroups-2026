import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Batalha dos Farroups 2026',
  description: 'Site oficial da Batalha dos Farroups 2026 — competição do nono ano.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
