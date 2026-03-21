'use client'
import { useAuth } from '@/components/LoginModal'
import { useEffect, useState, useCallback } from 'react'
import styles from './professores.module.css'

type Aba = 'placar' | 'tarefa' | 'aviso' | 'fotos' | 'batalha'

interface Equipe { nome: string; cor: string; pts: number }
interface Tarefa  { tipo: 'teorica'|'pratica'; num: string; titulo: string; desc: string; pts1: number; status: 'aberta'|'encerrada' }
interface Aviso   { tag: string; data: string; titulo: string; texto: string }
interface Foto    { legenda: string; src: string }
interface TarefaBatalha {
  id: string; numero: string; tipo: 'teorica'|'pratica'
  titulo: string; descricao: string; imagem?: string
  duracaoSeg: number; status: 'aguardando'|'ativa'|'encerrada'
  lancadaEm?: number
}
interface Resposta {
  turma: string; texto: string; imagem?: string
  enviadaEm: number; status: 'pendente'|'correta'|'incorreta'
}

const TURMAS = ['9A','9B','9C','9D','9E','9F']
const COR_TURMA: Record<string,string> = {
  '9A':'#e02020','9B':'#1a3fa8','9C':'#16a34a',
  '9D':'#d97706','9E':'#7c3aed','9F':'#0891b2',
}

const EQUIPES_DEFAULT: Equipe[] = [
  { nome:'Equipe Ouro',     cor:'#fbbf24', pts:0 },
  { nome:'Equipe Prata',    cor:'#d1d5db', pts:0 },
  { nome:'Equipe Bronze',   cor:'#cd7f32', pts:0 },
  { nome:'Equipe Azul',     cor:'#2952cc', pts:0 },
  { nome:'Equipe Vermelha', cor:'#e02020', pts:0 },
]

function load<T>(key: string, fb: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb }
  catch { return fb }
}
function save(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)) } catch {}
}

