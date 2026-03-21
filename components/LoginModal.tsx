'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import styles from './LoginModal.module.css'

// ── Auth Context ──────────────────────────────────────────
interface AuthCtx { isAuth: boolean; login: () => void; logout: () => void }
const AuthContext = createContext<AuthCtx>({ isAuth: false, login: () => {}, logout: () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Só lê o sessionStorage depois de montar no cliente
    setIsAuth(sessionStorage.getItem('prof_auth') === 'true')
  }, [])

  const login = () => {
    sessionStorage.setItem('prof_auth', 'true')
    setIsAuth(true)
  }

  const logout = () => {
    sessionStorage.removeItem('prof_auth')
    setIsAuth(false)
  }

  // Não renderiza nada até montar — evita hydration mismatch
  if (!mounted) {
    return <AuthContext.Provider value={{ isAuth: false, login, logout }}>{children}</AuthContext.Provider>
  }

  return (
    <AuthContext.Provider value={{ isAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }

// ── Modal ─────────────────────────────────────────────────
interface Props { open: boolean; onClose: () => void }

export default function LoginModal({ open, onClose }: Props) {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const router = useRouter()
  const { login } = useAuth()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleLogin() {
    if (!usuario || !senha) { setErro('Preencha todos os campos.'); return }
    if (usuario === 'professor' && senha === '2026') {
      login()
      onClose()
      router.push('/professores')
    } else {
      setErro('Usuário ou senha incorretos.')
    }
  }

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>✕</button>
        <div className={styles.modalIcon}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.png" alt="Logo" width={48} height={48} />
        </div>
        <h2 className={styles.title}>Área do Professor</h2>
        <p className={styles.subtitle}>Login opcional — apenas para gestão</p>

        <div className={styles.field}>
          <label className={styles.label}>Usuário</label>
          <input className={styles.input} type="text" placeholder="professor"
            value={usuario} onChange={e => { setUsuario(e.target.value); setErro('') }} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Senha</label>
          <input className={styles.input} type="password" placeholder="••••••••"
            value={senha}
            onChange={e => { setSenha(e.target.value); setErro('') }}
            onKeyDown={e => { if (e.key === 'Enter') handleLogin() }} />
        </div>

        {erro && <p className={styles.erro}>{erro}</p>}

        <button className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={handleLogin}>
          Entrar
        </button>

        <p className={styles.note}>
          Não tem acesso?{' '}
          <span className={styles.noteLink} onClick={onClose}>Continuar como visitante →</span>
        </p>
      </div>
    </div>
  )
}
