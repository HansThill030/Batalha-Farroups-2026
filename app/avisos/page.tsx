import styles from './avisos.module.css'

const avisos = [
  { dia: '18', mes: 'MAR', ano: '2026', tag: 'Oficial', titulo: 'Site da Batalha dos Farroups 2026 no Ar!', texto: 'O site oficial foi lançado. Aqui você encontrará todas as tarefas, placar, avisos e fotos da edição 2026. Boa sorte a todos!' },
  { dia: '18', mes: 'MAR', ano: '2026', tag: 'Regras', titulo: 'Sistema de Pontuação 2026', texto: 'As regras de pontuação seguem o padrão da edição anterior: teóricas valem até 1000 pts e práticas até 2000, distribuídos por ordem de entrega correta.' },
  { dia: '18', mes: 'MAR', ano: '2026', tag: 'Prazo', titulo: 'Prazo de Entrega das Tarefas', texto: 'Todas as tarefas devem ser enviadas para o e-mail oficial até às 00h do dia seguinte à publicação, salvo aviso contrário.' },
]

export default function Avisos() {
  return (
    <>
      <div className="page-header" style={{ marginTop: 64 }}>
        <h1 className="page-title">
          Avisos <span className="accent-green">Oficiais</span>
        </h1>
        <p className="page-subtitle">Comunicados e atualizações da organização</p>
      </div>

      <div className={styles.list}>
        {avisos.map((a, i) => (
          <div key={i} className={styles.item}>
            <div className={styles.data}>
              <span className={styles.dia}>{a.dia}</span>
              {a.mes}<br />{a.ano}
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
