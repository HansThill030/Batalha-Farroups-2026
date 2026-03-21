'use client'
import { useEffect, useState, useCallback } from 'react'
import styles from './batalha.module.css'

interface Tarefa {
  id: string
  numero: string
  tipo: 'teorica' | 'pratica'
  titulo: string
  descricao: string
  imagem?: string
  duracaoSeg: number
  status: 'aguardando' | 'ativa' | 'encerrada'
  lancadaEm?: number
}

interface Resposta {
  turma: string
  texto: string
  imagem?: string
  enviadaEm: number
  status: 'pendente' | 'correta' | 'incorreta'
}

const TURMAS = ['9A','9B','9C','9D','9E','9F']
const COR_TURMA: Record<string,string> = {
  '9A':'#e02020','9B':'#1a3fa8','9C':'#16a34a',
  '9D':'#d97706','9E':'#7c3aed','9F':'#0891b2',
}

export default function Batalha() {
  const [tarefa,    setTarefa]    = useState<Tarefa|null>(null)
  const [respostas, setRespostas] = useState<Resposta[]>([])
  const [tempoRestante, setTempo] = useState(0)
  const [mounted,   setMounted]   = useState(false)
  const [modoTelao, setModoTelao] = useState(false)

  const carregar = useCallback(() => {
    try {
      const t = localStorage.getItem('bdf_tarefa_ativa')
      if (t) setTarefa(JSON.parse(t))
      const r = localStorage.getItem('bdf_respostas')
      if (r) setRespostas(JSON.parse(r))
    } catch {}
  }, [])

  useEffect(() => {
    setMounted(true)
    carregar()
    // Polling a cada 3s para atualizar respostas em tempo real
    const interval = setInterval(carregar, 3000)
    return () => clearInterval(interval)
  }, [carregar])

  // Cronômetro
  useEffect(() => {
    if (!tarefa || tarefa.status !== 'ativa' || !tarefa.lancadaEm) return
    const tick = () => {
      const elapsed = Math.floor((Date.now() - tarefa.lancadaEm!) / 1000)
      const restante = Math.max(0, tarefa.duracaoSeg - elapsed)
      setTempo(restante)
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [tarefa])

  const respostasOrdenadas = [...respostas].sort((a,b) => a.enviadaEm - b.enviadaEm)
  const pct = tarefa ? (tempoRestante / tarefa.duracaoSeg) * 100 : 100
  const urgente = tempoRestante <= 30 && tempoRestante > 0
  const acabou  = tarefa?.status === 'ativa' && tempoRestante === 0

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  if (!mounted) return null

  // ── MODO TELÃO (fullscreen, sem distrações)
  if (modoTelao) return (
    <div className={styles.telao} onClick={() => setModoTelao(false)}>
      <div className={styles.telaoInner}>
        {!tarefa || tarefa.status === 'aguardando' ? (
          <div className={styles.aguardando}>
            <div className={styles.aguardandoIcon}>⚔️</div>
            <div className={styles.aguardandoText}>Aguardando próxima tarefa...</div>
          </div>
        ) : (
          <>
            <div className={styles.telaoHeader}>
              <span className={`${styles.talaoBadge} ${tarefa.tipo === 'pratica' ? styles.pratica : styles.teorica}`}>
                {tarefa.tipo === 'pratica' ? 'Prática' : 'Teórica'} #{tarefa.numero}
              </span>
              {tarefa.status === 'ativa' && (
                <div className={`${styles.telaoTimer} ${urgente ? styles.urgente : ''} ${acabou ? styles.acabou : ''}`}>
                  {acabou ? 'TEMPO ESGOTADO' : fmt(tempoRestante)}
                </div>
              )}
              {tarefa.status === 'encerrada' && <div className={styles.encerradaBadge}>ENCERRADA</div>}
            </div>
            <h1 className={styles.telaoTitulo}>{tarefa.titulo}</h1>
            {tarefa.descricao && <p className={styles.telaoDesc}>{tarefa.descricao}</p>}
            {tarefa.imagem && <img src={tarefa.imagem} alt="Tarefa" className={styles.telaoImagem} />}
            {tarefa.status === 'ativa' && (
              <div className={styles.timerBarWrap}>
                <div className={`${styles.timerBar} ${urgente ? styles.timerBarUrgente : ''}`}
                  style={{ width: `${pct}%` }} />
              </div>
            )}
          </>
        )}
      </div>
      <p className={styles.telaoHint}>Clique para sair do modo telão</p>
    </div>
  )

  // ── MODO NORMAL (com painel de respostas)
  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.topTitle}>⚔️ Batalha Noturna — Telão</div>
        <button className={styles.telaoBtn} onClick={() => setModoTelao(true)}>
          ⛶ Modo Telão
        </button>
      </div>

      <div className={styles.layout}>
        {/* TAREFA */}
        <div className={styles.tarefaBox}>
          {!tarefa || tarefa.status === 'aguardando' ? (
            <div className={styles.aguardando}>
              <div className={styles.aguardandoIcon}>⚔️</div>
              <div className={styles.aguardandoText}>Aguardando próxima tarefa...</div>
            </div>
          ) : (
            <>
              <div className={styles.tarefaHeader}>
                <span className={`${styles.badge} ${tarefa.tipo==='pratica'?styles.pratica:styles.teorica}`}>
                  {tarefa.tipo==='pratica'?'Prática':'Teórica'} #{tarefa.numero}
                </span>
                {tarefa.status==='ativa' && (
                  <div className={`${styles.timer} ${urgente?styles.urgente:''} ${acabou?styles.acabou:''}`}>
                    {acabou ? '⏰ TEMPO!' : fmt(tempoRestante)}
                  </div>
                )}
                {tarefa.status==='encerrada' && <span className={styles.encerradaBadge}>ENCERRADA</span>}
              </div>
              <h2 className={styles.tarefaTitulo}>{tarefa.titulo}</h2>
              {tarefa.descricao && <p className={styles.tarefaDesc}>{tarefa.descricao}</p>}
              {tarefa.imagem && <img src={tarefa.imagem} alt="" className={styles.tarefaImg} />}
              {tarefa.status==='ativa' && (
                <div className={styles.timerBarWrap}>
                  <div className={`${styles.timerBar} ${urgente?styles.timerBarUrgente:''}`}
                    style={{width:`${pct}%`}} />
                </div>
              )}
            </>
          )}
        </div>

        {/* RESPOSTAS */}
        <div className={styles.respostasBox}>
          <div className={styles.respostasTitle}>
            Respostas ({respostasOrdenadas.length})
            <span className={styles.turmasAusentes}>
              {TURMAS.filter(t => !respostas.find(r => r.turma===t)).map(t => (
                <span key={t} className={styles.turmaFaltando} style={{background: COR_TURMA[t]+'22', color: COR_TURMA[t]}}>
                  {t}
                </span>
              ))}
            </span>
          </div>
          <div className={styles.respostasList}>
            {respostasOrdenadas.length === 0 ? (
              <p className={styles.semRespostas}>Nenhuma resposta ainda...</p>
            ) : (
              respostasOrdenadas.map((r, i) => (
                <div key={i} className={`${styles.respostaCard} ${styles['resp_'+r.status]}`}>
                  <div className={styles.respostaTop}>
                    <div className={styles.respostaTurma} style={{background: COR_TURMA[r.turma]+'33', color: COR_TURMA[r.turma]}}>
                      {i+1}º · {r.turma}
                    </div>
                    <div className={styles.respostaHora}>
                      {new Date(r.enviadaEm).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
                    </div>
                  </div>
                  {r.texto && <p className={styles.respostaTexto}>{r.texto}</p>}
                  {r.imagem && <img src={r.imagem} alt="" className={styles.respostaImg} />}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
