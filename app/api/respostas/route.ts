import { NextResponse } from 'next/server'
import { lerAbaFlex, escreverLinha, atualizarLinha } from '@/lib/sheets'

const NOMES = ['Respostas','respostas','Responses']

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const tarefaId = searchParams.get('tarefaId')
    const { rows } = await lerAbaFlex(NOMES, 'A2:G')
    const respostas = rows
      .filter(r => r[0])
      .map((r, idx) => ({
        linha:     idx + 2,
        id:        r[0],
        tarefaId:  r[1],
        turma:     r[2],
        texto:     r[3] || '',
        enviadaEm: r[4] || '',
        status:    r[5] || 'pendente',
        pts:       parseInt(r[6]) || 0,
      }))
      .filter(r => !tarefaId || r.tarefaId === tarefaId)
    return NextResponse.json(respostas)
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Verifica se turma já respondeu esta tarefa
    const { rows } = await lerAbaFlex(NOMES, 'A2:G')
    const jaRespondeu = rows.some(r => r[1] === body.tarefaId && r[2] === body.turma)
    if (jaRespondeu) return NextResponse.json({ error: 'Sua turma já respondeu esta tarefa.' }, { status: 409 })

    const id  = Date.now().toString()
    const now = new Date().toISOString()
    await escreverLinha('Respostas', [id, body.tarefaId, body.turma, body.texto, now, 'pendente', '0'])
    return NextResponse.json({ ok: true, id })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro' }, { status: 500 })
  }
}

// Corrigir resposta e atualizar pontuação
export async function PATCH(req: Request) {
  try {
    const { linha, status, turma, tarefaId } = await req.json()

    // Busca todas respostas dessa tarefa para calcular posição
    const { rows } = await lerAbaFlex(NOMES, 'A2:G')
    const respostasTask = rows.filter(r => r[1] === tarefaId && r[5] === 'correta')
    const pos = respostasTask.length // quantas já foram marcadas corretas antes desta

    // Tabela de pontos por posição
    const tabelaPts = [1000, 700, 500, 300]
    const pts = status === 'correta' ? (tabelaPts[Math.min(pos, 3)]) : 0

    await atualizarLinha('Respostas', linha, [
      rows[linha-2]?.[0] || '', tarefaId, turma,
      rows[linha-2]?.[3] || '', rows[linha-2]?.[4] || '',
      status, String(pts)
    ])

    // Se correta, adicionar pontos ao placar
    if (status === 'correta' && pts > 0) {
      // Busca placar atual e encontra a equipe da turma
      const { rows: placarRows } = await lerAbaFlex(['Placar'], 'A2:C')
      const novosPlacar = placarRows.map(r => {
        // Mapeia turma -> equipe (9A -> primeira equipe, etc.)
        // Por padrão usa o nome da turma se não achar mapeamento
        return r
      })
      // Retorna pts para o frontend atualizar o placar manualmente
    }

    return NextResponse.json({ ok: true, pts })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro' }, { status: 500 })
  }
}
