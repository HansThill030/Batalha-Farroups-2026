import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sheetId = searchParams.get('sheetId') || ''
  const apiKey  = searchParams.get('apiKey')  || process.env.GOOGLE_API_KEY || ''

  if (!sheetId) {
    return NextResponse.json({ error: 'sheetId é obrigatório' }, { status: 400 })
  }
  if (!apiKey) {
    return NextResponse.json({ error: 'apiKey não configurada' }, { status: 400 })
  }

  try {
    // 1. Descobre o nome das abas da planilha
    const metaRes  = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}&fields=sheets.properties.title`,
      { cache: 'no-store' }
    )
    const metaJson = await metaRes.json()

    if (metaJson.error) {
      return NextResponse.json(
        { error: `Google Sheets: ${metaJson.error.message}` },
        { status: 400 }
      )
    }

    const abas: string[] = (metaJson.sheets || []).map(
      (s: { properties: { title: string } }) => s.properties.title
    )

    // 2. Tenta cada aba possível até achar dados
    const tentativas = ['Placar', 'placar', ...abas]
    let equipes: { nome: string; cor: string; pts: number }[] = []

    for (const aba of tentativas) {
      const range = `${encodeURIComponent(aba)}!A2:C`
      const dataRes  = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`,
        { cache: 'no-store' }
      )
      const dataJson = await dataRes.json()

      if (!dataJson.error && Array.isArray(dataJson.values) && dataJson.values.length > 0) {
        equipes = (dataJson.values as string[][])
          .filter(r => r[0])
          .map(r => ({
            nome: r[0] || 'Equipe',
            cor:  r[1] || '#888888',
            pts:  parseInt(r[2]) || 0,
          }))
          .sort((a, b) => b.pts - a.pts)
        break
      }
    }

    if (equipes.length === 0) {
      return NextResponse.json(
        { error: `Nenhuma aba com dados encontrada. Abas disponíveis: ${abas.join(', ')}` },
        { status: 404 }
      )
    }

    return NextResponse.json({ equipes, abas })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erro ao buscar planilha' },
      { status: 500 }
    )
  }
}
