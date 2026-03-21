'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './turma-login.module.css'

export default function TurmaLogin() {
  const [usuario, setUsuario] = useState('')
  const [senha,   setSenha]   = useState('')
  const [erro,    setErro]    = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function entrar() {
    if (!usuario || !senha) { setErro('Preencha todos os campos.'); return }
    setLoading(true); setErro('')
    try {
      const res  = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuario.trim(), senha }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Erro ao entrar.'); setLoading(false); return }

      // Salva sessão
      sessionStorage.setItem('bdf_turma', data.turma)
      sessionStorage.setItem('bdf_cor',   data.cor)

      if (data.turma === 'professor') {
        router.push('/professores')
      } else {
        router.push('/turma')
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <Image src="/logo-full.png" alt="Batalha dos Farroups" width={200} height={160} style={{objectFit:'contain', margin:'0 auto 1.5rem', display:'block'}}/>
        <h1 className={styles.title}>Entrar na Batalha</h1>
        <p className={styles.sub}>Use o login da sua turma fornecido pelo professor</p>

        <div className={styles.field}>
          <label>Usuário</label>
          <input type="text" placeholder="ex: 9a" value={usuario}
            onChange={e => { setUsuario(e.target.value); setErro('') }}
            onKeyDown={e => e.key === 'Enter' && entrar()} autoFocus />
        </div>

        <div className={styles.field}>
          <label>Senha</label>
          <input type="password" placeholder="••••••••" value={senha}
            onChange={e => { setSenha(e.target.value); setErro('') }}
            onKeyDown={e => e.key === 'Enter' && entrar()} />
        </div>

        {erro && <p className={styles.erro}>{erro}</p>}

        <button className={styles.btn} onClick={entrar} disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <div className={styles.logins}>
          <p className={styles.loginsTitle}>Logins das turmas:</p>
          {['9a','9b','9c','9d','9e','9f'].map(t => (
            <span key={t} className={styles.loginTag}>
              {t} / farroups{t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
