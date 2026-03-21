'use client'
import { useEffect, useState } from 'react'
import styles from './fotos.module.css'

interface Foto {
  src: string
  legenda: string
}

export default function Fotos() {
  const [fotos, setFotos] = useState<Foto[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const salvas = localStorage.getItem('bdf_fotos')
      if (salvas) setFotos(JSON.parse(salvas))
    } catch {}
  }, [])

  if (!mounted) return null

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Galeria de Fotos</h1>
        <p className="page-sub">Momentos da Batalha dos Farroups 2026</p>
      </div>
      <div className={styles.grid}>
        {fotos.length === 0 ? (
          Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.placeholder}>
                Foto {String(i + 1).padStart(2, '0')}<br />Em breve
              </div>
              <div className={styles.overlay}>Em breve</div>
            </div>
          ))
        ) : (
          fotos.map((f, i) => (
            <div key={i} className={styles.card}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.src} alt={f.legenda} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div className={styles.overlay}>{f.legenda || 'Ver foto'}</div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
