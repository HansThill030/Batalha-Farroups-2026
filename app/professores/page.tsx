'use client'
import { useAuth } from '@/components/LoginModal'
import { useEffect, useState } from 'react'
import styles from './professores.module.css'

const tabs = [
  { icon: '🏆', titulo: 'Placar', desc: 'Edite a pontuação das equipes.' },
  { icon: '📋', titulo: 'Nova Tarefa', desc: 'Publique tarefas teóricas ou práticas.' },
  { icon: '📢', titulo: 'Novo Aviso', desc: 'Publique comunicados oficiais.' },
  { icon: '🖼️', titulo: 'Fotos', desc: 'Gerencie a galeria de fotos.' },
]

export default function Professores() {
  const { isAuth, logout } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Enquanto não montou no cliente, mostra tela neutra
  if (!mounted) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Área dos Professores</h1>
          <p className="page-sub">Carregando...</p>
        </div>
      </>
    )
  }

  if (!isAuth) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Área dos Professores</h1>
          <p className="page-sub">Gerencie tarefas, placar e avisos</p>
        </div>
        <div className={styles.locked}>
          <span className={styles.lockEmoji}>🔒</span>
          <h2>Acesso Restrito</h2>
          <p>Clique em <strong>"Área do Professor"</strong> no menu superior para fazer login.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.6 }}>
            Usuário: <code>professor</code> · Senha: <code>2026</code>
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Área dos Professores</h1>
        <p className="page-sub">Bem-vindo! Gerencie a Batalha dos Farroups 2026.</p>
      </div>

      <div className={styles.grid}>
        {tabs.map(t => (
          <div key={t.titulo} className={styles.card}>
            <span className={styles.cardIcon}>{t.icon}</span>
            <div className={styles.cardTitle}>{t.titulo}</div>
            <div className={styles.cardDesc}>{t.desc}</div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <button className="btn-ghost btn-sm" onClick={logout}>
          Sair da área administrativa
        </button>
      </div>
    </>
  )
}
