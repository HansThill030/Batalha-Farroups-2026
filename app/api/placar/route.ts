import { NextResponse } from 'next/server'

const SHEET_ID = process.env.GOOGLE_SHEET_ID || ''
const API_KEY  = process.env.GOOGLE_API_KEY  || ''

// GET — lê o placar da planilha (público)
export async function GET() {
  try {
    if (!SHEET_ID || !API_KEY) {
      // Dados de exemplo se não houver credenciais configuradas
      return NextResponse.json([
        { pos: 1, nome: 'Equipe Ouro',     cor: '#fbbf24', pts: 4200 },
        { pos: 2, nome: 'Equipe Prata',    cor: '#d1d5db', pts: 3850 },
        { pos: 3, nome: 'Equipe Bronze',   cor: '#cd7f32', pts: 3300 },
        { pos: 4, nome: 'Equipe Azul',     cor: '#2952cc', pts: 2900 },
        { pos: 5, nome: 'Equipe Vermelha', cor: '#e02020', pts: 2400 },
      ])
    }

    // Lê da aba "Placar" colunas A (nome), B (cor), C (pts)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Placar!A2:C?key=${API_KEY}`
    const res = await fetch(url, { next: { revalidate: 60 } }) // cache 60s
    const data = await res.json()
    const rows: string[][] = data.values || []

    const equipes = rows
      .map((row, i) => ({
        pos: i + 1,
        nome: row[0] || `Equipe ${i + 1}`,
        cor:  row[1] || '#888888',
        pts:  parseInt(row[2]) || 0,
      }))
      .sort((a, b) => b.pts - a.pts)
      .map((e, i) => ({ ...e, pos: i + 1 }))

    return NextResponse.json(equipes)
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao buscar placar' }, { status: 500 })
  }
}
