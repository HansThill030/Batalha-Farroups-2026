'use client'
import { useEffect, useState } from 'react'
import styles from './professores.module.css'

const acoes = [
  { icon: '📋', titulo: 'Publicar Tarefa', desc: 'Crie e publique novas tarefas teóricas ou práticas com pontuação e prazo.' },
  { icon: '🏆', titulo: 'Atualizar Placar', desc: 'Adicione ou edite pontuações das equipes após a correção das tarefas.' },
  { icon: '📢', titulo: 'Novo Aviso', desc: 'Publique comunicados e atualizações oficiais visíveis para todos os alunos.' },
  { icon: '🖼️', titulo: 'Gerenciar Fotos', desc: 'Faça upload de fotos e organize a galeria de momentos da competição.' },
]

export default function Professores() {
  const [autenticado, setAutenticado] = useState(false)

  useEffect(() => {
    setAutenticado(localStorage.getItem('prof_auth') === 'true')
  }, [])

  function logout() {
    localStorage.removeItem('prof_auth')
    setAutenticado(false)
  }

  if (!autenticado) {
    return (
      <>
        <div className="page-header" style={{ marginTop: 64 }}>
          <h1 className="page-title">Área dos <span className="accent">Professores</span></h1>
          <p className="page-subtitle">Gerencie tarefas, placar e avisos da competição</p>
        </div>
        <div className={styles.locked}>
          <span className={styles.lockIcon}>🔒</span>
          <p>Faça login para acessar a área administrativa.</p>
          <p className={styles.hint}>Use o botão <strong>"Área do Professor"</strong> no menu superior.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-header" style={{ marginTop: 64 }}>
        <h1 className="page-title">Área dos <span className="accent">Professores</span></h1>
        <p className="page-subtitle">Bem-vindo! Gerencie a Batalha dos Farroups 2026.</p>
      </div>

      <div className={styles.grid}>
        {acoes.map((a) => (
          <div key={a.titulo} className={styles.card}>
            <span className={styles.icon}>{a.icon}</span>
            <div className={styles.cardTitulo}>{a.titulo}</div>
            <div className={styles.cardDesc}>{a.desc}</div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <button className="btn-secondary" onClick={logout}>Sair da área administrativa</button>
      </div>
    </>
  )
}
