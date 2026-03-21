'use client'
import { useEffect, useState } from 'react'
import styles from './placar.module.css'

interface Equipe { pos: number; nome: string; cor: string; pts: number }

const DEFAULT: Equipe[] = [
  { pos:1, nome:'Equipe Ouro',     cor:'#fbbf24', pts:0 },
  { pos:2, nome:'Equipe Prata',    cor:'#d1d5db', pts:0 },
  { pos:3, nome:'Equipe Bronze',   cor:'#cd7f32', pts:0 },
  { pos:4, nome:'Equipe Azul',     cor:'#2952cc', pts:0 },
  { pos:5, nome:'Equipe Vermelha', cor:'#e02020', pts:0 },
]

export default function Placar() {
  const [equipes, setEquipes] = useState<Equipe[]>(DEFAULT)
  const [fonte,   setFonte]   = useState<'sheets'|'local'|'default'>('default')
  const [loading, setLoading] = useState(true)

  async function buscar() {
    // 1. Tenta Google Sheets via API
    try {
      const res  = await fetch('/api/placar', { cache: 'no-store' })
      const data = await res.json()
      if (res.ok && Array.isArray(data) && data.length > 0) {
        setEquipes(data); setFonte('sheets'); setLoading(false); return
      }
    } catch {}

    // 2. Fallback: localStorage (quando professor edita manualmente)
    try {
      const local = localStorage.getItem('bdf_equipes')
      if (local) {
        const parsed = JSON.parse(local)
        if (parsed.length > 0) {
          const sorted = [...parsed].sort((a: Equipe, b: Equipe) => b.pts - a.pts)
            .map((e: Equipe, i: number) => ({ ...e, pos: i + 1 }))
          setEquipes(sorted); setFonte('local'); setLoading(false); return
        }
      }
    } catch {}

    setFonte('default'); setLoading(false)
  }

  useEffect(() => {
    buscar()
    const iv = setInterval(buscar, 15000) // atualiza a cada 15s
    return () => clearInterval(iv)
  }, [])

  const max = equipes[0]?.pts || 1

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Placar Geral</h1>
        <p className="page-sub">
          {fonte === 'sheets' ? '🟢 Sincronizado com Google Sheets · atualiza a cada 15s' :
           fonte === 'local'  ? '🟡 Dados locais (professor ainda não sincronizou com Sheets)' :
           '⚪ Aguardando dados do professor'}
        </p>
      </div>
      {loading ? (
        <p style={{padding:'3rem 5rem',color:'rgba(255,255,255,0.4)'}}>Carregando placar...</p>
      ) : (
        <div className={styles.list}>
          {equipes.map((e, i) => (
            <div key={i} className={`${styles.card} ${styles[`rank${Math.min(i+1,3)}`]}`}>
              <div className={styles.pos}>{i + 1}</div>
              <div className={styles.dot} style={{ background: e.cor }} />
              <div className={styles.nome}>{e.nome}</div>
              <div className={styles.barWrap}>
                <div className={styles.bar} style={{ width: `${((e.pts||0) / max * 100).toFixed(0)}%` }} />
              </div>
              <div className={styles.pts}>{(e.pts||0).toLocaleString('pt-BR')} pts</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
