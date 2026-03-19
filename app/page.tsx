import Link from 'next/link'
import styles from './page.module.css'

const ultimosAvisos = [
  {
    dia: '18', mes: 'MAR', ano: '2026',
    tag: 'Oficial',
    titulo: 'Bem-vindos à Batalha dos Farroups 2026!',
    texto: 'O site oficial da competição está no ar. Em breve as primeiras tarefas serão publicadas. Fiquem atentos!',
  },
  {
    dia: '18', mes: 'MAR', ano: '2026',
    tag: 'Regras',
    titulo: 'Sistema de Pontuação',
    texto: '1º correto: 1000 pts · 2º correto: 700 pts · 3º correto: 500 pts · Demais corretos: 300 pts',
  },
]

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroLines} />
        <div className={styles.heroContent}>
          <div className={styles.heroTag}>Edição 2026 · Nono Ano</div>
          <h1 className={styles.heroTitle}>
            Batalha<br />dos<br />
            <span className={styles.accent}>Far</span>
            <span className={styles.accentGreen}>roups</span>
          </h1>
          <p className={styles.heroDesc}>
            A competição que coloca à prova o conhecimento, a criatividade e o espírito de equipe dos alunos do nono ano.
          </p>
          <div className={styles.heroBtns}>
            <Link href="/tarefas" className="btn-primary">Ver Tarefas</Link>
            <Link href="/placar" className="btn-secondary">Placar Atual</Link>
          </div>
        </div>
        <div className={styles.heroNumber}>26</div>
      </section>

      {/* STATS */}
      <div className={styles.statsBar}>
        {[
          { num: '55+', label: 'Tarefas Teóricas' },
          { num: '15+', label: 'Desafios Práticos' },
          { num: '1000', label: 'Pontos p/ 1º Lugar' },
          { num: '2026', label: 'Nova Edição' },
        ].map((s) => (
          <div key={s.label} className={styles.statItem}>
            <span className={styles.statNum}>{s.num}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ÚLTIMOS AVISOS */}
      <section className={styles.homeSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Últimos Avisos</h2>
          <span className={styles.sectionTag}>Atualizações recentes</span>
        </div>
        <div className={styles.avisosList}>
          {ultimosAvisos.map((a, i) => (
            <div key={i} className={styles.avisoItem}>
              <div className={styles.avisoData}>
                <span className={styles.avisoDia}>{a.dia}</span>
                {a.mes}<br />{a.ano}
              </div>
              <div>
                <span className={styles.avisoTag}>{a.tag}</span>
                <div className={styles.avisoTitulo}>{a.titulo}</div>
                <div className={styles.avisoTexto}>{a.texto}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
