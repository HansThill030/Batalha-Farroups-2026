'use client'
import { useEffect, useState } from 'react'
import styles from './avisos.module.css'

interface Aviso {
  tag: string
  data: string
  titulo: string
  texto: string
}

const AVISOS_DEFAULT: Aviso[] = [
  { tag: 'Oficial', data: '2026-03-18', titulo: 'Site da Batalha no Ar!', texto: 'O site oficial foi lançado. Aqui você encontrará todas as tarefas, placar, avisos e fotos.' },
  { tag: 'Regras',  data: '2026-03-18', titulo: 'Pontuação 2026', texto: 'Teóricas valem até 1000 pts e práticas até 2000, distribuídos por ordem de entrega correta.' },
  { tag: 'Prazo',   data: '2026-03-18', titulo: 'Prazo de Entrega', texto: 'Envie para o e-mail oficial até às 00h do dia seguinte à publicação.' },
]

export default function Avisos() {
  const [avisos, setAvisos] = useState<Aviso[]>(AVISOS_DEFAULT)

  useEffect(() => {
    try {
      const salvas = localStorage.getItem('bdf_avisos')
      if (salvas) {
        const parsed = JSON.parse(salvas) as Aviso[]
        if (parsed.length > 0) setAvisos(parsed)
      }
    } catch {}
  }, [])

  const formatData = (str: string) => {
    const d = new Date(str + 'T12:00:00')
    const dia = d.getDate().toString().padStart(2, '0')
    const mes = d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '')
    return { dia, mes, ano: d.getFullYear() }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Avisos Oficiais</h1>
        <p className="page-sub">Comunicados e atualizações da organização</p>
      </div>
      <div className={styles.list}>
        {[...avisos].reverse().map((a, i) => {
          const { dia, mes, ano } = formatData(a.data)
          return (
            <div key={i} className={styles.item}>
              <div className={styles.date}>
                <span className={styles.day}>{dia}</span>
                <span className={styles.month}>{mes} {ano}</span>
              </div>
              <div>
                <span className={styles.tag}>{a.tag}</span>
                <div className={styles.titulo}>{a.titulo}</div>
                <div className={styles.texto}>{a.texto}</div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
