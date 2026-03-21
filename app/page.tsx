import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.css'

const avisos = [
  { tag: 'Oficial', data: '18 Mar 2026', titulo: 'Bem-vindos à Batalha dos Farroups 2026!', texto: 'O site oficial está no ar. Em breve as primeiras tarefas serão publicadas.' },
  { tag: 'Regras',  data: '18 Mar 2026', titulo: 'Sistema de Pontuação 2026', texto: '1º correto: 1000 pts · 2º: 700 pts · 3º: 500 pts · Demais: 300 pts' },
]

export default function Home() {
  return (
    <>
      <section className={styles.hero}>
        {/* Glass overlay suaviza os blobs */}
        <div className={styles.heroGlass} />

        <div className={styles.content}>
          <Image
            src="/logo-full.png"
            alt="Batalha dos Farroups"
            width={440}
            height={350}
            className={styles.logoFull}
            priority
          />
          <p className={styles.year}>Edição 2026 · Nono Ano</p>
          <p className={styles.desc}>
            A competição que coloca à prova o conhecimento, a criatividade e o espírito de equipe dos alunos do nono ano.
          </p>
          <div className={styles.btns}>
            <Link href="/tarefas" className="btn-primary">Ver Tarefas</Link>
            <Link href="/placar" className="btn-ghost">Placar Atual</Link>
          </div>
        </div>
      </section>

      <div className={styles.stats}>
        {[
          { num: '55+',  label: 'Tarefas Teóricas' },
          { num: '15+',  label: 'Desafios Práticos' },
          { num: '1000', label: 'Pts para o 1º'    },
          { num: '2026', label: 'Nova Edição'       },
        ].map(s => (
          <div key={s.label} className={styles.stat}>
            <span className={styles.statNum}>{s.num}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      <section className={styles.section}>
        <div className={styles.secTitle}>Últimos Avisos</div>
        {avisos.map((a, i) => (
          <div key={i} className={styles.avisoRow}>
            <div className={styles.avisoDate}>{a.data}</div>
            <div>
              <span className={styles.avisoTag}>{a.tag}</span>
              <div className={styles.avisoTitle}>{a.titulo}</div>
              <div className={styles.avisoText}>{a.texto}</div>
            </div>
          </div>
        ))}
      </section>
    </>
  )
}
