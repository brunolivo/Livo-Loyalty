import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/metabase'

const LEADERBOARD_SQL = `
SELECT
  pp.category_code,
  psc.professional_id,
  u.first_name,
  u.last_name,
  COUNT(psc.id) as shifts_completed,
  ROUND(SUM(psc.total_payment), 2) as total_earned,
  ROUND(AVG(psc.total_payment), 2) as avg_per_shift
FROM professional_shift_claim psc
JOIN professional_profile pp ON pp.professional_id = psc.professional_id
JOIN user u ON u.id = psc.professional_id
WHERE psc.status = 'APPROVED'
  AND pp.category_code IN ('ENF', 'TCAE', 'DOC')
  AND psc.db_created_time >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY pp.category_code, psc.professional_id, u.first_name, u.last_name
ORDER BY pp.category_code, shifts_completed DESC
LIMIT 500
`

const STATS_SQL = `
SELECT
  pp.category_code,
  COUNT(DISTINCT psc.professional_id) as active_pros,
  COUNT(psc.id) as total_shifts,
  ROUND(AVG(psc.total_payment), 2) as avg_payment_per_shift,
  ROUND(SUM(psc.total_payment), 2) as total_earnings
FROM professional_shift_claim psc
JOIN professional_profile pp ON pp.professional_id = psc.professional_id
WHERE psc.status = 'APPROVED'
  AND pp.category_code IN ('ENF', 'TCAE', 'DOC')
  AND psc.db_created_time >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY pp.category_code
`

const MONTHLY_SQL = `
SELECT
  pp.category_code,
  DATE_FORMAT(psc.db_created_time, '%Y-%m') as month,
  COUNT(psc.id) as shifts,
  COUNT(DISTINCT psc.professional_id) as active_pros
FROM professional_shift_claim psc
JOIN professional_profile pp ON pp.professional_id = psc.professional_id
WHERE psc.status = 'APPROVED'
  AND pp.category_code IN ('ENF', 'TCAE', 'DOC')
  AND psc.db_created_time >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY pp.category_code, month
ORDER BY pp.category_code, month ASC
`

export async function GET() {
  try {
    const [leaderboard, stats, monthly] = await Promise.all([
      executeQuery(LEADERBOARD_SQL),
      executeQuery(STATS_SQL),
      executeQuery(MONTHLY_SQL),
    ])
    return NextResponse.json({ leaderboard, stats, monthly, fetchedAt: new Date().toISOString() })
  } catch (err) {
    console.error('Loyalty API error:', err)
    return NextResponse.json({ error: 'Failed to fetch loyalty data' }, { status: 500 })
  }
}
