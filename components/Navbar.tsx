'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import styles from './Navbar.module.css'
import LoginModal from './LoginModal'

const links = [
  { href: '/', label: 'Início' },
  { href: '/placar', label: 'Placar' },
  { href: '/tarefas', label: 'Tarefas' },
  { href: '/avisos', label: 'Avisos' },
  { href: '/fotos', label: 'Fotos' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo-full.png" alt="Batalha dos Farroups" width={36} height={28} style={{ objectFit: 'contain' }} />
        </Link>
        <ul className={styles.links}>
          {links.map(l => (
            <li key={l.href}>
              <Link href={l.href} className={`${styles.link} ${pathname === l.href ? styles.active : ''}`}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <button className={styles.loginBtn} onClick={() => setModalOpen(true)}>
          Área do Professor
        </button>
      </nav>
      <LoginModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
