'use client'
import { useAuth } from '@/components/LoginModal'
import { useEffect, useState } from 'react'
import styles from './professores.module.css'

type Aba = 'placar' | 'tarefa' | 'aviso' | 'fotos'

interface Equipe { nome: string; cor: string; pts: number }
interface Tarefa { tipo: 'teorica' | 'pratica'; num: string; titulo: string; desc: string; pts1: number; status: 'aberta' | 'encerrada' }
interface Aviso { tag: string; data: string; titulo: string; texto: string }
interface Foto { legenda: string; src: string }

const EQUIPES_INICIAIS: Equipe[] = [
  { nome: 'Equipe Ouro',     cor: '#fbbf24', pts: 4200 },
  { nome: 'Equipe Prata',    cor: '#d1d5db', pts: 3850 },
  { nome: 'Equipe Bronze',   cor: '#cd7f32', pts: 3300 },
  { nome: 'Equipe Azul',     cor: '#2952cc', pts: 2900 },
  { nome: 'Equipe Vermelha', cor: '#e02020', pts: 2400 },
]

export default function Professores() {
  const { isAuth, logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [aba, setAba] = useState<Aba>('placar')

  // Estado do placar
  const [equipes, setEquipes] = useState<Equipe[]>(EQUIPES_INICIAIS)
  const [toast, setToast] = useState('')

  // Estado de tarefas
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [tTipo, setTTipo] = useState<'teorica' | 'pratica'>('teorica')
  const [tNum, setTNum] = useState('')
  const [tTitulo, setTTitulo] = useState('')
  const [tDesc, setTDesc] = useState('')
  const [tPts, setTPts] = useState('1000')
  const [tStatus, setTStatus] = useState<'aberta' | 'encerrada'>('aberta')

  // Estado de avisos
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [aTag, setATag] = useState('Oficial')
  const [aData, setAData] = useState('')
  const [aTitulo, setATitulo] = useState('')
  const [aTexto, setATexto] = useState('')

  // Estado de fotos
  const [fotos, setFotos] = useState<Foto[]>([])
  const [fLegenda, setFLegenda] = useState('')

  useEffect(() => {
    setMounted(true)
    setAData(new Date().toISOString().slice(0, 10))
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function salvarPlacar() {
    showToast('✓ Placar atualizado!')
  }

  function addEquipe() {
    setEquipes([...equipes, { nome: 'Nova Equipe', cor: '#888888', pts: 0 }])
  }

  function removeEquipe(i: number) {
    setEquipes(equipes.filter((_, idx) => idx !== i))
  }

  function updateEquipe(i: number, field: keyof Equipe, value: string | number) {
    const nova = [...equipes]
    nova[i] = { ...nova[i], [field]: value }
    setEquipes(nova)
  }

  function publicarTarefa() {
    if (!tTitulo.trim()) { showToast('Preencha o título!'); return }
    setTarefas([...tarefas, {
      tipo: tTipo,
      num: tNum || String(tarefas.length + 1).padStart(2, '0'),
      titulo: tTitulo, desc: tDesc,
      pts1: parseInt(tPts) || 1000,
      status: tStatus,
    }])
    setTTitulo(''); setTDesc(''); setTNum('')
    showToast('✓ Tarefa publicada!')
  }

  function deleteTarefa(i: number) {
    setTarefas(tarefas.filter((_, idx) => idx !== i))
    showToast('Tarefa removida.')
  }

  function toggleTarefa(i: number) {
    const nova = [...tarefas]
    nova[i].status = nova[i].status === 'aberta' ? 'encerrada' : 'aberta'
    setTarefas(nova)
  }

  function publicarAviso() {
    if (!aTitulo.trim()) { showToast('Preencha o título!'); return }
    setAvisos([...avisos, { tag: aTag, data: aData, titulo: aTitulo, texto: aTexto }])
    setATitulo(''); setATexto('')
    showToast('✓ Aviso publicado!')
  }

  function deleteAviso(i: number) {
    setAvisos(avisos.filter((_, idx) => idx !== i))
    showToast('Aviso removido.')
  }

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setFotos([...fotos, { src: ev.target?.result as string, legenda: fLegenda }])
      setFLegenda('')
      e.target.value = ''
      showToast('✓ Foto adicionada!')
    }
    reader.readAsDataURL(file)
  }

  function deleteFoto(i: number) {
    setFotos(fotos.filter((_, idx) => idx !== i))
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
          <p>Clique em <strong>&quot;Área do Professor&quot;</strong> no menu superior para fazer login.</p>
          <p className={styles.hint}>Usuário: <code>professor</code> · Senha: <code>2026</code></p>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Área dos Professores</h1>
        <p className="page-sub">Gerencie a Batalha dos Farroups 2026</p>
      </div>

      {/* TOAST */}
      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.area}>
        {/* TABS */}
        <div className={styles.tabs}>
          {(['placar', 'tarefa', 'aviso', 'fotos'] as Aba[]).map(t => (
            <button key={t} className={`${styles.tab} ${aba === t ? styles.tabActive : ''}`} onClick={() => setAba(t)}>
              {{ placar: '🏆 Placar', tarefa: '📋 Tarefas', aviso: '📢 Avisos', fotos: '🖼️ Fotos' }[t]}
            </button>
          ))}
        </div>

        {/* ── PLACAR ── */}
        {aba === 'placar' && (
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.cardHead}>Atualizar Pontuação</h3>
              <table className={styles.table}>
                <thead><tr><th>Cor</th><th>Equipe</th><th>Pontos</th><th></th></tr></thead>
                <tbody>
                  {equipes.map((e, i) => (
                    <tr key={i}>
                      <td><input type="color" value={e.cor} onChange={ev => updateEquipe(i, 'cor', ev.target.value)} className={styles.colorPicker} /></td>
                      <td><input type="text" value={e.nome} onChange={ev => updateEquipe(i, 'nome', ev.target.value)} className={styles.textInput} /></td>
                      <td><input type="number" value={e.pts} onChange={ev => updateEquipe(i, 'pts', parseInt(ev.target.value) || 0)} className={styles.numInput} /></td>
                      <td><button className={`btn-danger btn-sm`} onClick={() => removeEquipe(i)}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.rowBtns}>
                <button className="btn-primary btn-sm" onClick={salvarPlacar}>Salvar Placar</button>
                <button className="btn-ghost btn-sm" onClick={addEquipe}>+ Equipe</button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAREFAS ── */}
        {aba === 'tarefa' && (
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.cardHead}>Publicar Nova Tarefa</h3>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>Tipo</label>
                  <select value={tTipo} onChange={e => setTTipo(e.target.value as 'teorica' | 'pratica')}>
                    <option value="teorica">Teórica</option>
                    <option value="pratica">Prática</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Número</label>
                  <input type="text" placeholder="01" value={tNum} onChange={e => setTNum(e.target.value)} />
                </div>
              </div>
              <div className={styles.field}>
                <label>Título</label>
                <input type="text" placeholder="Título da tarefa" value={tTitulo} onChange={e => setTTitulo(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Descrição</label>
                <textarea placeholder="Descreva a tarefa..." value={tDesc} onChange={e => setTDesc(e.target.value)} />
              </div>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>Pontos (1º lugar)</label>
                  <input type="number" value={tPts} onChange={e => setTPts(e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label>Status</label>
                  <select value={tStatus} onChange={e => setTStatus(e.target.value as 'aberta' | 'encerrada')}>
                    <option value="aberta">Aberta</option>
                    <option value="encerrada">Encerrada</option>
                  </select>
                </div>
              </div>
              <button className="btn-primary btn-sm" onClick={publicarTarefa}>Publicar Tarefa</button>
            </div>

            {tarefas.length > 0 && (
              <div className={styles.card}>
                <h3 className={styles.cardHead}>Tarefas Publicadas</h3>
                <div className={styles.itemList}>
                  {tarefas.map((t, i) => (
                    <div key={i} className={styles.itemRow}>
                      <span className={`${styles.badge} ${t.tipo === 'pratica' ? styles.badgePratica : styles.badgeTeórica}`}>
                        {t.tipo === 'pratica' ? 'Prática' : 'Teórica'}
                      </span>
                      <div className={styles.itemInfo}>
                        <div className={styles.itemTitle}>{t.titulo}</div>
                        <div className={styles.itemSub}>#{t.num} · {t.pts1} pts · {t.status}</div>
                      </div>
                      <div className={styles.itemActions}>
                        <button className="btn-ghost btn-sm" onClick={() => toggleTarefa(i)}>
                          {t.status === 'aberta' ? 'Encerrar' : 'Reabrir'}
                        </button>
                        <button className="btn-danger btn-sm" onClick={() => deleteTarefa(i)}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── AVISOS ── */}
        {aba === 'aviso' && (
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.cardHead}>Publicar Aviso</h3>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>Categoria</label>
                  <select value={aTag} onChange={e => setATag(e.target.value)}>
                    {['Oficial','Regras','Prazo','Gabarito','Aviso'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Data</label>
                  <input type="date" value={aData} onChange={e => setAData(e.target.value)} />
                </div>
              </div>
              <div className={styles.field}>
                <label>Título</label>
                <input type="text" placeholder="Título do aviso" value={aTitulo} onChange={e => setATitulo(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Texto</label>
                <textarea placeholder="Conteúdo do aviso..." value={aTexto} onChange={e => setATexto(e.target.value)} />
              </div>
              <button className="btn-primary btn-sm" onClick={publicarAviso}>Publicar Aviso</button>
            </div>

            {avisos.length > 0 && (
              <div className={styles.card}>
                <h3 className={styles.cardHead}>Avisos Publicados</h3>
                <div className={styles.itemList}>
                  {[...avisos].reverse().map((a, i) => (
                    <div key={i} className={styles.itemRow}>
                      <span className={styles.avisoTag}>{a.tag}</span>
                      <div className={styles.itemInfo}>
                        <div className={styles.itemTitle}>{a.titulo}</div>
                        <div className={styles.itemSub}>{a.data}</div>
                      </div>
                      <button className="btn-danger btn-sm" onClick={() => deleteAviso(avisos.length - 1 - i)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FOTOS ── */}
        {aba === 'fotos' && (
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.cardHead}>Adicionar Foto</h3>
              <div className={styles.field}>
                <label>Legenda</label>
                <input type="text" placeholder="Ex: Abertura da Batalha 2026" value={fLegenda} onChange={e => setFLegenda(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Imagem</label>
                <input type="file" accept="image/*" onChange={handleFoto} className={styles.fileInput} />
              </div>
            </div>

            {fotos.length > 0 && (
              <div className={styles.card}>
                <h3 className={styles.cardHead}>Fotos na Galeria</h3>
                <div className={styles.itemList}>
                  {fotos.map((f, i) => (
                    <div key={i} className={styles.itemRow}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.src} alt={f.legenda} className={styles.fotoThumb} />
                      <div className={styles.itemInfo}>
                        <div className={styles.itemTitle}>{f.legenda || 'Sem legenda'}</div>
                      </div>
                      <button className="btn-danger btn-sm" onClick={() => deleteFoto(i)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ paddingTop: '1rem' }}>
          <button className="btn-ghost btn-sm" onClick={logout}>Sair da área administrativa</button>
        </div>
      </div>
    </>
  )
}