export default function Professores() {
  const { isAuth, logout } = useAuth()
  const [mounted, setMounted]   = useState(false)
  const [aba, setAba]           = useState<Aba>('placar')
  const [toast, setToast]       = useState('')

  // Placar
  const [equipes,    setEquipes]    = useState<Equipe[]>(EQUIPES_DEFAULT)
  const [sheetId,    setSheetId]    = useState('')
  const [syncStatus, setSyncStatus] = useState('')

  // Tarefas
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [tTipo,   setTTipo]   = useState<'teorica'|'pratica'>('teorica')
  const [tNum,    setTNum]    = useState('')
  const [tTitulo, setTTitulo] = useState('')
  const [tDesc,   setTDesc]   = useState('')
  const [tPts,    setTPts]    = useState('1000')
  const [tStatus, setTStatus] = useState<'aberta'|'encerrada'>('aberta')

  // Avisos
  const [avisos,  setAvisos]  = useState<Aviso[]>([])
  const [aTag,    setATag]    = useState('Oficial')
  const [aData,   setAData]   = useState('')
  const [aTitulo, setATitulo] = useState('')
  const [aTexto,  setATexto]  = useState('')

  // Fotos
  const [fotos,    setFotos]    = useState<Foto[]>([])
  const [fLegenda, setFLegenda] = useState('')

  // Batalha Noturna
  const [bTipo,     setBTipo]     = useState<'teorica'|'pratica'>('teorica')
  const [bNum,      setBNum]      = useState('')
  const [bTitulo,   setBTitulo]   = useState('')
  const [bDesc,     setBDesc]     = useState('')
  const [bImagem,   setBImagem]   = useState<string|null>(null)
  const [bDuracao,  setBDuracao]  = useState('120')
  const [tarefaAtiva, setTarefaAtiva] = useState<TarefaBatalha|null>(null)
  const [respostas,   setRespostas]   = useState<Resposta[]>([])
  const [tempoRest,   setTempoRest]   = useState(0)

  const showToast = useCallback((msg: string) => {
    setToast(msg); setTimeout(() => setToast(''), 3000)
  }, [])

  const carregarBatalha = useCallback(() => {
    try {
      const t = localStorage.getItem('bdf_tarefa_ativa')
      if (t) setTarefaAtiva(JSON.parse(t))
      const r = localStorage.getItem('bdf_respostas')
      if (r) setRespostas(JSON.parse(r))
    } catch {}
  }, [])

  useEffect(() => {
    setMounted(true)
    setEquipes(load('bdf_equipes', EQUIPES_DEFAULT))
    setTarefas(load('bdf_tarefas', []))
    setAvisos(load('bdf_avisos', []))
    setFotos(load('bdf_fotos', []))
    setAData(new Date().toISOString().slice(0,10))
    setSheetId(localStorage.getItem('bdf_sheet_id')||'')
    carregarBatalha()
    const iv = setInterval(carregarBatalha, 2000)
    return () => clearInterval(iv)
  }, [carregarBatalha])

  // Cronômetro da batalha
  useEffect(() => {
    if (!tarefaAtiva || tarefaAtiva.status !== 'ativa' || !tarefaAtiva.lancadaEm) return
    const tick = () => {
      const elapsed = Math.floor((Date.now() - tarefaAtiva.lancadaEm!) / 1000)
      const r = Math.max(0, tarefaAtiva.duracaoSeg - elapsed)
      setTempoRest(r)
      if (r === 0) {
        const at = JSON.parse(localStorage.getItem('bdf_tarefa_ativa')||'null')
        if (at?.status === 'ativa') {
          const encerrada = {...at, status:'encerrada'}
          localStorage.setItem('bdf_tarefa_ativa', JSON.stringify(encerrada))
          setTarefaAtiva(encerrada)
        }
      }
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [tarefaAtiva])

  // ── Equipes ──
  function updateEquipe(i: number, field: keyof Equipe, val: string|number) {
    setEquipes(eq => eq.map((e,idx) => idx===i ? {...e,[field]:val} : e))
  }
  function salvarEquipes() {
    save('bdf_equipes', equipes); showToast('✓ Placar salvo!')
  }
  function addEquipe() { setEquipes(e => [...e, {nome:'Nova Equipe',cor:'#888',pts:0}]) }
  function removeEquipe(i: number) {
    const n = equipes.filter((_,idx)=>idx!==i)
    setEquipes(n); save('bdf_equipes', n)
  }
  async function syncSheets() {
    if (!sheetId) { showToast('Cole o ID da planilha!'); return }
    localStorage.setItem('bdf_sheet_id', sheetId)
    setSyncStatus('Sincronizando...')
    try {
      const url = `/api/placar?sheetId=${sheetId}&apiKey=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''}`
      const res  = await fetch(url)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const nova = (Array.isArray(data) ? data : []).map((r: {nome:string,cor:string,pts:number}) => ({nome:r.nome||'Equipe',cor:r.cor||'#888',pts:r.pts||0}))
      setEquipes(nova); save('bdf_equipes', nova)
      setSyncStatus('✓ Sincronizado!'); showToast('✓ Placar importado!')
    } catch(e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro'
      setSyncStatus('Erro: '+msg); showToast('Erro: '+msg)
    }
    setTimeout(()=>setSyncStatus(''),4000)
  }

  // ── Tarefas ──
  function publicarTarefa() {
    if (!tTitulo.trim()) { showToast('Preencha o título!'); return }
    const lista = [...tarefas, {tipo:tTipo,num:tNum||String(tarefas.length+1).padStart(2,'0'),titulo:tTitulo,desc:tDesc,pts1:parseInt(tPts)||1000,status:tStatus}]
    setTarefas(lista); save('bdf_tarefas', lista)
    setTTitulo(''); setTDesc(''); setTNum(''); showToast('✓ Tarefa publicada!')
  }
  function deleteTarefa(i: number) {
    const l = tarefas.filter((_,idx)=>idx!==i); setTarefas(l); save('bdf_tarefas',l); showToast('Removida.')
  }
  function toggleTarefa(i: number) {
    const l = tarefas.map((t,idx)=>idx===i?{...t,status:t.status==='aberta'?'encerrada' as const:'aberta' as const}:t)
    setTarefas(l); save('bdf_tarefas',l)
  }

  // ── Avisos ──
  function publicarAviso() {
    if (!aTitulo.trim()) { showToast('Preencha o título!'); return }
    const l = [...avisos,{tag:aTag,data:aData,titulo:aTitulo,texto:aTexto}]
    setAvisos(l); save('bdf_avisos',l); setATitulo(''); setATexto(''); showToast('✓ Aviso publicado!')
  }
  function deleteAviso(i: number) {
    const l = avisos.filter((_,idx)=>idx!==i); setAvisos(l); save('bdf_avisos',l)
  }

  // ── Fotos ──
  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > 2*1024*1024) { showToast('Máx 2MB!'); return }
    const reader = new FileReader()
    reader.onload = ev => {
      const l = [...fotos,{src:ev.target?.result as string,legenda:fLegenda}]
      setFotos(l); save('bdf_fotos',l); setFLegenda(''); e.target.value=''; showToast('✓ Foto adicionada!')
    }
    reader.readAsDataURL(file)
  }
  function deleteFoto(i: number) {
    const l = fotos.filter((_,idx)=>idx!==i); setFotos(l); save('bdf_fotos',l)
  }

  // ── Batalha Noturna ──
  function handleBImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setBImagem(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function lancarTarefa() {
    if (!bTitulo.trim()) { showToast('Preencha o título!'); return }
    const nova: TarefaBatalha = {
      id: Date.now().toString(),
      numero: bNum || String(Date.now()),
      tipo: bTipo, titulo: bTitulo, descricao: bDesc,
      imagem: bImagem||undefined,
      duracaoSeg: parseInt(bDuracao)||120,
      status: 'ativa', lancadaEm: Date.now(),
    }
    localStorage.setItem('bdf_tarefa_ativa', JSON.stringify(nova))
    localStorage.setItem('bdf_respostas', JSON.stringify([]))
    setTarefaAtiva(nova); setRespostas([])
    setBTitulo(''); setBDesc(''); setBNum(''); setBImagem(null)
    showToast('✓ Tarefa lançada! Telão atualizado.')
  }

  function encerrarTarefa() {
    if (!tarefaAtiva) return
    const enc = {...tarefaAtiva, status:'encerrada' as const}
    localStorage.setItem('bdf_tarefa_ativa', JSON.stringify(enc))
    setTarefaAtiva(enc); showToast('Tarefa encerrada.')
  }

  function corrigir(i: number, status: 'correta'|'incorreta') {
    const lista = respostas.map((r,idx) => idx===i ? {...r,status} : r)
    setRespostas(lista)
    localStorage.setItem('bdf_respostas', JSON.stringify(lista))
    if (status === 'correta') {
      // Pontuação automática baseada na posição
      const pts = [1000,700,500,300]
      const pos = respostas.slice(0,i).filter(r=>r.status==='correta').length
      showToast(`✓ ${lista[i].turma} correta! +${pts[Math.min(pos,3)]} pts`)
    }
  }

  function limparRespostas() {
    localStorage.setItem('bdf_respostas','[]')
    setRespostas([]); showToast('Respostas limpas.')
  }

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const respostasOrdenadas = [...respostas].sort((a,b)=>a.enviadaEm-b.enviadaEm)

  if (!mounted) return null
  if (!isAuth) return (
    <>
      <div className="page-header">
        <h1 className="page-title">Área dos Professores</h1>
        <p className="page-sub">Gerencie tarefas, placar e avisos</p>
      </div>
      <div className={styles.locked}>
        <span className={styles.lockEmoji}>🔒</span>
        <h2>Acesso Restrito</h2>
        <p>Clique em <strong>&quot;Área do Professor&quot;</strong> no menu para fazer login.</p>
        <p className={styles.hint}>Usuário: <code>professor</code> · Senha: <code>2026</code></p>
      </div>
    </>
  )

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Área dos Professores</h1>
        <p className="page-sub">Batalha dos Farroups 2026</p>
      </div>
      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.area}>
        <div className={styles.tabs}>
          {(['placar','tarefa','aviso','fotos','batalha'] as Aba[]).map(t=>(
            <button key={t} className={`${styles.tab} ${aba===t?styles.tabActive:''} ${t==='batalha'?styles.tabBatalha:''}`}
              onClick={()=>setAba(t)}>
              {{'placar':'🏆 Placar','tarefa':'📋 Tarefas','aviso':'📢 Avisos','fotos':'🖼️ Fotos','batalha':'⚔️ Batalha Noturna'}[t]}
            </button>
          ))}
        </div>

        {/* ── PLACAR ── */}
        {aba==='placar' && (
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.cardHead}>🔗 Sincronizar com Google Sheets</h3>
              <p className={styles.cardDesc}>Aba <code>Placar</code>: A=Nome · B=Cor (hex) · C=Pontos. Planilha pública.</p>
              <div className={styles.sheetRow}>
                <input type="text" placeholder="ID da planilha" value={sheetId} onChange={e=>setSheetId(e.target.value)} className={styles.sheetInput}/>
                <button className="btn-primary btn-sm" onClick={syncSheets}>Importar</button>
              </div>
              {syncStatus && <p className={styles.syncStatus}>{syncStatus}</p>}
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardHead}>Editar Placar</h3>
              <table className={styles.table}>
                <thead><tr><th>Cor</th><th>Equipe</th><th>Pontos</th><th></th></tr></thead>
                <tbody>
                  {equipes.map((e,i)=>(
                    <tr key={i}>
                      <td><input type="color" value={e.cor} onChange={ev=>updateEquipe(i,'cor',ev.target.value)} className={styles.colorPicker}/></td>
                      <td><input type="text" value={e.nome} onChange={ev=>updateEquipe(i,'nome',ev.target.value)} className={styles.textInput}/></td>
                      <td><input type="number" value={e.pts} onChange={ev=>updateEquipe(i,'pts',parseInt(ev.target.value)||0)} className={styles.numInput}/></td>
                      <td><button className="btn-danger btn-sm" onClick={()=>removeEquipe(i)}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.rowBtns}>
                <button className="btn-primary btn-sm" onClick={salvarEquipes}>💾 Salvar</button>
                <button className="btn-ghost btn-sm" onClick={addEquipe}>+ Equipe</button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAREFAS ── */}
        {aba==='tarefa' && (
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.cardHead}>Publicar Nova Tarefa</h3>
              <div className={styles.formRow}>
                <div className={styles.field}><label>Tipo</label>
                  <select value={tTipo} onChange={e=>setTTipo(e.target.value as 'teorica'|'pratica')}>
                    <option value="teorica">Teórica</option><option value="pratica">Prática</option>
                  </select>
                </div>
                <div className={styles.field}><label>Número</label>
                  <input type="text" placeholder="01" value={tNum} onChange={e=>setTNum(e.target.value)}/>
                </div>
              </div>
              <div className={styles.field}><label>Título</label>
                <input type="text" placeholder="Título da tarefa" value={tTitulo} onChange={e=>setTTitulo(e.target.value)}/>
              </div>
              <div className={styles.field}><label>Descrição</label>
                <textarea placeholder="Descreva a tarefa..." value={tDesc} onChange={e=>setTDesc(e.target.value)}/>
              </div>
              <div className={styles.formRow}>
                <div className={styles.field}><label>Pontos (1º)</label>
                  <input type="number" value={tPts} onChange={e=>setTPts(e.target.value)}/>
                </div>
                <div className={styles.field}><label>Status</label>
                  <select value={tStatus} onChange={e=>setTStatus(e.target.value as 'aberta'|'encerrada')}>
                    <option value="aberta">Aberta</option><option value="encerrada">Encerrada</option>
                  </select>
                </div>
              </div>
              <button className="btn-primary btn-sm" onClick={publicarTarefa}>Publicar Tarefa</button>
            </div>
            {tarefas.length>0 && (
              <div className={styles.card}>
                <h3 className={styles.cardHead}>Tarefas ({tarefas.length})</h3>
                <div className={styles.itemList}>
                  {tarefas.map((t,i)=>(
                    <div key={i} className={styles.itemRow}>
                      <span className={`${styles.badge} ${t.tipo==='pratica'?styles.badgePratica:styles.badgeTeorica}`}>
                        {t.tipo==='pratica'?'Prática':'Teórica'}
                      </span>
                      <div className={styles.itemInfo}>
                        <div className={styles.itemTitle}>{t.titulo}</div>
                        <div className={styles.itemSub}>#{t.num} · {t.pts1}pts · <span style={{color:t.status==='aberta'?'#4ade80':'#888'}}>{t.status}</span></div>
                      </div>
                      <div className={styles.itemActions}>
                        <button className="btn-ghost btn-sm" onClick={()=>toggleTarefa(i)}>{t.status==='aberta'?'Encerrar':'Reabrir'}</button>
                        <button className="btn-danger btn-sm" onClick={()=>deleteTarefa(i)}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── AVISOS ── */}
        {aba==='aviso' && (
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.cardHead}>Publicar Aviso</h3>
              <div className={styles.formRow}>
                <div className={styles.field}><label>Categoria</label>
                  <select value={aTag} onChange={e=>setATag(e.target.value)}>
                    {['Oficial','Regras','Prazo','Gabarito','Aviso'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className={styles.field}><label>Data</label>
                  <input type="date" value={aData} onChange={e=>setAData(e.target.value)}/>
                </div>
              </div>
              <div className={styles.field}><label>Título</label>
                <input type="text" placeholder="Título" value={aTitulo} onChange={e=>setATitulo(e.target.value)}/>
              </div>
              <div className={styles.field}><label>Texto</label>
                <textarea placeholder="Conteúdo..." value={aTexto} onChange={e=>setATexto(e.target.value)}/>
              </div>
              <button className="btn-primary btn-sm" onClick={publicarAviso}>Publicar</button>
            </div>
            {avisos.length>0 && (
              <div className={styles.card}>
                <h3 className={styles.cardHead}>Avisos ({avisos.length})</h3>
                <div className={styles.itemList}>
                  {[...avisos].reverse().map((a,ri)=>{
                    const i=avisos.length-1-ri
                    return (
                      <div key={i} className={styles.itemRow}>
                        <span className={styles.avisoTag}>{a.tag}</span>
                        <div className={styles.itemInfo}>
                          <div className={styles.itemTitle}>{a.titulo}</div>
                          <div className={styles.itemSub}>{a.data}</div>
                        </div>
                        <button className="btn-danger btn-sm" onClick={()=>deleteAviso(i)}>×</button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FOTOS ── */}
        {aba==='fotos' && (
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.cardHead}>Adicionar Foto</h3>
              <div className={styles.field}><label>Legenda</label>
                <input type="text" placeholder="Legenda..." value={fLegenda} onChange={e=>setFLegenda(e.target.value)}/>
              </div>
              <div className={styles.field}><label>Imagem (máx 2MB)</label>
                <input type="file" accept="image/*" onChange={handleFoto} className={styles.fileInput}/>
              </div>
            </div>
            {fotos.length>0 && (
              <div className={styles.card}>
                <h3 className={styles.cardHead}>Galeria ({fotos.length})</h3>
                <div className={styles.fotoGrid}>
                  {fotos.map((f,i)=>(
                    <div key={i} className={styles.fotoItem}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.src} alt={f.legenda} className={styles.fotoImg}/>
                      <div className={styles.fotoLegenda}>{f.legenda||'Sem legenda'}</div>
                      <button className="btn-danger btn-sm" onClick={()=>deleteFoto(i)} style={{marginTop:'0.4rem'}}>Remover</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BATALHA NOTURNA ── */}
        {aba==='batalha' && (
          <div className={styles.panel}>
            {/* Links das turmas */}
            <div className={styles.card}>
              <h3 className={styles.cardHead}>🔗 Links das Turmas</h3>
              <p className={styles.cardDesc}>Envie o link para cada turma acessar no celular.</p>
              <div className={styles.linksGrid}>
                {TURMAS.map(t=>(
                  <a key={t} href={`/turma/${t.toLowerCase()}`} target="_blank" rel="noopener"
                    className={styles.turmaLink} style={{borderColor:COR_TURMA[t], color:COR_TURMA[t]}}>
                    Turma {t}
                    <span className={styles.linkUrl}>/turma/{t.toLowerCase()}</span>
                  </a>
                ))}
              </div>
              <div style={{marginTop:'1rem'}}>
                <a href="/batalha" target="_blank" rel="noopener" className={styles.telaoLink}>
                  ⛶ Abrir Telão → /batalha
                </a>
              </div>
            </div>

            {/* Tarefa ativa */}
            {tarefaAtiva && tarefaAtiva.status==='ativa' ? (
              <div className={styles.card} style={{borderColor:'rgba(224,32,32,0.4)'}}>
                <div className={styles.ativaHeader}>
                  <div>
                    <h3 className={styles.cardHead} style={{color:'#ff7b7b'}}>⚡ Tarefa Ativa</h3>
                    <p className={styles.ativaTitulo}>{tarefaAtiva.titulo}</p>
                  </div>
                  <div className={styles.ativaTimer}>{fmt(tempoRest)}</div>
                </div>
                <div className={styles.timerBarWrap} style={{marginBottom:'1rem'}}>
                  <div className={styles.timerBar}
                    style={{width:`${(tempoRest/tarefaAtiva.duracaoSeg)*100}%`}}/>
                </div>
                <button className="btn-danger btn-sm" onClick={encerrarTarefa}>Encerrar Tarefa</button>
              </div>
            ) : (
              /* Formulário de nova tarefa da batalha */
              <div className={styles.card}>
                <h3 className={styles.cardHead}>⚔️ Lançar Tarefa da Batalha</h3>
                <div className={styles.formRow}>
                  <div className={styles.field}><label>Tipo</label>
                    <select value={bTipo} onChange={e=>setBTipo(e.target.value as 'teorica'|'pratica')}>
                      <option value="teorica">Teórica</option><option value="pratica">Prática</option>
                    </select>
                  </div>
                  <div className={styles.field}><label>Número</label>
                    <input type="text" placeholder="01" value={bNum} onChange={e=>setBNum(e.target.value)}/>
                  </div>
                </div>
                <div className={styles.field}><label>Título / Enunciado</label>
                  <input type="text" placeholder="Ex: Qual é a capital do RS?" value={bTitulo} onChange={e=>setBTitulo(e.target.value)}/>
                </div>
                <div className={styles.field}><label>Descrição (opcional)</label>
                  <textarea placeholder="Detalhes adicionais..." value={bDesc} onChange={e=>setBDesc(e.target.value)} rows={2}/>
                </div>
                <div className={styles.field}><label>Imagem (opcional)</label>
                  <input type="file" accept="image/*" onChange={handleBImagem} className={styles.fileInput}/>
                  {bImagem && <img src={bImagem} alt="" style={{maxHeight:120,borderRadius:6,marginTop:6}}/>}
                </div>
                <div className={styles.field}><label>⏱ Tempo (segundos)</label>
                  <div className={styles.duracaoGrid}>
                    {[30,60,90,120,180,300].map(s=>(
                      <button key={s} className={`${styles.duracaoBtn} ${bDuracao===String(s)?styles.duracaoAtivo:''}`}
                        onClick={()=>setBDuracao(String(s))}>
                        {s<60?`${s}s`:`${s/60}min`}
                      </button>
                    ))}
                    <input type="number" value={bDuracao} onChange={e=>setBDuracao(e.target.value)}
                      className={styles.duracaoCustom} placeholder="Custom"/>
                  </div>
                </div>
                <button className={styles.lancarBtn} onClick={lancarTarefa}>
                  ⚡ Lançar Tarefa Agora
                </button>
              </div>
            )}

            {/* Respostas em tempo real */}
            <div className={styles.card}>
              <div className={styles.respostasHeader}>
                <h3 className={styles.cardHead} style={{margin:0}}>
                  Respostas em Tempo Real ({respostas.length}/6)
                </h3>
                <div style={{display:'flex',gap:'0.5rem',alignItems:'center',flexWrap:'wrap'}}>
                  {TURMAS.filter(t=>!respostas.find(r=>r.turma===t)).map(t=>(
                    <span key={t} className={styles.turmaFaltando}
                      style={{background:COR_TURMA[t]+'22',color:COR_TURMA[t]}}>
                      {t} aguardando
                    </span>
                  ))}
                  {respostas.length>0 && (
                    <button className="btn-ghost btn-sm" onClick={limparRespostas}>Limpar</button>
                  )}
                </div>
              </div>
              <div className={styles.respostasList}>
                {respostasOrdenadas.length===0 ? (
                  <p style={{fontSize:'0.82rem',color:'rgba(255,255,255,0.3)',padding:'1.5rem 0',textAlign:'center'}}>
                    Nenhuma resposta ainda...
                  </p>
                ) : respostasOrdenadas.map((r,i)=>(
                  <div key={i} className={`${styles.respostaCard} ${r.status==='correta'?styles.respCorreta:r.status==='incorreta'?styles.respIncorreta:''}`}>
                    <div className={styles.respostaTop}>
                      <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                        <span className={styles.respostaTurma}
                          style={{background:COR_TURMA[r.turma]+'33',color:COR_TURMA[r.turma]}}>
                          {i+1}º · {r.turma}
                        </span>
                        <span className={styles.respostaHora}>
                          {new Date(r.enviadaEm).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
                        </span>
                      </div>
                      {r.status==='pendente' && (
                        <div className={styles.botoesCorrecao}>
                          <button className={styles.btnCorreta}  onClick={()=>corrigir(i,'correta')}>✓ Correta</button>
                          <button className={styles.btnIncorreta} onClick={()=>corrigir(i,'incorreta')}>✗ Incorreta</button>
                        </div>
                      )}
                      {r.status==='correta'   && <span className={styles.statusCorreta}>✓ Correta</span>}
                      {r.status==='incorreta' && <span className={styles.statusIncorreta}>✗ Incorreta</span>}
                    </div>
                    {r.texto && <p className={styles.respostaTexto}>{r.texto}</p>}
                    {r.imagem && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.imagem} alt="" className={styles.respostaImg}/>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{paddingTop:'1.5rem',borderTop:'1px solid var(--border)',marginTop:'1rem'}}>
          <button className="btn-ghost btn-sm" onClick={logout}>Sair da área administrativa</button>
        </div>
      </div>
    </>
  )
}
