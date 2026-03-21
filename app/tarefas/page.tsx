'use client'
import { useEffect, useState } from 'react'
import styles from './tarefas.module.css'

interface Tarefa {
  tipo: 'teorica' | 'pratica'
  num: string
  titulo: string
  desc: string
  pts1: number
  status: 'aberta' | 'encerrada' | 'pendente'
}

const TAREFAS_DEFAULT: Tarefa[] = [
  { tipo: 'pratica', num: '01', titulo: 'Desafio de Embaixadinhas', desc: 'Grave um vídeo com a maior quantidade de embaixadinhas consecutivas.', pts1: 2000, status: 'aberta' },
  { tipo: 'teorica', num: '01', titulo: 'Questão Teórica 01', desc: 'Primeira questão teórica da edição 2026. Responda por e-mail até o prazo.', pts1: 1000, status: 'aberta' },
  { tipo: 'teorica', num: '02', titulo: 'Questão Teórica 02', desc: 'Segunda questão teórica. Fique atento ao prazo no aviso oficial.', pts1: 1000, status: 'encerrada' },
  { tipo: 'teorica', num: '03', titulo: 'Em breve...', desc: 'Esta tarefa ainda não foi publicada.', pts1: 1000, status: 'pendente' },
]

export default function Tarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>(TAREFAS_DEFAULT)

  useEffect(() => {
    try {
      const salvas = localStorage.getItem('bdf_tarefas')
      if (salvas) {
        const parsed = JSON.parse(salvas) as Tarefa[]
        if (parsed.length > 0) setTarefas(parsed)
      }
    } catch {}
  }, [])

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Tarefas &amp; Desafios</h1>
        <p className="page-sub">Seja o primeiro a responder e ganhe mais pontos</p>
      </div>
      <div className={styles.grid}>
        {tarefas.map((t, i) => {
          const p2 = Math.round(t.pts1 * 0.7)
          const p3 = Math.round(t.pts1 * 0.5)
          return (
            <div key={i} className={`${styles.card} ${t.status === 'pendente' ? styles.pendente : ''}`}>
              <div className={styles.header}>
                <span className={`${styles.tipo} ${styles[t.tipo]}`}>
                  {t.tipo === 'pratica' ? 'Prática' : 'Teórica'}
                </span>
                <span className={styles.num}>#{t.num}</span>
              </div>
              <div className={styles.titulo}>{t.titulo}</div>
              <div className={styles.desc}>{t.desc}</div>
              {t.status !== 'pendente' && (
                <div className={styles.footer}>
                  <div className={styles.pts}>
                    1º: <span>{t.pts1}</span> · 2º: <span>{p2}</span> · 3º: <span>{p3}</span>
                  </div>
                  <span className={`${styles.badge} ${styles[t.status]}`}>
                    {t.status === 'aberta' ? 'Aberta' : 'Encerrada'}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
