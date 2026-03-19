import styles from './tarefas.module.css'

const tarefas = [
  { tipo: 'pratica', num: '01', titulo: 'Desafio de Embaixadinhas', desc: 'Grave um vídeo com a maior quantidade de embaixadinhas consecutivas e envie pelo link oficial.', pts: '2000 / 1400 / 1000', status: 'aberta' },
  { tipo: 'teorica', num: '01', titulo: 'Questão Teórica 01', desc: 'Primeira questão teórica da edição 2026. Responda por e-mail até o prazo informado.', pts: '1000 / 700 / 500', status: 'aberta' },
  { tipo: 'teorica', num: '02', titulo: 'Questão Teórica 02', desc: 'Segunda questão teórica. Fique atento ao prazo publicado no aviso oficial.', pts: '1000 / 700 / 500', status: 'encerrada' },
  { tipo: 'teorica', num: '03', titulo: 'Em breve...', desc: 'Esta tarefa ainda não foi publicada.', pts: '—', status: 'pendente' },
]

export default function Tarefas() {
  return (
    <>
      <div className="page-header" style={{ marginTop: 64 }}>
        <h1 className="page-title">
          Tarefas <span className="accent-green">&amp; Desafios</span>
        </h1>
        <p className="page-subtitle">Teóricas e práticas — ganhe pontos sendo o primeiro a acertar</p>
      </div>

      <div className={styles.grid}>
        {tarefas.map((t, i) => (
          <div key={i} className={`${styles.card} ${t.status === 'pendente' ? styles.pendente : ''}`}>
            <span className={`${styles.tipo} ${styles[t.tipo]}`}>{t.tipo === 'pratica' ? 'Prática' : 'Teórica'}</span>
            <div className={styles.num}>{t.num}</div>
            <div className={styles.titulo}>{t.titulo}</div>
            <div className={styles.desc}>{t.desc}</div>
            {t.status !== 'pendente' && (
              <div className={styles.pts}>
                1º: <span>{t.pts.split('/')[0]?.trim()} pts</span>{' '}
                · 2º: <span>{t.pts.split('/')[1]?.trim()} pts</span>{' '}
                · 3º: <span>{t.pts.split('/')[2]?.trim()} pts</span>
              </div>
            )}
            {t.status !== 'pendente' && (
              <span className={`${styles.badge} ${styles[t.status]}`}>
                {t.status === 'aberta' ? 'Aberta' : 'Encerrada'}
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
