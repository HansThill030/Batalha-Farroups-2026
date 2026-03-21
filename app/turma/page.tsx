'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import styles from './turma.module.css'

interface Tarefa {
  id: string; tipo: string; num: string; titulo: string
  desc: string; pts1: number; status: string; timer: number
}
interface Resposta {
  tarefaId: string; turma: string; status: string
}

export default function TurmaPage() {
  const router = useRouter()
  const [turma,     setTurma]     = useState('')
  const [cor,       setCor]       = useState('#888')
  const [mounted,   setMounted]   = useState(false)
  const [tarefas,   setTarefas]   = useState<Tarefa[]>([])
  const [respostas, setRespostas] = useState<Resposta[]>([])
  const [textos,    setTextos]    = useState<Record<string,string>>({})
  const [enviando,  setEnviando]  = useState<Record<string,boolean>>({})
  const [erros,     setErros]     = useState<Record<string,string>>({})
  const [enviados,  setEnviados]  = useState<Record<string,boolean>>({})
  const [loading,   setLoading]   = useState(true)

  const carregar = useCallback(async () => {
    try {
      const [tRes, rRes] = await Promise.all([
        fetch('/api/tarefas'),
        fetch('/api/respostas'),
      ])
      const [tData, rData] = await Promise.all([tRes.json(), rRes.json()])
      if (Array.isArray(tData)) setTarefas(tData.filter((t: Tarefa) => t.status === 'aberta'))
      if (Array.isArray(rData)) setRespostas(rData)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    setMounted(true)
    const t = sessionStorage.getItem('bdf_turma')
    const c = sessionStorage.getItem('bdf_cor')
    if (!t || t === 'professor') { router.push('/turma-login'); return }
    setTurma(t); setCor(c || '#888')
    carregar()
    const iv = setInterval(carregar, 10000)
    return () => clearInterval(iv)
  }, [router, carregar])

  function jaRespondeu(tarefaId: string) {
    return respostas.some(r => r.tarefaId === tarefaId && r.turma === turma) || enviados[tarefaId]
  }

  async function enviar(tarefa: Tarefa) {
    const texto = textos[tarefa.id] || ''
    if (!texto.trim()) { setErros(e => ({...e, [tarefa.id]: 'Escreva uma resposta.'})); return }
    setEnviando(e => ({...e, [tarefa.id]: true}))
    setErros(e => ({...e, [tarefa.id]: ''}))
    try {
      const res = await fetch('/api/respostas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tarefaId: tarefa.id, turma, texto }),
      })
      const data = await res.json()
      if (!res.ok) { setErros(e => ({...e, [tarefa.id]: data.error || 'Erro ao enviar.'})) }
      else { setEnviados(e => ({...e, [tarefa.id]: true})) }
    } catch { setErros(e => ({...e, [tarefa.id]: 'Erro de conexão.'})) }
    setEnviando(e => ({...e, [tarefa.id]: false}))
  }

  function sair() {
    sessionStorage.removeItem('bdf_turma')
    sessionStorage.removeItem('bdf_cor')
    router.push('/turma-login')
  }

  if (!mounted) return null

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header} style={{ borderBottomColor: cor }}>
        <div className={styles.headerLeft}>
          <div className={styles.turmaTag} style={{ background: cor + '22', color: cor }}>
            Turma {turma}
          </div>
          <span className={styles.headerTitle}>Batalha dos Farroups 2026</span>
        </div>
        <button className={styles.sairBtn} onClick={sair}>Sair</button>
      </div>

      <div className={styles.content}>
        {loading ? (
          <p className={styles.loading}>Carregando tarefas...</p>
        ) : tarefas.length === 0 ? (
          <div className={styles.vazio}>
            <div className={styles.vaziIcon}>⚔️</div>
            <h2>Aguardando tarefas</h2>
            <p>O professor ainda não publicou nenhuma tarefa aberta.<br/>Esta página atualiza automaticamente.</p>
          </div>
        ) : (
          <>
            <p className={styles.instrucao}>
              {tarefas.length} tarefa{tarefas.length > 1 ? 's' : ''} ativa{tarefas.length > 1 ? 's' : ''} · Responda o quanto antes — a ordem de envio vale pontos!
            </p>
            <div className={styles.tarefasGrid}>
              {tarefas.map(t => {
                const respondeu = jaRespondeu(t.id)
                const minhaResp = respostas.find(r => r.tarefaId === t.id && r.turma === turma)
                return (
                  <div key={t.id} className={styles.tarefaCard} style={{ borderColor: respondeu ? cor + '66' : 'rgba(255,255,255,0.08)' }}>
                    <div className={styles.tarefaHeader}>
                      <span className={`${styles.tipo} ${t.tipo === 'pratica' ? styles.pratica : styles.teorica}`}>
                        {t.tipo === 'pratica' ? 'Prática' : 'Teórica'}
                      </span>
                      <span className={styles.num}>#{t.num}</span>
                    </div>
                    <h3 className={styles.tarefaTitulo}>{t.titulo}</h3>
                    {t.desc && <p className={styles.tarefaDesc}>{t.desc}</p>}
                    <div className={styles.tarefaPts}>
                      1º: <strong>{t.pts1}</strong> · 2º: <strong>{Math.round(t.pts1*.7)}</strong> · 3º: <strong>{Math.round(t.pts1*.5)}</strong> · Demais: <strong>{Math.round(t.pts1*.3)}</strong>
                    </div>

                    {respondeu ? (
                      <div className={styles.enviado}>
                        <span className={styles.enviadoIcon}>✓</span>
                        Resposta enviada!
                        {minhaResp?.status === 'correta'   && <span className={styles.correta}> · Correta! 🎉</span>}
                        {minhaResp?.status === 'incorreta' && <span className={styles.incorreta}> · Incorreta</span>}
                      </div>
                    ) : (
                      <div className={styles.formArea}>
                        <textarea
                          placeholder="Digite a resposta da sua turma aqui..."
                          value={textos[t.id] || ''}
                          onChange={e => setTextos(tx => ({...tx, [t.id]: e.target.value}))}
                          rows={3}
                          className={styles.textarea}
                        />
                        {erros[t.id] && <p className={styles.erro}>{erros[t.id]}</p>}
                        <button
                          className={styles.enviarBtn}
                          style={{ background: cor }}
                          onClick={() => enviar(t)}
                          disabled={enviando[t.id]}
                        >
                          {enviando[t.id] ? 'Enviando...' : `Enviar Resposta — Turma ${turma}`}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
