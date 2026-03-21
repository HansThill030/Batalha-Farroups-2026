'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import styles from './responder.module.css'

interface TarefaBatalha {
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

export default function Responder() {
  const router = useRouter()
  const [mounted,   setMounted]   = useState(false)
  const [turma,     setTurma]     = useState('')
  const [label,     setLabel]     = useState('')
  const [cor,       setCor]       = useState('#888')
  const [tarefa,    setTarefa]    = useState<TarefaBatalha | null>(null)
  const [respostas, setRespostas] = useState<Resposta[]>([])
  const [texto,     setTexto]     = useState('')
  const [imagem,    setImagem]    = useState<string | null>(null)
  const [enviado,   setEnviado]   = useState(false)
  const [tempoRest, setTempoRest] = useState(0)
  const [erro,      setErro]      = useState('')
  const [enviando,  setEnviando]  = useState(false)

  const carregar = useCallback(() => {
    try {
      const t = localStorage.getItem('bdf_tarefa_ativa')
      if (t) {
        const parsed: TarefaBatalha = JSON.parse(t)
        setTarefa(parsed)
      } else {
        setTarefa(null)
      }
      const r = localStorage.getItem('bdf_respostas')
      if (r) setRespostas(JSON.parse(r))
    } catch {}
  }, [])

  useEffect(() => {
    setMounted(true)
    const t = sessionStorage.getItem('turma_auth')
    const l = sessionStorage.getItem('turma_label')
    const c = sessionStorage.getItem('turma_cor')
    if (!t || !l) { router.push('/turma'); return }
    setTurma(t)
    setLabel(l)
    setCor(c || '#888')
    carregar()
    const iv = setInterval(carregar, 3000)
    return () => clearInterval(iv)
  }, [carregar, router])

  // Reset enviado quando tarefa muda
  useEffect(() => {
    if (tarefa?.id) setEnviado(false)
  }, [tarefa?.id])

  // Cronômetro
  useEffect(() => {
    if (!tarefa || tarefa.status !== 'ativa' || !tarefa.lancadaEm) return
    const tick = () => {
      const elapsed = Math.floor((Date.now() - tarefa.lancadaEm!) / 1000)
      setTempoRest(Math.max(0, tarefa.duracaoSeg - elapsed))
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [tarefa])

  const jaRespondeu = respostas.some(r => r.turma === label)
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const pct = tarefa ? (tempoRest / tarefa.duracaoSeg) * 100 : 100
  const urgente = tempoRest <= 30 && tempoRest > 0

  function handleImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) { setErro('Imagem muito grande! Máx 3MB.'); return }
    const reader = new FileReader()
    reader.onload = ev => setImagem(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function enviar() {
    if (!texto.trim() && !imagem) { setErro('Escreva uma resposta ou envie uma imagem.'); return }
    if (jaRespondeu || enviado) { setErro('Sua turma já respondeu esta tarefa.'); return }
    if (tarefa?.status !== 'ativa') { setErro('Esta tarefa não está mais ativa.'); return }
    setEnviando(true)
    try {
      const nova: Resposta = {
        turma: label,
        texto,
        imagem: imagem || undefined,
        enviadaEm: Date.now(),
        status: 'pendente',
      }
      const atuais: Resposta[] = JSON.parse(localStorage.getItem('bdf_respostas') || '[]')
      if (!atuais.find(r => r.turma === label)) {
        localStorage.setItem('bdf_respostas', JSON.stringify([...atuais, nova]))
      }
      setEnviado(true)
      setTexto('')
      setImagem(null)
    } catch {
      setErro('Erro ao enviar. Tente novamente.')
    }
    setEnviando(false)
  }

  function sair() {
    sessionStorage.removeItem('turma_auth')
    sessionStorage.removeItem('turma_label')
    sessionStorage.removeItem('turma_cor')
    router.push('/turma')
  }

  if (!mounted) return null

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header} style={{ borderBottomColor: cor }}>
        <div className={styles.headerLeft}>
          <div className={styles.turmaTag} style={{ background: cor + '22', color: cor }}>
            Turma {label}
          </div>
          <span className={styles.headerSub}>Batalha dos Farroups 2026</span>
        </div>
        <div className={styles.headerRight}>
          {tarefa?.status === 'ativa' && (
            <div className={`${styles.timer} ${urgente ? styles.urgente : ''}`} style={{ color: cor }}>
              {fmt(tempoRest)}
            </div>
          )}
          <button className={styles.sairBtn} onClick={sair}>Sair</button>
        </div>
      </div>

      {/* Barra de tempo */}
      {tarefa?.status === 'ativa' && (
        <div className={styles.timerBarWrap}>
          <div className={styles.timerBar}
            style={{ width: `${pct}%`, background: cor, opacity: urgente ? 1 : 0.7 }} />
        </div>
      )}

      <div className={styles.content}>
        {/* Aguardando */}
        {(!tarefa || tarefa.status === 'aguardando') && (
          <div className={styles.estado}>
            <div className={styles.estadoIcon}>⚔️</div>
            <h2>Aguardando a próxima tarefa</h2>
            <p>O professor ainda não lançou nenhuma tarefa. Fique atento!</p>
          </div>
        )}

        {/* Tarefa ativa */}
        {tarefa?.status === 'ativa' && (
          <>
            {/* Enunciado */}
            <div className={styles.tarefaCard}>
              <div className={styles.tarefaMeta}>
                <span className={`${styles.tipoBadge} ${tarefa.tipo === 'pratica' ? styles.pratica : styles.teorica}`}>
                  {tarefa.tipo === 'pratica' ? 'Prática' : 'Teórica'}
                </span>
                <span className={styles.tarefaNum}>Tarefa #{tarefa.numero}</span>
              </div>
              <h2 className={styles.tarefaTitulo}>{tarefa.titulo}</h2>
              {tarefa.descricao && <p className={styles.tarefaDesc}>{tarefa.descricao}</p>}
              {tarefa.imagem && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tarefa.imagem} alt="" className={styles.tarefaImg} />
              )}
            </div>

            {/* Resposta */}
            {jaRespondeu || enviado ? (
              <div className={styles.enviado}>
                <div className={styles.enviadoIcon} style={{ color: cor }}>✓</div>
                <h3>Resposta enviada!</h3>
                <p>Aguarde a correção. O resultado aparecerá no placar.</p>
              </div>
            ) : tempoRest === 0 ? (
              <div className={styles.estado}>
                <div className={styles.estadoIcon}>⏰</div>
                <h2>Tempo esgotado</h2>
              </div>
            ) : (
              <div className={styles.formCard}>
                <h3 className={styles.formTitle}>Resposta da Turma {label}</h3>
                <div className={styles.field}>
                  <label>Resposta</label>
                  <textarea
                    placeholder="Digite a resposta aqui..."
                    value={texto}
                    onChange={e => { setTexto(e.target.value); setErro('') }}
                    rows={4}
                  />
                </div>
                <p className={styles.ouLabel}>— ou envie uma imagem —</p>
                <div className={styles.field}>
                  <label>Foto / Imagem (máx 3MB)</label>
                  <input type="file" accept="image/*" onChange={handleImagem} className={styles.fileInput} />
                </div>
                {imagem && (
                  <div className={styles.preview}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagem} alt="preview" />
                    <button onClick={() => setImagem(null)}>× Remover imagem</button>
                  </div>
                )}
                {erro && <p className={styles.erro}>{erro}</p>}
                <button
                  className={styles.enviarBtn}
                  style={{ background: cor }}
                  onClick={enviar}
                  disabled={enviando}
                >
                  {enviando ? 'Enviando...' : `✓ Enviar Resposta`}
                </button>
                <p className={styles.aviso}>⚠️ Apenas uma resposta por tarefa é permitida.</p>
              </div>
            )}
          </>
        )}

        {/* Encerrada */}
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
