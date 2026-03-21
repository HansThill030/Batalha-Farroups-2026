import { NextResponse } from 'next/server'

// Logins fixos das turmas — em produção, mova para variáveis de ambiente
const LOGINS: Record<string, { senha: string; turma: string; cor: string }> = {
  '9a': { senha: 'farroups9a', turma: '9A', cor: '#e02020' },
  '9b': { senha: 'farroups9b', turma: '9B', cor: '#1a3fa8' },
  '9c': { senha: 'farroups9c', turma: '9C', cor: '#16a34a' },
  '9d': { senha: 'farroups9d', turma: '9D', cor: '#d97706' },
  '9e': { senha: 'farroups9e', turma: '9E', cor: '#7c3aed' },
  '9f': { senha: 'farroups9f', turma: '9F', cor: '#0891b2' },
  // Professor
  'professor': { senha: '2026', turma: 'professor', cor: '#ffffff' },
}

export async function POST(req: Request) {
  try {
    const { usuario, senha } = await req.json()
    const login = LOGINS[usuario?.toLowerCase()]
    if (!login || login.senha !== senha) {
      return NextResponse.json({ error: 'Usuário ou senha incorretos.' }, { status: 401 })
    }
    return NextResponse.json({ ok: true, turma: login.turma, cor: login.cor })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
