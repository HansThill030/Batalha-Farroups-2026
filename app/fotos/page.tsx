import styles from './fotos.module.css'

export default function Fotos() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Galeria de Fotos</h1>
        <p className="page-sub">Momentos da Batalha dos Farroups 2026</p>
      </div>
      <div className={styles.grid}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.placeholder}>Foto {String(i + 1).padStart(2, '0')}<br />Em breve</div>
            <div className={styles.overlay}>Ver foto</div>
          </div>
        ))}
      </div>
    </>
  )
}
