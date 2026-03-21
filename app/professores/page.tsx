'use client'
import { useAuth } from '@/components/LoginModal'
import { useEffect, useState, useCallback } from 'react'
import styles from './professores.module.css'

type Aba = 'placar' | 'tarefa' | 'aviso' | 'fotos' | 'batalha' | 'respostas'

interface Equipe  { nome: string; cor: string; pts: number }
interface Tarefa  { id?: string; tipo: 'teorica'|'pratica'; num: string; titulo: string; desc: string; pts1: number; status: 'aberta'|'encerrada'; timer?: number }
interface Aviso   { tag: string; data: string; titulo: string; texto: string }
interface Foto    { legenda: string; src: string }
interface Resposta{ linha?: number; id: string; tarefaId: string; turma: string; texto: string; enviadaEm: string; status: 'pendente'|'correta'|'incorreta'; pts: number }

const COR: Record<string,string> = {
  '9A':'#e02020','9B':'#1a3fa8','9C':'#16a34a','9D':'#d97706','9E':'#7c3aed','9F':'#0891b2'
}

const EQUIPES_DEF: Equipe[] = [
  {nome:'Equipe Ouro',cor:'#fbbf24',pts:0},{nome:'Equipe Prata',cor:'#d1d5db',pts:0},
  {nome:'Equipe Bronze',cor:'#cd7f32',pts:0},{nome:'Equipe Azul',cor:'#2952cc',pts:0},
  {nome:'Equipe Vermelha',cor:'#e02020',pts:0},
]

function save(k: string, v: unknown){ try{localStorage.setItem(k,JSON.stringify(v))}catch{} }
function load<T>(k: string, fb: T): T{ try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb}catch{return fb} }

