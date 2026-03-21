'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import styles from './Navbar.module.css'
import LoginModal from './LoginModal'

const links = [
  { href: '/',        label: 'Início'  },
  { href: '/placar',  label: 'Placar'  },
  { href: '/tarefas', label: 'Tarefas' },
  { href: '/avisos',  label: 'Avisos'  },
  { href: '/fotos',   label: 'Fotos'   },
]

export default function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [turma,     setTurma]     = useState('')

  useEffect(() => {
    setTurma(sessionStorage.getItem('bdf_turma') || '')
  }, [pathname])

  function sairTurma() {
    sessionStorage.removeItem('bdf_turma')
    sessionStorage.removeItem('bdf_cor')
    setTurma('')
    router.push('/')
  }

  return (
    <>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo-icon.png" alt="Logo" width={32} height={32} style={{ objectFit:'contain', borderRadius:'6px' }} />
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
        <div className={styles.actions}>
          {turma && turma !== 'professor' ? (
            <>
              <Link href="/turma" className={styles.turmaBtn}>⚔️ Turma {turma}</Link>
              <button className={styles.sairBtn} onClick={sairTurma}>Sair</button>
            </>
          ) : (
            <>
              <Link href="/turma-login" className={styles.turmaLoginBtn}>Entrar como Turma</Link>
              <button className={styles.loginBtn} onClick={() => setModalOpen(true)}>Área do Professor</button>
            </>
          )}
        </div>
      </nav>
      <LoginModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
