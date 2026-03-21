// ── Biblioteca central para Google Sheets ──────────────────────────────────

const SHEET_ID     = process.env.GOOGLE_SHEET_ID      || ''
const API_KEY      = process.env.GOOGLE_API_KEY        || ''
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL   || ''
const PRIVATE_KEY  = (process.env.GOOGLE_PRIVATE_KEY  || '').replace(/\\n/g, '\n')

// ── LEITURA (pública, só API Key) ──────────────────────────────────────────
export async function lerAba(aba: string, range = 'A:Z'): Promise<string[][]> {
  if (!SHEET_ID || !API_KEY) return []
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(aba)}!${range}?key=${API_KEY}`
  const res  = await fetch(url, { cache: 'no-store' })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.values || []
}

// ── Detecta o nome das abas disponíveis ────────────────────────────────────
export async function listarAbas(): Promise<string[]> {
  if (!SHEET_ID || !API_KEY) return []
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?key=${API_KEY}&fields=sheets.properties.title`
  const res  = await fetch(url, { cache: 'no-store' })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return (data.sheets || []).map((s: {properties:{title:string}}) => s.properties.title)
}

// ── Lê aba tentando nomes alternativos ─────────────────────────────────────
export async function lerAbaFlex(nomes: string[], range = 'A2:Z'): Promise<{rows: string[][], aba: string}> {
  const abas = await listarAbas()
  for (const nome of nomes) {
    const aba = abas.find(a => a.toLowerCase() === nome.toLowerCase()) || nome
    try {
      const rows = await lerAba(aba, range)
      return { rows, aba }
    } catch { continue }
  }
  return { rows: [], aba: nomes[0] }
}

// ── ESCRITA com Service Account ────────────────────────────────────────────
async function getAccessToken(): Promise<string> {
  if (!CLIENT_EMAIL || !PRIVATE_KEY) throw new Error('Credenciais de escrita não configuradas. Configure GOOGLE_CLIENT_EMAIL e GOOGLE_PRIVATE_KEY.')

  const now  = Math.floor(Date.now() / 1000)
  const enc  = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64url')
  const header  = enc({ alg: 'RS256', typ: 'JWT' })
  const payload = enc({ iss: CLIENT_EMAIL, scope: 'https://www.googleapis.com/auth/spreadsheets', aud: 'https://oauth2.googleapis.com/token', exp: now + 3600, iat: now })
  const sigInput = `${header}.${payload}`

  const { createSign } = await import('crypto')
  const sign = createSign('RSA-SHA256')
  sign.update(sigInput)
  const sig = sign.sign(PRIVATE_KEY, 'base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
  const jwt = `${sigInput}.${sig}`

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })
  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) throw new Error('Falha ao obter token: ' + JSON.stringify(tokenData))
  return tokenData.access_token
}

export async function escreverLinha(aba: string, valores: string[]): Promise<void> {
  const token = await getAccessToken()
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(aba)}!A:Z:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [valores] }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
}

export async function atualizarLinha(aba: string, linha: number, valores: string[]): Promise<void> {
  const token = await getAccessToken()
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(aba)}!A${linha}:Z${linha}?valueInputOption=USER_ENTERED`
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [valores] }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
}

export async function atualizarAba(aba: string, valores: string[][]): Promise<void> {
  const token = await getAccessToken()
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(aba)}!A1:Z1000?valueInputOption=USER_ENTERED`
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: valores }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
}
