import styles from './placar.module.css'

const equipes = [
  { pos: 1, nome: 'Equipe Ouro',     cor: '#fbbf24', pts: 4200, pct: 100 },
  { pos: 2, nome: 'Equipe Prata',    cor: '#d1d5db', pts: 3850, pct: 91  },
  { pos: 3, nome: 'Equipe Bronze',   cor: '#cd7f32', pts: 3300, pct: 78  },
  { pos: 4, nome: 'Equipe Azul',     cor: '#2952cc', pts: 2900, pct: 69  },
  { pos: 5, nome: 'Equipe Vermelha', cor: '#e02020', pts: 2400, pct: 57  },
]

export default function Placar() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Placar Geral</h1>
        <p className="page-sub">Classificação atualizada pelos professores</p>
      </div>
      <div className={styles.list}>
        {equipes.map((e, i) => (
          <div key={e.pos} className={`${styles.card} ${styles[`rank${i+1}`]}`}>
            <div className={styles.pos}>{e.pos}</div>
            <div className={styles.dot} style={{ background: e.cor }} />
            <div className={styles.nome}>{e.nome}</div>
            <div className={styles.barWrap}><div className={styles.bar} style={{ width: `${e.pct}%` }} /></div>
            <div className={styles.pts}>{e.pts.toLocaleString('pt-BR')} pts</div>
          </div>
        ))}
      </div>
    </>
  )
}
