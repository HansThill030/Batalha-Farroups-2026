import { NextResponse } from 'next/server'
import { lerAbaFlex, escreverLinha, atualizarAba } from '@/lib/sheets'

const NOMES = ['Tarefas','tarefas','Tasks']

export async function GET() {
  try {
    const { rows } = await lerAbaFlex(NOMES, 'A2:H')
    const tarefas = rows
      .filter(r => r[0])
      .map(r => ({
        id:      r[0],
        tipo:    r[1] || 'teorica',
        num:     r[2] || '01',
        titulo:  r[3] || '',
        desc:    r[4] || '',
        pts1:    parseInt(r[5]) || 1000,
        status:  r[6] || 'aberta',
        timer:   parseInt(r[7]) || 0,
      }))
    return NextResponse.json(tarefas)
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const id   = Date.now().toString()
    await escreverLinha('Tarefas', [
      id, body.tipo, body.num, body.titulo, body.desc,
      String(body.pts1 || 1000), body.status || 'aberta', String(body.timer || 0)
    ])
    return NextResponse.json({ ok: true, id })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { tarefas } = await req.json()
    const header = [['ID','Tipo','Num','Titulo','Desc','Pts1','Status','Timer']]
    const rows = tarefas.map((t: Record<string,unknown>) => [
      t.id, t.tipo, t.num, t.titulo, t.desc,
      String(t.pts1), t.status, String(t.timer||0)
    ])
    await atualizarAba('Tarefas', [...header, ...rows])
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro' }, { status: 500 })
  }
}