export default function Professores() {
  const { isAuth, logout } = useAuth()
  const [mounted,setMounted]  = useState(false)
  const [aba,setAba]          = useState<Aba>('placar')
  const [toast,setToast]      = useState('')

  // Estado com fallback sheets -> localStorage
  const [equipes,setEquipes]  = useState<Equipe[]>(EQUIPES_DEF)
  const [tarefas,setTarefas]  = useState<Tarefa[]>([])
  const [avisos,setAvisos]    = useState<Aviso[]>([])
  const [fotos,setFotos]      = useState<Foto[]>([])
  const [respostas,setRespostas] = useState<Resposta[]>([])

  // Sheets config
  const [sheetId,setSheetId]  = useState('')
  const [syncStatus,setSyncStatus] = useState('')
  const [useSheets,setUseSheets]   = useState(false)

  // Tarefa form
  const [tTipo,setTTipo]    = useState<'teorica'|'pratica'>('teorica')
  const [tNum,setTNum]      = useState('')
  const [tTitulo,setTTitulo]= useState('')
  const [tDesc,setTDesc]    = useState('')
  const [tPts,setTPts]      = useState('1000')
  const [tTimer,setTTimer]  = useState('0')
  const [tStatus,setTStatus]= useState<'aberta'|'encerrada'>('aberta')

  // Aviso form
  const [aTag,setATag]      = useState('Oficial')
  const [aData,setAData]    = useState('')
  const [aTitulo,setATitulo]= useState('')
  const [aTexto,setATexto]  = useState('')

  // Foto
  const [fLeg,setFLeg]      = useState('')

  const showToast = useCallback((m:string)=>{setToast(m);setTimeout(()=>setToast(''),3000)},[])

  const carregarDados = useCallback(async () => {
    // Tarefas
    try {
      const res = await fetch('/api/tarefas')
      const data = await res.json()
      if (res.ok && Array.isArray(data) && data.length > 0) { setTarefas(data); setUseSheets(true) }
      else setTarefas(load('bdf_tarefas',[]))
    } catch { setTarefas(load('bdf_tarefas',[])) }

    // Equipes
    try {
      const res = await fetch('/api/placar')
      const data = await res.json()
      if (res.ok && Array.isArray(data) && data.length > 0) setEquipes(data)
      else setEquipes(load('bdf_equipes', EQUIPES_DEF))
    } catch { setEquipes(load('bdf_equipes', EQUIPES_DEF)) }

    // Respostas
    try {
      const res = await fetch('/api/respostas')
      const data = await res.json()
      if (res.ok && Array.isArray(data)) setRespostas(data)
    } catch {}

    setAvisos(load('bdf_avisos',[]))
    setFotos(load('bdf_fotos',[]))
  }, [])

  useEffect(()=>{
    setMounted(true)
    setSheetId(localStorage.getItem('bdf_sheet_id')||'')
    setAData(new Date().toISOString().slice(0,10))
    carregarDados()
    const iv = setInterval(carregarDados, 8000)
    return ()=>clearInterval(iv)
  },[carregarDados])

  // ── Equipes ──
  function upd(i:number,f:keyof Equipe,v:string|number){setEquipes(eq=>eq.map((e,idx)=>idx===i?{...e,[f]:v}:e))}

  async function salvarEquipes(){
    save('bdf_equipes',equipes)
    if (useSheets) {
      try {
        const res = await fetch('/api/placar',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({equipes})})
        const data = await res.json()
        if(!res.ok) throw new Error(data.error)
        showToast('✓ Placar salvo no Sheets!')
      } catch(e:unknown){ showToast('Salvo localmente (Sheets: '+(e instanceof Error?e.message:'erro')+')') }
    } else showToast('✓ Placar salvo!')
  }

  async function syncSheets(){
    if(!sheetId){showToast('Cole o ID da planilha!');return}
    localStorage.setItem('bdf_sheet_id',sheetId)
    setSyncStatus('Sincronizando...')
    try {
      const res = await fetch(`/api/placar?sheetId=${sheetId}&apiKey=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY||''}`)
      const data = await res.json()
      if(!res.ok) throw new Error(data.error)
      if(Array.isArray(data)&&data.length>0){ setEquipes(data);save('bdf_equipes',data);setUseSheets(true) }
      setSyncStatus('✓ Sincronizado!');showToast('✓ Importado do Sheets!')
    } catch(e:unknown){
      const m=e instanceof Error?e.message:'Erro'
      setSyncStatus('Erro: '+m);showToast('Erro: '+m)
    }
    setTimeout(()=>setSyncStatus(''),4000)
  }

  // ── Tarefas ──
  async function publicarTarefa(){
    if(!tTitulo.trim()){showToast('Preencha o título!');return}
    const nova:Tarefa={tipo:tTipo,num:tNum||String(tarefas.length+1).padStart(2,'0'),titulo:tTitulo,desc:tDesc,pts1:parseInt(tPts)||1000,status:tStatus,timer:parseInt(tTimer)||0}

    if(useSheets){
      try{
        const res=await fetch('/api/tarefas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(nova)})
        const data=await res.json()
        if(!res.ok) throw new Error(data.error)
        nova.id=data.id
        showToast('✓ Tarefa publicada no Sheets!')
      } catch(e:unknown){showToast('Erro Sheets: '+(e instanceof Error?e.message:''))}
    }

    const lista=[...tarefas,nova];setTarefas(lista);save('bdf_tarefas',lista)
    setTTitulo('');setTDesc('');setTNum('');showToast('✓ Tarefa publicada!')
  }

  async function toggleTarefa(i:number){
    const lista=tarefas.map((t,idx)=>idx===i?{...t,status:t.status==='aberta'?'encerrada' as const:'aberta' as const}:t)
    setTarefas(lista);save('bdf_tarefas',lista)
    if(useSheets){
      try{await fetch('/api/tarefas',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({tarefas:lista})})}catch{}
    }
  }

  async function deleteTarefa(i:number){
    const lista=tarefas.filter((_,idx)=>idx!==i);setTarefas(lista);save('bdf_tarefas',lista)
    if(useSheets){
      try{await fetch('/api/tarefas',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({tarefas:lista})})}catch{}
    }
    showToast('Removida.')
  }

  // ── Respostas ──
  async function corrigir(resp:Resposta,status:'correta'|'incorreta'){
    try{
      const res=await fetch('/api/respostas',{method:'PATCH',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({linha:resp.linha,status,turma:resp.turma,tarefaId:resp.tarefaId})})
      const data=await res.json()
      if(!res.ok) throw new Error(data.error)

      setRespostas(rs=>rs.map(r=>r.id===resp.id?{...r,status,pts:data.pts}:r))

      if(status==='correta'&&data.pts>0){
        showToast(`✓ ${resp.turma} correta! +${data.pts} pts`)
      } else { showToast(`✗ ${resp.turma} marcada como incorreta.`) }
    } catch(e:unknown){ showToast('Erro: '+(e instanceof Error?e.message:'')) }
  }

  // ── Avisos ──
  function pubAviso(){
    if(!aTitulo.trim()){showToast('Preencha!');return}
    const l=[...avisos,{tag:aTag,data:aData,titulo:aTitulo,texto:aTexto}]
    setAvisos(l);save('bdf_avisos',l);setATitulo('');setATexto('');showToast('✓ Aviso publicado!')
  }
  function delAviso(i:number){const l=avisos.filter((_,idx)=>idx!==i);setAvisos(l);save('bdf_avisos',l)}

  // ── Fotos ──
  function handleFoto(e:React.ChangeEvent<HTMLInputElement>){
    const f=e.target.files?.[0];if(!f)return
    if(f.size>2*1024*1024){showToast('Máx 2MB!');return}
    const r=new FileReader();r.onload=ev=>{
      const l=[...fotos,{src:ev.target?.result as string,legenda:fLeg}]
      setFotos(l);save('bdf_fotos',l);setFLeg('');e.target.value='';showToast('✓ Foto adicionada!')
    };r.readAsDataURL(f)
  }
  function delFoto(i:number){const l=fotos.filter((_,idx)=>idx!==i);setFotos(l);save('bdf_fotos',l)}

  if(!mounted) return null
  if(!isAuth) return(
    <>
      <div className="page-header"><h1 className="page-title">Área dos Professores</h1><p className="page-sub">Gerencie a batalha</p></div>
      <div className={styles.locked}>
        <span className={styles.lockEmoji}>🔒</span><h2>Acesso Restrito</h2>
        <p>Clique em <strong>&quot;Área do Professor&quot;</strong> no menu.</p>
        <p className={styles.hint}>Usuário: <code>professor</code> · Senha: <code>2026</code></p>
      </div>
    </>
  )

  const pendentes = respostas.filter(r=>r.status==='pendente')
  const abasConfig: { id: string; label: string; alert?: boolean }[] = [
    {id:'placar',  label:'🏆 Placar'},
    {id:'tarefa',  label:'📋 Tarefas'},
    {id:'respostas',label:`📩 Respostas${pendentes.length>0?` (${pendentes.length})`:''}`, alert: pendentes.length>0},
    {id:'aviso',   label:'📢 Avisos'},
    {id:'fotos',   label:'🖼️ Fotos'},
  ]

  return(
    <>
      <div className="page-header">
        <h1 className="page-title">Área dos Professores</h1>
        <p className="page-sub">{useSheets?'🟢 Conectado ao Google Sheets':'🟡 Modo local (sem Sheets)'}</p>
      </div>
      {toast&&<div className={styles.toast}>{toast}</div>}

      <div className={styles.area}>
        <div className={styles.tabs}>
          {abasConfig.map(t=>(
            <button key={t.id} className={`${styles.tab} ${aba===t.id?styles.tabActive:''} ${t.alert?styles.tabAlert:''}`}
              onClick={()=>setAba(t.id as Aba)}>{t.label}</button>
          ))}
          <button className={`${styles.tab} ${aba==='batalha'?styles.tabActive:''} ${styles.tabBatalha}`}
            onClick={()=>setAba('batalha')}>⚔️ Batalha Noturna</button>
        </div>

        {/* ── PLACAR ── */}
        {aba==='placar'&&(
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.cardHead}>🔗 Sincronizar com Google Sheets</h3>
              <p className={styles.cardDesc}>Aba <code>Placar</code>: A=Nome · B=Cor (hex) · C=Pontos. Planilha pública (qualquer pessoa com link pode ver).</p>
              <div className={styles.sheetRow}>
                <input type="text" placeholder="ID da planilha" value={sheetId} onChange={e=>setSheetId(e.target.value)} className={styles.sheetInput}/>
                <button className="btn-primary btn-sm" onClick={syncSheets}>Importar</button>
              </div>
              {syncStatus&&<p className={styles.syncStatus}>{syncStatus}</p>}
              <p className={styles.sheetHint}>O ID está na URL: docs.google.com/spreadsheets/d/<strong>ID_AQUI</strong>/edit</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardHead}>Editar Placar Manualmente</h3>
              <table className={styles.table}>
                <thead><tr><th>Cor</th><th>Equipe</th><th>Pontos</th><th></th></tr></thead>
                <tbody>
                  {equipes.map((e,i)=>(
                    <tr key={i}>
                      <td><input type="color" value={e.cor} onChange={ev=>upd(i,'cor',ev.target.value)} className={styles.colorPicker}/></td>
                      <td><input type="text" value={e.nome} onChange={ev=>upd(i,'nome',ev.target.value)} className={styles.textInput}/></td>
                      <td><input type="number" value={e.pts} onChange={ev=>upd(i,'pts',parseInt(ev.target.value)||0)} className={styles.numInput}/></td>
                      <td><button className="btn-danger btn-sm" onClick={()=>setEquipes(eq=>eq.filter((_,idx)=>idx!==i))}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.rowBtns}>
                <button className="btn-primary btn-sm" onClick={salvarEquipes}>💾 Salvar Placar</button>
                <button className="btn-ghost btn-sm" onClick={()=>setEquipes(e=>[...e,{nome:'Nova Equipe',cor:'#888',pts:0}])}>+ Equipe</button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAREFAS ── */}
        {aba==='tarefa'&&(
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.cardHead}>Publicar Nova Tarefa</h3>
              <p className={styles.cardDesc}>Você pode publicar múltiplas tarefas abertas ao mesmo tempo. As turmas verão todas as tarefas ativas na área delas.</p>
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
              <div className={styles.field}><label>Título / Enunciado</label>
                <input type="text" placeholder="Digite o enunciado da tarefa" value={tTitulo} onChange={e=>setTTitulo(e.target.value)}/>
              </div>
              <div className={styles.field}><label>Descrição (opcional)</label>
                <textarea placeholder="Detalhes adicionais..." value={tDesc} onChange={e=>setTDesc(e.target.value)}/>
              </div>
              <div className={styles.formRow}>
                <div className={styles.field}><label>Pontos (1º lugar)</label>
                  <input type="number" value={tPts} onChange={e=>setTPts(e.target.value)}/>
                </div>
                <div className={styles.field}><label>Status inicial</label>
                  <select value={tStatus} onChange={e=>setTStatus(e.target.value as 'aberta'|'encerrada')}>
                    <option value="aberta">Aberta</option><option value="encerrada">Encerrada</option>
                  </select>
                </div>
              </div>
              <button className="btn-primary btn-sm" onClick={publicarTarefa}>+ Publicar Tarefa</button>
            </div>

            {tarefas.length>0&&(
              <div className={styles.card}>
                <h3 className={styles.cardHead}>Todas as Tarefas ({tarefas.length} · {tarefas.filter(t=>t.status==='aberta').length} abertas)</h3>
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
                        <button className="btn-ghost btn-sm" onClick={()=>toggleTarefa(i)}>
                          {t.status==='aberta'?'Encerrar':'Reabrir'}
                        </button>
                        <button className="btn-danger btn-sm" onClick={()=>deleteTarefa(i)}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── RESPOSTAS ── */}
        {aba==='respostas'&&(
          <div className={styles.panel}>
            {respostas.length===0?(
              <div className={styles.card}><p style={{color:'rgba(255,255,255,0.4)',textAlign:'center',padding:'2rem'}}>Nenhuma resposta ainda. As turmas precisam fazer login em /turma-login e responder.</p></div>
            ):(
              <>
                {/* Agrupa por tarefa */}
                {Array.from(new Set(respostas.map(r=>r.tarefaId))).map(tid=>{
                  const task = tarefas.find(t=>t.id===tid||t.num===tid)
                  const resps = respostas.filter(r=>r.tarefaId===tid).sort((a,b)=>new Date(a.enviadaEm).getTime()-new Date(b.enviadaEm).getTime())
                  return(
                    <div key={tid} className={styles.card}>
                      <h3 className={styles.cardHead}>
                        {task?`Tarefa #${task.num} — ${task.titulo}`:`Tarefa ${tid}`}
                        <span style={{fontSize:'0.72rem',fontWeight:400,color:'rgba(255,255,255,0.4)',marginLeft:'0.5rem'}}>
                          {resps.filter(r=>r.status==='correta').length} corretas · {resps.filter(r=>r.status==='pendente').length} pendentes
                        </span>
                      </h3>
                      <div className={styles.itemList}>
                        {resps.map((r,i)=>(
                          <div key={r.id} className={`${styles.respostaCard} ${r.status==='correta'?styles.respCorreta:r.status==='incorreta'?styles.respIncorreta:''}`}>
                            <div className={styles.respostaTop}>
                              <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                                <span style={{fontSize:'0.68rem',fontWeight:700,color:'rgba(255,255,255,0.4)'}}>{i+1}º</span>
                                <span className={styles.respostaTurma} style={{background:COR[r.turma]+'33',color:COR[r.turma]}}>
                                  Turma {r.turma}
                                </span>
                                <span className={styles.respostaHora}>
                                  {new Date(r.enviadaEm).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
                                </span>
                              </div>
                              <div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}>
                                {r.status==='pendente'?(
                                  <>
                                    <button className={styles.btnCorreta}  onClick={()=>corrigir(r,'correta')}>✓ Correta</button>
                                    <button className={styles.btnIncorreta} onClick={()=>corrigir(r,'incorreta')}>✗ Incorreta</button>
                                  </>
                                ):r.status==='correta'?(
                                  <span style={{fontSize:'0.72rem',color:'#4ade80',fontWeight:700}}>✓ +{r.pts}pts</span>
                                ):(
                                  <span style={{fontSize:'0.72rem',color:'#f87171',fontWeight:700}}>✗ Incorreta</span>
                                )}
                              </div>
                            </div>
                            <p className={styles.respostaTexto}>{r.texto}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}

        {/* ── AVISOS ── */}
        {aba==='aviso'&&(
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
              <div className={styles.field}><label>Título</label><input type="text" value={aTitulo} onChange={e=>setATitulo(e.target.value)} placeholder="Título do aviso"/></div>
              <div className={styles.field}><label>Texto</label><textarea value={aTexto} onChange={e=>setATexto(e.target.value)} placeholder="Conteúdo..."/></div>
              <button className="btn-primary btn-sm" onClick={pubAviso}>Publicar</button>
            </div>
            {avisos.length>0&&(
              <div className={styles.card}>
                <h3 className={styles.cardHead}>Avisos ({avisos.length})</h3>
                <div className={styles.itemList}>
                  {[...avisos].reverse().map((a,ri)=>{const i=avisos.length-1-ri;return(
                    <div key={i} className={styles.itemRow}>
                      <span className={styles.avisoTag}>{a.tag}</span>
                      <div className={styles.itemInfo}><div className={styles.itemTitle}>{a.titulo}</div><div className={styles.itemSub}>{a.data}</div></div>
                      <button className="btn-danger btn-sm" onClick={()=>delAviso(i)}>×</button>
                    </div>
                  )})}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FOTOS ── */}
        {aba==='fotos'&&(
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.cardHead}>Adicionar Foto</h3>
              <div className={styles.field}><label>Legenda</label><input type="text" value={fLeg} onChange={e=>setFLeg(e.target.value)} placeholder="Legenda..."/></div>
              <div className={styles.field}><label>Imagem (máx 2MB)</label><input type="file" accept="image/*" onChange={handleFoto} className={styles.fileInput}/></div>
            </div>
            {fotos.length>0&&(
              <div className={styles.card}>
                <h3 className={styles.cardHead}>Galeria ({fotos.length})</h3>
                <div className={styles.fotoGrid}>
                  {fotos.map((f,i)=>(
                    <div key={i} className={styles.fotoItem}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.src} alt={f.legenda} className={styles.fotoImg}/>
                      <div className={styles.fotoLegenda}>{f.legenda||'Sem legenda'}</div>
                      <button className="btn-danger btn-sm" onClick={()=>delFoto(i)} style={{marginTop:'0.4rem'}}>Remover</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BATALHA NOTURNA ── */}
        {aba==='batalha'&&(
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.cardHead}>⚔️ Links da Batalha Noturna</h3>
              <p className={styles.cardDesc}>Envie para cada turma entrar. O professor projeta o telão em /batalha.</p>
              <div className={styles.linksGrid}>
                {['9A','9B','9C','9D','9E','9F'].map(t=>(
                  <div key={t} className={styles.turmaLink} style={{borderColor:COR[t],color:COR[t]}}>
                    <strong>Turma {t}</strong>
                    <span className={styles.linkUrl}>Login: {t.toLowerCase()} / farroups{t.toLowerCase()}</span>
                    <a href="/turma-login" target="_blank" style={{fontSize:'0.65rem',color:COR[t],opacity:0.7}}>/turma-login →</a>
                  </div>
                ))}
              </div>
              <div style={{marginTop:'1rem',display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
                <a href="/batalha" target="_blank" rel="noopener" className={styles.telaoLink}>⛶ Abrir Telão</a>
                <a href="/turma" target="_blank" rel="noopener" className={styles.telaoLink}>📱 Ver área das turmas</a>
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
