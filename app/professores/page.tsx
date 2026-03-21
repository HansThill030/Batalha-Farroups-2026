'use client'
import { useAuth } from '@/components/LoginModal'
import { useEffect, useState, useCallback } from 'react'
import styles from './professores.module.css'

type Aba = 'placar' | 'tarefa' | 'aviso' | 'fotos'

interface Equipe { nome: string; cor: string; pts: number }
interface Tarefa { tipo: 'teorica'|'pratica'; num: string; titulo: string; desc: string; pts1: number; status: 'aberta'|'encerrada' }
interface Aviso  { tag: string; data: string; titulo: string; texto: string }
interface Foto   { legenda: string; src: string }

const STORAGE_KEYS = {
  equipes: 'bdf_equipes',
  tarefas: 'bdf_tarefas',
  avisos:  'bdf_avisos',
  fotos:   'bdf_fotos',
}

const EQUIPES_DEFAULT: Equipe[] = [
  { nome: 'Equipe Ouro',     cor: '#fbbf24', pts: 0 },
  { nome: 'Equipe Prata',    cor: '#d1d5db', pts: 0 },
  { nome: 'Equipe Bronze',   cor: '#cd7f32', pts: 0 },
  { nome: 'Equipe Azul',     cor: '#2952cc', pts: 0 },
  { nome: 'Equipe Vermelha', cor: '#e02020', pts: 0 },
]

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export default function Professores() {
  const { isAuth, logout } = useAuth()
  const [mounted, setMounted]   = useState(false)
  const [aba, setAba]           = useState<Aba>('placar')
  const [toast, setToast]       = useState('')

  // Estado persistido
  const [equipes, setEquipes]   = useState<Equipe[]>(EQUIPES_DEFAULT)
  const [tarefas, setTarefas]   = useState<Tarefa[]>([])
  const [avisos,  setAvisos]    = useState<Aviso[]>([])
  const [fotos,   setFotos]     = useState<Foto[]>([])

  // Campos do formulário
  const [tTipo,   setTTipo]     = useState<'teorica'|'pratica'>('teorica')
  const [tNum,    setTNum]      = useState('')
  const [tTitulo, setTTitulo]   = useState('')
  const [tDesc,   setTDesc]     = useState('')
  const [tPts,    setTPts]      = useState('1000')
  const [tStatus, setTStatus]   = useState<'aberta'|'encerrada'>('aberta')
  const [aTag,    setATag]      = useState('Oficial')
  const [aData,   setAData]     = useState('')
  const [aTitulo, setATitulo]   = useState('')
  const [aTexto,  setATexto]    = useState('')
  const [fLegenda,setFLegenda]  = useState('')
  const [sheetId, setSheetId]   = useState('')
  const [syncStatus, setSyncStatus] = useState('')

  // Carrega tudo do localStorage ao montar
  useEffect(() => {
    setMounted(true)
    setEquipes(load(STORAGE_KEYS.equipes, EQUIPES_DEFAULT))
    setTarefas(load(STORAGE_KEYS.tarefas, []))
    setAvisos(load(STORAGE_KEYS.avisos,   []))
    setFotos(load(STORAGE_KEYS.fotos,     []))
    setAData(new Date().toISOString().slice(0,10))
    setSheetId(localStorage.getItem('bdf_sheet_id') || '')
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }, [])

  // ── Equipes ──
  function updateEquipe(i: number, field: keyof Equipe, val: string|number) {
    const nova = equipes.map((e,idx) => idx===i ? {...e,[field]:val} : e)
    setEquipes(nova)
  }

  function salvarEquipes() {
    save(STORAGE_KEYS.equipes, equipes)
    showToast('✓ Placar salvo!')
  }

  function addEquipe() {
    setEquipes([...equipes, { nome: 'Nova Equipe', cor: '#888888', pts: 0 }])
  }

  function removeEquipe(i: number) {
    const nova = equipes.filter((_,idx)=>idx!==i)
    setEquipes(nova)
    save(STORAGE_KEYS.equipes, nova)
  }

  // ── Sync Google Sheets ──
  async function syncSheets() {
    if (!sheetId) { showToast('Cole o ID da planilha primeiro!'); return }
    localStorage.setItem('bdf_sheet_id', sheetId)
    setSyncStatus('Sincronizando...')
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Placar!A2:C?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`
      const res  = await fetch(url)
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const rows: string[][] = data.values || []
      const nova: Equipe[] = rows.map(r => ({
        nome: r[0] || 'Equipe',
        cor:  r[1] || '#888888',
        pts:  parseInt(r[2]) || 0,
      }))
      setEquipes(nova)
      save(STORAGE_KEYS.equipes, nova)
      setSyncStatus('✓ Sincronizado!')
      showToast('✓ Placar importado da planilha!')
    } catch(e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido'
      setSyncStatus('Erro: ' + msg)
      showToast('Erro ao sincronizar: ' + msg)
    }
    setTimeout(()=>setSyncStatus(''), 4000)
  }

  // ── Tarefas ──
  function publicarTarefa() {
    if (!tTitulo.trim()) { showToast('Preencha o título!'); return }
    const nova: Tarefa = {
      tipo: tTipo,
      num:  tNum || String(tarefas.length+1).padStart(2,'0'),
      titulo: tTitulo, desc: tDesc,
      pts1: parseInt(tPts)||1000,
      status: tStatus,
    }
    const lista = [...tarefas, nova]
    setTarefas(lista)
    save(STORAGE_KEYS.tarefas, lista)
    setTTitulo(''); setTDesc(''); setTNum('')
    showToast('✓ Tarefa publicada!')
  }

  function deleteTarefa(i: number) {
    const lista = tarefas.filter((_,idx)=>idx!==i)
    setTarefas(lista); save(STORAGE_KEYS.tarefas, lista)
    showToast('Tarefa removida.')
  }

  function toggleTarefa(i: number) {
    const lista = tarefas.map((t,idx)=>idx===i?{...t,status:t.status==='aberta'?'encerrada' as const:'aberta' as const}:t)
    setTarefas(lista); save(STORAGE_KEYS.tarefas, lista)
  }

  // ── Avisos ──
  function publicarAviso() {
    if (!aTitulo.trim()) { showToast('Preencha o título!'); return }
    const lista = [...avisos, { tag:aTag, data:aData, titulo:aTitulo, texto:aTexto }]
    setAvisos(lista); save(STORAGE_KEYS.avisos, lista)
    setATitulo(''); setATexto('')
    showToast('✓ Aviso publicado!')
  }

  function deleteAviso(i: number) {
    const lista = avisos.filter((_,idx)=>idx!==i)
    setAvisos(lista); save(STORAGE_KEYS.avisos, lista)
    showToast('Aviso removido.')
  }

  // ── Fotos ──
  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2*1024*1024) { showToast('Foto muito grande! Máx 2MB.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const lista = [...fotos, { src: ev.target?.result as string, legenda: fLegenda }]
      setFotos(lista); save(STORAGE_KEYS.fotos, lista)
      setFLegenda(''); e.target.value = ''
      showToast('✓ Foto adicionada!')
    }
    reader.readAsDataURL(file)
  }

  function deleteFoto(i: number) {
    const lista = fotos.filter((_,idx)=>idx!==i)
    setFotos(lista); save(STORAGE_KEYS.fotos, lista)
    showToast('Foto removida.')
  }

  if (!mounted) return null

  if (!isAuth) {
    return (
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
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Área dos Professores</h1>
        <p className="page-sub">Batalha dos Farroups 2026</p>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.area}>
        <div className={styles.tabs}>
          {(['placar','tarefa','aviso','fotos'] as Aba[]).map(t=>(
            <button key={t} className={`${styles.tab} ${aba===t?styles.tabActive:''}`} onClick={()=>setAba(t)}>
              {{'placar':'🏆 Placar','tarefa':'📋 Tarefas','aviso':'📢 Avisos','fotos':'🖼️ Fotos'}[t]}
            </button>
          ))}
        </div>

        {/* ── PLACAR ── */}
        {aba==='placar' && (
          <div className={styles.panel}>
            {/* Google Sheets sync */}
            <div className={styles.card}>
              <h3 className={styles.cardHead}>🔗 Sincronizar com Google Sheets</h3>
              <p className={styles.cardDesc}>
                Crie uma planilha com a aba <code>Placar</code> e colunas: <code>A=Nome</code> · <code>B=Cor (hex)</code> · <code>C=Pontos</code>. Deixe a planilha pública (qualquer pessoa com o link pode ver) e cole o ID aqui.
              </p>
              <div className={styles.sheetRow}>
                <input
                  type="text"
                  placeholder="ID da planilha (ex: 1BxiMVs0XRA...)"
                  value={sheetId}
                  onChange={e=>setSheetId(e.target.value)}
                  className={styles.sheetInput}
                />
                <button className="btn-primary btn-sm" onClick={syncSheets}>Importar</button>
              </div>
              {syncStatus && <p className={styles.syncStatus}>{syncStatus}</p>}
              <p className={styles.sheetHint}>
                O ID da planilha é a parte da URL entre <code>/d/</code> e <code>/edit</code>
              </p>
            </div>

            {/* Tabela de equipes */}
            <div className={styles.card}>
              <h3 className={styles.cardHead}>Editar Placar Manualmente</h3>
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
                <button className="btn-primary btn-sm" onClick={salvarEquipes}>💾 Salvar Placar</button>
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
                <div className={styles.field}>
                  <label>Tipo</label>
                  <select value={tTipo} onChange={e=>setTTipo(e.target.value as 'teorica'|'pratica')}>
                    <option value="teorica">Teórica</option>
                    <option value="pratica">Prática</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Número</label>
                  <input type="text" placeholder="01" value={tNum} onChange={e=>setTNum(e.target.value)}/>
                </div>
              </div>
              <div className={styles.field}>
                <label>Título</label>
                <input type="text" placeholder="Título da tarefa" value={tTitulo} onChange={e=>setTTitulo(e.target.value)}/>
              </div>
              <div className={styles.field}>
                <label>Descrição</label>
                <textarea placeholder="Descreva a tarefa..." value={tDesc} onChange={e=>setTDesc(e.target.value)}/>
              </div>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>Pontos (1º lugar)</label>
                  <input type="number" value={tPts} onChange={e=>setTPts(e.target.value)}/>
                </div>
                <div className={styles.field}>
                  <label>Status</label>
                  <select value={tStatus} onChange={e=>setTStatus(e.target.value as 'aberta'|'encerrada')}>
                    <option value="aberta">Aberta</option>
                    <option value="encerrada">Encerrada</option>
                  </select>
                </div>
              </div>
              <button className="btn-primary btn-sm" onClick={publicarTarefa}>Publicar Tarefa</button>
            </div>

            {tarefas.length>0 && (
              <div className={styles.card}>
                <h3 className={styles.cardHead}>Tarefas Publicadas ({tarefas.length})</h3>
                <div className={styles.itemList}>
                  {tarefas.map((t,i)=>(
                    <div key={i} className={styles.itemRow}>
                      <span className={`${styles.badge} ${t.tipo==='pratica'?styles.badgePratica:styles.badgeTeorica}`}>
                        {t.tipo==='pratica'?'Prática':'Teórica'}
                      </span>
                      <div className={styles.itemInfo}>
                        <div className={styles.itemTitle}>{t.titulo}</div>
                        <div className={styles.itemSub}>#{t.num} · {t.pts1} pts · <span style={{color:t.status==='aberta'?'#4ade80':'#888'}}>{t.status}</span></div>
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

        {/* ── AVISOS ── */}
        {aba==='aviso' && (
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.cardHead}>Publicar Aviso</h3>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>Categoria</label>
                  <select value={aTag} onChange={e=>setATag(e.target.value)}>
                    {['Oficial','Regras','Prazo','Gabarito','Aviso'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Data</label>
                  <input type="date" value={aData} onChange={e=>setAData(e.target.value)}/>
                </div>
              </div>
              <div className={styles.field}>
                <label>Título</label>
                <input type="text" placeholder="Título do aviso" value={aTitulo} onChange={e=>setATitulo(e.target.value)}/>
              </div>
              <div className={styles.field}>
                <label>Texto</label>
                <textarea placeholder="Conteúdo do aviso..." value={aTexto} onChange={e=>setATexto(e.target.value)}/>
              </div>
              <button className="btn-primary btn-sm" onClick={publicarAviso}>Publicar Aviso</button>
            </div>

            {avisos.length>0 && (
              <div className={styles.card}>
                <h3 className={styles.cardHead}>Avisos Publicados ({avisos.length})</h3>
                <div className={styles.itemList}>
                  {[...avisos].reverse().map((a,ri)=>{
                    const i = avisos.length-1-ri
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
              <p className={styles.cardDesc}>Máximo 2MB por foto. As fotos ficam salvas no navegador.</p>
              <div className={styles.field}>
                <label>Legenda</label>
                <input type="text" placeholder="Ex: Abertura da Batalha 2026" value={fLegenda} onChange={e=>setFLegenda(e.target.value)}/>
              </div>
              <div className={styles.field}>
                <label>Imagem (máx 2MB)</label>
                <input type="file" accept="image/*" onChange={handleFoto} className={styles.fileInput}/>
              </div>
            </div>

            {fotos.length>0 && (
              <div className={styles.card}>
                <h3 className={styles.cardHead}>Fotos na Galeria ({fotos.length})</h3>
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

        <div style={{paddingTop:'1.5rem', borderTop:'1px solid var(--border)', marginTop:'1rem'}}>
          <button className="btn-ghost btn-sm" onClick={logout}>Sair da área administrativa</button>
        </div>
      </div>
    </>
  )
}
