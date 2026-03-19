'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './LoginModal.module.css'

interface Props {
  open: boolean
  onClose: () => void
}

export default function LoginModal({ open, onClose }: Props) {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleLogin() {
    if (!usuario || !senha) { setErro('Preencha todos os campos.'); return }
    // TODO: integrar com autenticação real (Firebase, Supabase, etc.)
    // Por enquanto, login simulado para protótipo
    if (usuario === 'professor' && senha === '2026') {
      localStorage.setItem('prof_auth', 'true')
      onClose()
      router.push('/professores')
    } else {
      setErro('Usuário ou senha incorretos.')
    }
  }

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>✕</button>
        <h2 className={styles.title}>Área do <span className="accent">Professor</span></h2>
        <p className={styles.subtitle}>Login opcional — apenas para gestão da batalha</p>

        <div className={styles.formGroup}>
          <label className={styles.label}>Usuário</label>
          <input
            className={styles.input}
            type="text"
            placeholder="professor@escola.com"
            value={usuario}
            onChange={(e) => { setUsuario(e.target.value); setErro('') }}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Senha</label>
          <input
            className={styles.input}
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => { setSenha(e.target.value); setErro('') }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
          />
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
