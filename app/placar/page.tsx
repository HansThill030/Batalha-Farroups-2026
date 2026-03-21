'use client'
import { useEffect, useState } from 'react'
import styles from './placar.module.css'

interface Equipe {
  nome: string
  cor: string
  pts: number
}

const DEFAULT: Equipe[] = [
  { nome: 'Equipe Ouro',     cor: '#fbbf24', pts: 0 },
  { nome: 'Equipe Prata',    cor: '#d1d5db', pts: 0 },
  { nome: 'Equipe Bronze',   cor: '#cd7f32', pts: 0 },
  { nome: 'Equipe Azul',     cor: '#2952cc', pts: 0 },
  { nome: 'Equipe Vermelha', cor: '#e02020', pts: 0 },
]

export default function Placar() {
  const [equipes, setEquipes] = useState<Equipe[]>(DEFAULT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const salvo = localStorage.getItem('bdf_equipes')
      if (salvo) {
        const dados = JSON.parse(salvo) as Equipe[]
        if (Array.isArray(dados) && dados.length > 0) {
          setEquipes([...dados].sort((a, b) => b.pts - a.pts))
        }
      }
    } catch {}
    setLoading(false)

    const iv = setInterval(() => {
      try {
        const salvo = localStorage.getItem('bdf_equipes')
        if (salvo) {
          const dados = JSON.parse(salvo) as Equipe[]
          if (Array.isArray(dados) && dados.length > 0) {
            setEquipes([...dados].sort((a, b) => b.pts - a.pts))
          }
        }
      } catch {}
    }, 5000)
    return () => clearInterval(iv)
  }, [])

  const max = Math.max(...equipes.map(e => e.pts), 1)

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Placar Geral</h1>
        <p className="page-sub">Classificação atualizada pelos professores</p>
      </div>

      {loading ? (
        <p style={{ padding: '3rem 5rem', color: 'rgba(255,255,255,0.4)' }}>
          Carregando...
        </p>
      ) : (
        <div className={styles.list}>
          {equipes.map((e, i) => (
            <div
              key={i}
              className={`${styles.card} ${i === 0 ? styles.rank1 : i === 1 ? styles.rank2 : i === 2 ? styles.rank3 : ''}`}
            >
              <div className={styles.pos}>{i + 1}</div>
              <div className={styles.dot} style={{ background: e.cor }} />
              <div className={styles.nome}>{e.nome}</div>
              <div className={styles.barWrap}>
                <div
                  className={styles.bar}
                  style={{ width: `${((e.pts / max) * 100).toFixed(0)}%` }}
                />
              </div>
              <div className={styles.pts}>{e.pts.toLocaleString('pt-BR')} pts</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
