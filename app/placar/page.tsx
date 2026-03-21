'use client'
import { useEffect, useState } from 'react'
import styles from './placar.module.css'

interface Equipe {
  nome: string
  cor: string
  pts: number
}

const EQUIPES_DEFAULT: Equipe[] = [
  { nome: 'Equipe Ouro',     cor: '#fbbf24', pts: 4200 },
  { nome: 'Equipe Prata',    cor: '#d1d5db', pts: 3850 },
  { nome: 'Equipe Bronze',   cor: '#cd7f32', pts: 3300 },
  { nome: 'Equipe Azul',     cor: '#2952cc', pts: 2900 },
  { nome: 'Equipe Vermelha', cor: '#e02020', pts: 2400 },
]

export default function Placar() {
  const [equipes, setEquipes] = useState<Equipe[]>(EQUIPES_DEFAULT)

  useEffect(() => {
    try {
      const salvas = localStorage.getItem('bdf_equipes')
      if (salvas) {
        const parsed = JSON.parse(salvas) as Equipe[]
        if (parsed.length > 0) setEquipes(parsed)
      }
    } catch {}

    // Polling a cada 10s para atualizar se o professor mudar
    const iv = setInterval(() => {
      try {
        const salvas = localStorage.getItem('bdf_equipes')
        if (salvas) {
          const parsed = JSON.parse(salvas) as Equipe[]
          if (parsed.length > 0) setEquipes(parsed)
        }
      } catch {}
    }, 10000)
    return () => clearInterval(iv)
  }, [])

  const sorted = [...equipes].sort((a, b) => b.pts - a.pts)
  const max = sorted[0]?.pts || 1

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Placar Geral</h1>
        <p className="page-sub">Classificação atualizada pelos professores</p>
      </div>
      <div className={styles.list}>
        {sorted.map((e, i) => (
          <div key={i} className={`${styles.card} ${styles[`rank${Math.min(i + 1, 3)}`]}`}>
            <div className={styles.pos}>{i + 1}</div>
            <div className={styles.dot} style={{ background: e.cor }} />
            <div className={styles.nome}>{e.nome}</div>
            <div className={styles.barWrap}>
              <div className={styles.bar} style={{ width: `${(e.pts / max * 100).toFixed(0)}%` }} />
            </div>
            <div className={styles.pts}>{e.pts.toLocaleString('pt-BR')} pts</div>
          </div>
        ))}
      </div>
    </>
  )
}
