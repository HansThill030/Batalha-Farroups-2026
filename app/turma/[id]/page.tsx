'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import styles from './turma.module.css'

const TURMAS_VALIDAS = ['9a','9b','9c','9d','9e','9f']
const COR_TURMA: Record<string,string> = {
  '9a':'#e02020','9b':'#1a3fa8','9c':'#16a34a',
  '9d':'#d97706','9e':'#7c3aed','9f':'#0891b2',
}

interface Tarefa {
  id: string; numero: string; tipo: string; titulo: string
  descricao: string; imagem?: string; duracaoSeg: number
  status: 'aguardando'|'ativa'|'encerrada'; lancadaEm?: number
}
interface Resposta {
  turma: string; texto: string; imagem?: string
  enviadaEm: number; status: 'pendente'|'correta'|'incorreta'
}

export default function TurmaPage() {
  const { id } = useParams<{id:string}>()
  const turmaId = (id||'').toLowerCase()
  const turmaLabel = turmaId.toUpperCase()
  const cor = COR_TURMA[turmaId] || '#888'

  const [mounted,    setMounted]    = useState(false)
  const [tarefa,     setTarefa]     = useState<Tarefa|null>(null)
  const [respostas,  setRespostas]  = useState<Resposta[]>([])
  const [texto,      setTexto]      = useState('')
  const [imagem,     setImagem]     = useState<string|null>(null)
  const [enviado,    setEnviado]    = useState(false)
  const [tempoRest,  setTempoRest]  = useState(0)
  const [erro,       setErro]       = useState('')
  const [enviando,   setEnviando]   = useState(false)

  const jaRespondeu = respostas.some(r => r.turma === turmaLabel)

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
    const iv = setInterval(carregar, 3000)
    return () => clearInterval(iv)
  }, [carregar])

  useEffect(() => {
    if (!tarefa || tarefa.status !== 'ativa' || !tarefa.lancadaEm) return
    const tick = () => {
      const elapsed = Math.floor((Date.now() - tarefa.lancadaEm!) / 1000)
      setTempoRest(Math.max(0, tarefa.duracaoSeg - elapsed))
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [tarefa])

  function handleImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3*1024*1024) { setErro('Imagem muito grande! Máx 3MB.'); return }
    const reader = new FileReader()
    reader.onload = ev => setImagem(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function enviar() {
    if (!texto.trim() && !imagem) { setErro('Escreva uma resposta ou envie uma imagem.'); return }
    if (jaRespondeu) { setErro('Sua turma já respondeu esta tarefa.'); return }
    if (tarefa?.status !== 'ativa') { setErro('Esta tarefa não está ativa.'); return }
    setEnviando(true)
    try {
      const novaResp: Resposta = {
        turma: turmaLabel, texto, imagem: imagem||undefined,
        enviadaEm: Date.now(), status: 'pendente',
      }
      const atual = JSON.parse(localStorage.getItem('bdf_respostas')||'[]') as Resposta[]
      // evitar duplicata
      if (!atual.find(r => r.turma===turmaLabel)) {
        localStorage.setItem('bdf_respostas', JSON.stringify([...atual, novaResp]))
      }
      setEnviado(true)
    } catch {
      setErro('Erro ao enviar. Tente novamente.')
    }
    setEnviando(false)
  }

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const pct = tarefa ? (tempoRest / tarefa.duracaoSeg)*100 : 100
  const urgente = tempoRest <= 30 && tempoRest > 0

  if (!mounted) return null

  if (!TURMAS_VALIDAS.includes(turmaId)) {
    return (
      <div className={styles.erro404}>
        <h1>Turma não encontrada</h1>
        <p>URLs válidas: /turma/9a · /turma/9b · ... · /turma/9f</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Header da turma */}
      <div className={styles.header} style={{ borderColor: cor }}>
        <div className={styles.headerLeft}>
          <div className={styles.turmaTag} style={{ background: cor+'22', color: cor }}>
            Turma {turmaLabel}
          </div>
          <div className={styles.headerTitle}>Batalha dos Farroups 2026</div>
        </div>
        {tarefa?.status === 'ativa' && (
          <div className={`${styles.timer} ${urgente ? styles.urgente : ''}`} style={{ color: cor }}>
            {fmt(tempoRest)}
          </div>
        )}
      </div>

      {/* Barra de progresso do timer */}
      {tarefa?.status === 'ativa' && (
        <div className={styles.timerBarWrap}>
          <div className={`${styles.timerBar} ${urgente?styles.timerBarUrgente:''}`}
            style={{ width:`${pct}%`, background: cor }} />
        </div>
      )}

      <div className={styles.content}>
        {/* Estado: aguardando */}
        {(!tarefa || tarefa.status === 'aguardando') && (
          <div className={styles.estado}>
            <div className={styles.estadoIcon}>⚔️</div>
            <h2>Aguardando próxima tarefa</h2>
            <p>Fique atento! A próxima tarefa aparecerá aqui automaticamente.</p>
          </div>
        )}

        {/* Estado: tarefa ativa */}
        {tarefa?.status === 'ativa' && (
          <>
            <div className={styles.tarefaBox}>
              <div className={styles.tarefaMeta}>
                <span className={`${styles.tipoBadge} ${tarefa.tipo==='pratica'?styles.praticaBadge:styles.teoricaBadge}`}>
                  {tarefa.tipo==='pratica'?'Prática':'Teórica'}
                </span>
                <span className={styles.tarefaNum}>Tarefa #{tarefa.numero}</span>
              </div>
              <h2 className={styles.tarefaTitulo}>{tarefa.titulo}</h2>
              {tarefa.descricao && <p className={styles.tarefaDesc}>{tarefa.descricao}</p>}
              {tarefa.imagem && <img src={tarefa.imagem} alt="" className={styles.tarefaImg} />}
            </div>

            {/* Formulário de resposta */}
            {jaRespondeu || enviado ? (
              <div className={styles.enviado}>
                <div className={styles.enviadoIcon}>✓</div>
                <h3>Resposta enviada!</h3>
                <p>Aguarde a correção do professor. O resultado aparecerá no placar.</p>
              </div>
            ) : tempoRest === 0 ? (
              <div className={styles.tempoEsgotado}>
                <div className={styles.estadoIcon}>⏰</div>
                <h3>Tempo esgotado</h3>
                <p>O tempo para esta tarefa acabou.</p>
              </div>
            ) : (
              <div className={styles.formBox}>
                <h3 className={styles.formTitle}>Resposta da Turma {turmaLabel}</h3>

                <div className={styles.field}>
                  <label>Resposta (texto)</label>
                  <textarea
                    placeholder="Digite a resposta aqui..."
                    value={texto}
                    onChange={e => { setTexto(e.target.value); setErro('') }}
                    rows={4}
                  />
                </div>

                <div className={styles.fieldOr}>— ou envie uma imagem —</div>

                <div className={styles.field}>
                  <label>Foto / Imagem (máx 3MB)</label>
                  <input type="file" accept="image/*" onChange={handleImagem} className={styles.fileInput}/>
                </div>

                {imagem && (
                  <div className={styles.previewWrap}>
                    <img src={imagem} alt="preview" className={styles.preview}/>
                    <button className={styles.removeImg} onClick={() => setImagem(null)}>× Remover</button>
                  </div>
                )}

                {erro && <p className={styles.erro}>{erro}</p>}

                <button
                  className={styles.enviarBtn}
                  style={{ background: cor }}
                  onClick={enviar}
                  disabled={enviando}
                >
                  {enviando ? 'Enviando...' : `Enviar Resposta da Turma ${turmaLabel}`}
                </button>

                <p className={styles.avisoUnico}>⚠️ Apenas uma resposta por tarefa é permitida.</p>
              </div>
            )}
          </>
        )}

        {/* Estado: encerrada */}
        {tarefa?.status === 'encerrada' && (
          <div className={styles.estado}>
            <div className={styles.estadoIcon}>🏁</div>
            <h2>Tarefa encerrada</h2>
            <p>Aguardando a próxima tarefa...</p>
          </div>
        )}
      </div>
    </div>
  )
}
