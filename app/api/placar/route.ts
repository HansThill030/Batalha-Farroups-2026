import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sheetId = searchParams.get('sheetId') || process.env.GOOGLE_SHEET_ID || ''
  const apiKey  = searchParams.get('apiKey')  || process.env.GOOGLE_API_KEY  || ''

  if (!sheetId || !apiKey) {
    return NextResponse.json({ error: 'sheetId e apiKey são obrigatórios' }, { status: 400 })
  }

  try {
    // Primeiro tenta descobrir o nome da primeira aba
    const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}&fields=sheets.properties.title`
    const metaRes = await fetch(metaUrl)
    const metaData = await metaRes.json()

    if (metaData.error) {
      return NextResponse.json({ error: metaData.error.message }, { status: 400 })
    }

    // Pega o nome da primeira aba da planilha
    const primeiraAba: string = metaData.sheets?.[0]?.properties?.title || 'Sheet1'

    // Tenta "Placar" primeiro, se falhar usa o nome da primeira aba
    const tentativas = ['Placar', primeiraAba, 'Sheet1', 'Página1']
    let rows: string[][] = []

    for (const aba of tentativas) {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(aba)}!A2:C?key=${apiKey}`
      const res = await fetch(url)
      const data = await res.json()
      if (!data.error && data.values) {
        rows = data.values
        break
      }
    }

    const equipes = rows
      .filter(r => r[0])
      .map(r => ({
        nome: r[0] || 'Equipe',
        cor:  r[1] || '#888888',
        pts:  parseInt(r[2]) || 0,
      }))
      .sort((a, b) => b.pts - a.pts)

    return NextResponse.json(equipes)
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao buscar planilha' }, { status: 500 })
  }
}
