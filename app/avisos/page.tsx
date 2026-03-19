import styles from './avisos.module.css'

const avisos = [
  { dia: '18', mes: 'MAR', ano: '2026', tag: 'Oficial', titulo: 'Site da Batalha no Ar!', texto: 'O site oficial foi lançado. Aqui você encontrará todas as tarefas, placar, avisos e fotos.' },
  { dia: '18', mes: 'MAR', ano: '2026', tag: 'Regras', titulo: 'Pontuação 2026', texto: 'Teóricas valem até 1000 pts e práticas até 2000, distribuídos por ordem de entrega correta.' },
  { dia: '18', mes: 'MAR', ano: '2026', tag: 'Prazo', titulo: 'Prazo de Entrega', texto: 'Envie para o e-mail oficial até às 00h do dia seguinte à publicação.' },
]

export default function Avisos() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Avisos Oficiais</h1>
        <p className="page-sub">Comunicados e atualizações da organização</p>
      </div>
      <div className={styles.list}>
        {avisos.map((a, i) => (
          <div key={i} className={styles.item}>
            <div className={styles.date}>
              <span className={styles.day}>{a.dia}</span>
              <span className={styles.month}>{a.mes} {a.ano}</span>
            </div>
            <div>
              <span className={styles.tag}>{a.tag}</span>
              <div className={styles.titulo}>{a.titulo}</div>
              <div className={styles.texto}>{a.texto}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
