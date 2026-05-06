import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/metabase'

// ─── Date condition builder ────────────────────────────────────────────────────
const VALID_PERIODS = new Set(['week', 'month', 'quarter', 'year', 'custom'])
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function dateCond(period: string, from: string | null, to: string | null): string {
  switch (period) {
    case 'week':    return `psc.start_time_utc >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    case 'month':   return `psc.start_time_utc >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`
    case 'quarter': return `psc.start_time_utc >= DATE_SUB(NOW(), INTERVAL 3 MONTH)`
    case 'custom':
      if (from && to && DATE_RE.test(from) && DATE_RE.test(to)) {
        return `psc.start_time_utc BETWEEN '${from} 00:00:00' AND '${to} 23:59:59'`
      }
      // fallthrough to default
      return `psc.start_time_utc >= DATE_SUB(NOW(), INTERVAL 12 MONTH)`
    default:
      return `psc.start_time_utc >= DATE_SUB(NOW(), INTERVAL 12 MONTH)`
  }
}

// ─── SQL builders (period-sensitive) ──────────────────────────────────────────
const leaderboardSQL = (dc: string) => `
SELECT
  pp.category_code,
  psc.professional_id,
  u.first_name,
  u.last_name,
  COUNT(psc.id)                         AS shifts_completed,
  ROUND(SUM(psc.total_payment), 2)      AS total_earned,
  ROUND(AVG(psc.total_payment), 2)      AS avg_per_shift,
  COUNT(psc.id) * 10                    AS livo_points,
  SUM(CASE WHEN DAYOFWEEK(psc.start_time_utc) IN (1,7) THEN 1 ELSE 0 END) AS weekend_shifts,
  SUM(CASE WHEN HOUR(psc.start_time_utc) >= 22 OR HOUR(psc.start_time_utc) < 6 THEN 1 ELSE 0 END) AS night_shifts,
  COUNT(DISTINCT psc.facility_shift_id) AS unique_facilities
FROM professional_shift_claim psc
JOIN professional_profile pp ON pp.professional_id = psc.professional_id
JOIN user u ON u.id = psc.professional_id
WHERE psc.status = 'APPROVED'
  AND pp.category_code IN ('ENF', 'TCAE', 'DOC')
  AND ${dc}
GROUP BY pp.category_code, psc.professional_id, u.first_name, u.last_name
ORDER BY pp.category_code, shifts_completed DESC
LIMIT 500
`

const statsSQL = (dc: string) => `
SELECT
  pp.category_code,
  COUNT(DISTINCT psc.professional_id) AS active_pros,
  COUNT(psc.id)                       AS total_shifts,
  ROUND(AVG(psc.total_payment), 2)    AS avg_payment_per_shift,
  ROUND(SUM(psc.total_payment), 2)    AS total_earnings
FROM professional_shift_claim psc
JOIN professional_profile pp ON pp.professional_id = psc.professional_id
WHERE psc.status = 'APPROVED'
  AND pp.category_code IN ('ENF', 'TCAE', 'DOC')
  AND ${dc}
GROUP BY pp.category_code
`

const urgentStatsSQL = (dc: string) => `
SELECT
  pp.category_code,
  COUNT(psc.id)                       AS total_urgent,
  COUNT(DISTINCT psc.professional_id) AS pros_covering,
  ROUND(AVG(psc.total_payment), 2)    AS avg_pay,
  ROUND(SUM(psc.total_payment), 2)    AS total_earnings,
  SUM(CASE WHEN psc.livo_bonus > 0 THEN 1 ELSE 0 END) AS shifts_with_bonus
FROM professional_shift_claim psc
JOIN professional_profile pp ON pp.professional_id = psc.professional_id
WHERE psc.status = 'APPROVED'
  AND pp.category_code IN ('ENF', 'TCAE', 'DOC')
  AND psc.urgent_shift_claim = 1
  AND ${dc}
GROUP BY pp.category_code
`

const urgentSQL = (dc: string) => `
SELECT
  pp.category_code,
  psc.professional_id,
  u.first_name,
  u.last_name,
  COUNT(psc.id)                            AS urgent_shifts,
  ROUND(SUM(psc.total_payment), 2)         AS urgent_earnings,
  ROUND(AVG(psc.total_payment), 2)         AS avg_per_urgent,
  ROUND(AVG(TIMESTAMPDIFF(HOUR, psc.db_created_time, psc.start_time_utc)), 1) AS avg_notice_hours,
  SUM(CASE WHEN psc.livo_bonus > 0 THEN 1 ELSE 0 END) AS shifts_with_bonus
FROM professional_shift_claim psc
JOIN professional_profile pp ON pp.professional_id = psc.professional_id
JOIN user u ON u.id = psc.professional_id
WHERE psc.status = 'APPROVED'
  AND pp.category_code IN ('ENF', 'TCAE', 'DOC')
  AND psc.urgent_shift_claim = 1
  AND ${dc}
GROUP BY pp.category_code, psc.professional_id, u.first_name, u.last_name
ORDER BY pp.category_code, urgent_shifts DESC
LIMIT 400
`

// ─── Fixed queries (period-independent) ───────────────────────────────────────
// Consistent = always 12-month window (it's a standing status, not a period metric)
const CONSISTENT_SQL = `
SELECT
  pp.category_code,
  psc.professional_id,
  u.first_name,
  u.last_name,
  COUNT(psc.id) AS total_shifts,
  ROUND(DATEDIFF(NOW(), MIN(psc.start_time_utc)) / 7, 1) AS weeks_active,
  ROUND(COUNT(psc.id) / (DATEDIFF(NOW(), MIN(psc.start_time_utc)) / 7), 2) AS avg_weekly_shifts
FROM professional_shift_claim psc
JOIN professional_profile pp ON pp.professional_id = psc.professional_id
JOIN user u ON u.id = psc.professional_id
WHERE psc.status = 'APPROVED'
  AND pp.category_code IN ('ENF', 'TCAE', 'DOC')
  AND psc.start_time_utc >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY pp.category_code, psc.professional_id, u.first_name, u.last_name
HAVING avg_weekly_shifts >= 2 AND weeks_active >= 4
ORDER BY pp.category_code, avg_weekly_shifts DESC
`

// Monthly challenges = always current calendar month
const CHALLENGES_SQL = `
SELECT
  pp.category_code,
  COUNT(psc.id) AS shifts_this_month,
  COUNT(DISTINCT psc.professional_id) AS pros_active_this_month,
  SUM(CASE WHEN DAYOFWEEK(psc.start_time_utc) IN (1,7) THEN 1 ELSE 0 END) AS weekend_shifts_month
FROM professional_shift_claim psc
JOIN professional_profile pp ON pp.professional_id = psc.professional_id
WHERE psc.status = 'APPROVED'
  AND pp.category_code IN ('ENF', 'TCAE', 'DOC')
  AND psc.start_time_utc >= DATE_FORMAT(NOW(), '%Y-%m-01')
GROUP BY pp.category_code
`

const MONTHLY_PROS_SQL = `
SELECT
  pp.category_code,
  psc.professional_id,
  u.first_name,
  u.last_name,
  COUNT(psc.id) AS shifts_this_month,
  SUM(CASE WHEN DAYOFWEEK(psc.start_time_utc) IN (1,7) THEN 1 ELSE 0 END) AS weekend_shifts_month,
  SUM(CASE WHEN HOUR(psc.start_time_utc) >= 22 OR HOUR(psc.start_time_utc) < 6 THEN 1 ELSE 0 END) AS night_shifts_month,
  COUNT(DISTINCT psc.facility_shift_id) AS facilities_this_month
FROM professional_shift_claim psc
JOIN professional_profile pp ON pp.professional_id = psc.professional_id
JOIN user u ON u.id = psc.professional_id
WHERE psc.status = 'APPROVED'
  AND pp.category_code IN ('ENF', 'TCAE', 'DOC')
  AND psc.start_time_utc >= DATE_FORMAT(NOW(), '%Y-%m-01')
GROUP BY pp.category_code, psc.professional_id, u.first_name, u.last_name
ORDER BY pp.category_code, shifts_this_month DESC
`

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try { return await promise } catch { return fallback }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const rawPeriod = searchParams.get('period') ?? 'year'
  const period    = VALID_PERIODS.has(rawPeriod) ? rawPeriod : 'year'
  const from      = searchParams.get('from')
  const to        = searchParams.get('to')

  const dc = dateCond(period, from, to)

  try {
    const [leaderboard, stats, challenges, consistent, monthlyPros, urgentStats, urgent] = await Promise.all([
      executeQuery(leaderboardSQL(dc)),
      executeQuery(statsSQL(dc)),
      safe(executeQuery(CHALLENGES_SQL), []),
      safe(executeQuery(CONSISTENT_SQL), []),
      safe(executeQuery(MONTHLY_PROS_SQL), []),
      safe(executeQuery(urgentStatsSQL(dc)), []),
      safe(executeQuery(urgentSQL(dc)), []),
    ])
    return NextResponse.json({
      leaderboard, stats, challenges, consistent, monthlyPros, urgentStats, urgent,
      period, from, to,
      fetchedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Loyalty API error:', err)
    return NextResponse.json({ error: 'Failed to fetch loyalty data' }, { status: 500 })
  }
}
