import styles from './placar.module.css'

const equipes = [
  { pos: 1, nome: 'Equipe Ouro', cor: '#f5c800', pts: 4200, pct: 100 },
  { pos: 2, nome: 'Equipe Prata', cor: '#aaaaaa', pts: 3850, pct: 91 },
  { pos: 3, nome: 'Equipe Bronze', cor: '#cd7f32', pts: 3300, pct: 78 },
  { pos: 4, nome: 'Equipe Verde', cor: '#2d9e58', pts: 2900, pct: 69 },
  { pos: 5, nome: 'Equipe Vermelha', cor: '#e74c3c', pts: 2400, pct: 57 },
]

const medalClass: Record<number, string> = { 1: 'gold', 2: 'silver', 3: 'bronze' }

export default function Placar() {
  return (
    <>
      <div className="page-header" style={{ marginTop: 64 }}>
        <h1 className="page-title">
          Placar <span className="accent">Geral</span>
        </h1>
        <p className="page-subtitle">Classificação atualizada pelos professores</p>
      </div>

      <div className={styles.grid}>
        {equipes.map((e) => (
          <div key={e.pos} className={`${styles.card} ${styles[medalClass[e.pos] ?? '']}`}>
            <div className={styles.pos}>{e.pos}</div>
            <div className={styles.dot} style={{ background: e.cor }} />
            <div className={styles.nome}>{e.nome}</div>
            <div className={styles.pts}>{e.pts.toLocaleString('pt-BR')} pts</div>
            <div className={styles.barWrap}>
              <div className={styles.bar} style={{ width: `${e.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
