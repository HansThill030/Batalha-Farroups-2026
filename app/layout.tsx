import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/components/LoginModal'

export const metadata: Metadata = {
  title: 'Batalha dos Farroups 2026',
  description: 'Site oficial da Batalha dos Farroups 2026 — competição do nono ano.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
