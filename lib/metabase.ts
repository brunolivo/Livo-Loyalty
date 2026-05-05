const METABASE_URL = process.env.METABASE_URL!
const METABASE_API_KEY = process.env.METABASE_API_KEY
const METABASE_USERNAME = process.env.METABASE_USERNAME
const METABASE_PASSWORD = process.env.METABASE_PASSWORD
const DATABASE_ID = 2

async function getAuthHeaders(): Promise<Record<string, string>> {
  if (METABASE_API_KEY) {
    return { 'x-api-key': METABASE_API_KEY }
  }
  const res = await fetch(`${METABASE_URL}/api/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: METABASE_USERNAME, password: METABASE_PASSWORD }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Metabase auth failed: ${res.status}`)
  const data = await res.json()
  return { 'X-Metabase-Session': data.id }
}

export async function executeQuery(sql: string): Promise<Record<string, unknown>[]> {
  const authHeaders = await getAuthHeaders()
  const res = await fetch(`${METABASE_URL}/api/dataset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify({
      database: DATABASE_ID,
      type: 'native',
      native: { query: sql },
    }),
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`Metabase query failed: ${res.status}`)
  const data = await res.json()
  if (data.error) throw new Error(`Metabase query error: ${data.error}`)
  const cols: string[] = data.data.cols.map((c: { name: string }) => c.name)
  return data.data.rows.map((row: unknown[]) =>
    Object.fromEntries(row.map((val, i) => [cols[i], val]))
  )
}
