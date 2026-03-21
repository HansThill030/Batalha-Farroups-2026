import styles from './placar.module.css'

interface Equipe {
  pos: number
  nome: string
  cor: string
  pts: number
}

async function getPlacar(): Promise<Equipe[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/placar`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) throw new Error('Falha')
    return res.json()
  } catch {
    return [
      { pos: 1, nome: 'Equipe Ouro',     cor: '#fbbf24', pts: 4200 },
      { pos: 2, nome: 'Equipe Prata',    cor: '#d1d5db', pts: 3850 },
      { pos: 3, nome: 'Equipe Bronze',   cor: '#cd7f32', pts: 3300 },
      { pos: 4, nome: 'Equipe Azul',     cor: '#2952cc', pts: 2900 },
      { pos: 5, nome: 'Equipe Vermelha', cor: '#e02020', pts: 2400 },
    ]
  }
}

export default async function Placar() {
  const equipes = await getPlacar()
  const max = equipes[0]?.pts || 1

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Placar Geral</h1>
        <p className="page-sub">Atualizado via Google Sheets · sincroniza a cada 60 segundos</p>
      </div>
      <div className={styles.list}>
        {equipes.map((e, i) => (
          <div key={e.pos} className={`${styles.card} ${styles[`rank${Math.min(i+1,3)}`]}`}>
            <div className={styles.pos}>{e.pos}</div>
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
