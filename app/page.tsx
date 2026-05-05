'use client'

import { useEffect, useState } from 'react'

const css = `
  .page { min-height: 100vh; background: #F2F7F9; }

  .header {
    background: #104455;
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    box-shadow: 0 2px 12px rgba(16,68,85,0.15);
  }
  .header-brand { display: flex; align-items: center; gap: 12px; }
  .header-logo {
    width: 36px; height: 36px; background: #86D2AC; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 700; color: #104455;
  }
  .header-title { color: #fff; font-size: 18px; font-weight: 600; letter-spacing: -0.3px; }
  .header-sub { color: #86D2AC; font-size: 13px; font-weight: 400; }
  .header-meta { color: rgba(255,255,255,0.5); font-size: 12px; text-align: right; }

  .container { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }
  .summary-card {
    background: #fff;
    border-radius: 16px;
    padding: 20px 24px;
    box-shadow: 0 2px 12px rgba(16,68,85,0.06);
    border-left: 4px solid #86D2AC;
  }
  .summary-card-label { font-size: 12px; color: #5a7a84; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .summary-card-value { font-size: 28px; font-weight: 700; color: #104455; line-height: 1; }
  .summary-card-sub { font-size: 12px; color: #86D2AC; margin-top: 4px; font-weight: 500; }

  .tabs { display: flex; gap: 0; margin-bottom: 24px; background: #fff; border-radius: 14px; padding: 6px; box-shadow: 0 2px 12px rgba(16,68,85,0.06); width: fit-content; }
  .tab {
    padding: 10px 28px; border-radius: 10px; cursor: pointer;
    font-size: 14px; font-weight: 500; color: #5a7a84;
    border: none; background: transparent; font-family: inherit;
    transition: all 0.15s ease;
  }
  .tab:hover { color: #104455; background: #F2F7F9; }
  .tab.active { background: #104455; color: #fff; font-weight: 600; }
  .tab-icon { margin-right: 6px; }

  .cluster-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .stat-card {
    background: #fff; border-radius: 14px; padding: 18px 20px;
    box-shadow: 0 2px 12px rgba(16,68,85,0.06);
  }
  .stat-label { font-size: 11px; color: #5a7a84; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .stat-value { font-size: 24px; font-weight: 700; color: #104455; }
  .stat-hint { font-size: 11px; color: #86D2AC; margin-top: 3px; font-weight: 500; }

  .section-title { font-size: 16px; font-weight: 600; color: #104455; margin-bottom: 16px; }

  .tiers-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
  .tier-card {
    background: #fff; border-radius: 14px; padding: 16px 18px;
    box-shadow: 0 2px 12px rgba(16,68,85,0.06);
    border-top: 3px solid var(--tier-color);
  }
  .tier-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--tier-color); margin-bottom: 8px; }
  .tier-count { font-size: 28px; font-weight: 700; color: #104455; }
  .tier-label { font-size: 11px; color: #5a7a84; margin-top: 2px; }
  .tier-threshold { font-size: 11px; color: #9db5bc; margin-top: 6px; }
  .tier-bar { height: 4px; background: #F2F7F9; border-radius: 2px; margin-top: 10px; overflow: hidden; }
  .tier-bar-fill { height: 100%; border-radius: 2px; background: var(--tier-color); transition: width 0.6s ease; }

  .leaderboard { background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(16,68,85,0.06); overflow: hidden; }
  .leaderboard-header {
    display: grid;
    grid-template-columns: 48px 1fr 120px 140px 100px;
    padding: 12px 20px;
    background: #F2F7F9;
    font-size: 11px; font-weight: 600; color: #5a7a84;
    text-transform: uppercase; letter-spacing: 0.5px;
    border-bottom: 1px solid #e8f0f3;
  }
  .leaderboard-row {
    display: grid;
    grid-template-columns: 48px 1fr 120px 140px 100px;
    padding: 14px 20px;
    border-bottom: 1px solid #f0f5f7;
    align-items: center;
    transition: background 0.1s;
  }
  .leaderboard-row:last-child { border-bottom: none; }
  .leaderboard-row:hover { background: #fafcfd; }
  .rank { font-size: 14px; font-weight: 700; color: #104455; }
  .rank-medal { font-size: 18px; }
  .pro-name { font-size: 14px; font-weight: 500; color: #104455; }
  .shifts-val { font-size: 14px; font-weight: 600; color: #357382; }
  .earnings-val { font-size: 14px; font-weight: 600; color: #104455; }
  .tier-pill {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 600;
    background: var(--tier-bg); color: var(--tier-color);
  }

  .loading { display: flex; align-items: center; justify-content: center; min-height: 300px; color: #5a7a84; font-size: 15px; gap: 10px; }
  .spinner { width: 20px; height: 20px; border: 2px solid #e8f0f3; border-top-color: #86D2AC; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .error-box { background: #fff0f0; border: 1px solid #ffcccc; border-radius: 12px; padding: 20px 24px; color: #c0392b; font-size: 14px; margin-bottom: 24px; }

  @media (max-width: 768px) {
    .summary-grid { grid-template-columns: 1fr; }
    .cluster-grid { grid-template-columns: repeat(2, 1fr); }
    .tiers-grid { grid-template-columns: repeat(2, 1fr); }
    .leaderboard-header, .leaderboard-row { grid-template-columns: 40px 1fr 80px 100px; }
    .earnings-val { display: none; }
    .leaderboard-header span:nth-child(4) { display: none; }
  }
`

type Professional = {
  category_code: string
  professional_id: number
  first_name: string
  last_name: string
  shifts_completed: number
  total_earned: number
  avg_per_shift: number
}

type ClusterStats = {
  category_code: string
  active_pros: number
  total_shifts: number
  avg_payment_per_shift: number
  total_earnings: number
}

type MonthlyData = {
  category_code: string
  month: string
  shifts: number
  active_pros: number
}

type LoyaltyData = {
  leaderboard: Professional[]
  stats: ClusterStats[]
  monthly: MonthlyData[]
  fetchedAt: string
}

const CLUSTERS = [
  { code: 'ENF', label: 'Enfermería', icon: '👩‍⚕️' },
  { code: 'TCAE', label: 'TCAE', icon: '🏥' },
  { code: 'DOC', label: 'Doctores', icon: '👨‍⚕️' },
]

const TIERS: Record<string, { name: string; min: number; color: string; bg: string; icon: string }[]> = {
  ENF: [
    { name: 'Platinum', min: 100, color: '#5B6FE8', bg: '#eef0fd', icon: '💎' },
    { name: 'Gold', min: 50, color: '#D4A017', bg: '#fdf7e6', icon: '🥇' },
    { name: 'Silver', min: 20, color: '#7A8FA6', bg: '#f0f4f7', icon: '🥈' },
    { name: 'Starter', min: 1, color: '#86D2AC', bg: '#edf8f3', icon: '⭐' },
  ],
  TCAE: [
    { name: 'Platinum', min: 50, color: '#5B6FE8', bg: '#eef0fd', icon: '💎' },
    { name: 'Gold', min: 25, color: '#D4A017', bg: '#fdf7e6', icon: '🥇' },
    { name: 'Silver', min: 10, color: '#7A8FA6', bg: '#f0f4f7', icon: '🥈' },
    { name: 'Starter', min: 1, color: '#86D2AC', bg: '#edf8f3', icon: '⭐' },
  ],
  DOC: [
    { name: 'Platinum', min: 11, color: '#5B6FE8', bg: '#eef0fd', icon: '💎' },
    { name: 'Gold', min: 6, color: '#D4A017', bg: '#fdf7e6', icon: '🥇' },
    { name: 'Silver', min: 3, color: '#7A8FA6', bg: '#f0f4f7', icon: '🥈' },
    { name: 'Starter', min: 1, color: '#86D2AC', bg: '#edf8f3', icon: '⭐' },
  ],
}

function getTier(code: string, shifts: number) {
  const tiers = TIERS[code] ?? TIERS.ENF
  return tiers.find((t) => shifts >= t.min) ?? tiers[tiers.length - 1]
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-ES').format(n)
}

function fmtEur(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function LoyaltyPage() {
  const [data, setData] = useState<LoyaltyData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCluster, setActiveCluster] = useState('ENF')

  useEffect(() => {
    fetch('/api/loyalty')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setData(d)
      })
      .catch(() => setError('No se pudo conectar con Metabase'))
      .finally(() => setLoading(false))
  }, [])

  const clusterPros = data?.leaderboard.filter((p) => p.category_code === activeCluster) ?? []
  const clusterStats = data?.stats.find((s) => s.category_code === activeCluster)
  const allStats = data?.stats ?? []

  const totalPros = allStats.reduce((a, s) => a + Number(s.active_pros), 0)
  const totalShifts = allStats.reduce((a, s) => a + Number(s.total_shifts), 0)
  const totalEarnings = allStats.reduce((a, s) => a + Number(s.total_earnings), 0)

  const tierBreakdown = TIERS[activeCluster]?.map((tier, i) => {
    const nextTier = TIERS[activeCluster][i - 1]
    const count = clusterPros.filter((p) => {
      const myTier = getTier(activeCluster, Number(p.shifts_completed))
      return myTier.name === tier.name
    }).length
    return { ...tier, count }
  }) ?? []

  const maxCount = Math.max(...tierBreakdown.map((t) => t.count), 1)

  return (
    <div className="page">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <header className="header">
        <div className="header-brand">
          <div className="header-logo">L</div>
          <div>
            <div className="header-title">Livo Pro Loyalty</div>
            <div className="header-sub">Programa de Fidelización de Profesionales</div>
          </div>
        </div>
        <div className="header-meta">
          {data && <>Actualizado: {fmtDate(data.fetchedAt)}<br />Datos: últimos 12 meses</>}
        </div>
      </header>

      <div className="container">
        {error && <div className="error-box">⚠️ {error}</div>}

        {loading ? (
          <div className="loading">
            <div className="spinner" />
            Cargando datos de Metabase…
          </div>
        ) : data && (
          <>
            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-card-label">Profesionales Activos</div>
                <div className="summary-card-value">{fmt(totalPros)}</div>
                <div className="summary-card-sub">ENF + TCAE + DOC</div>
              </div>
              <div className="summary-card">
                <div className="summary-card-label">Turnos Completados</div>
                <div className="summary-card-value">{fmt(totalShifts)}</div>
                <div className="summary-card-sub">últimos 12 meses</div>
              </div>
              <div className="summary-card">
                <div className="summary-card-label">Ingresos Totales Pros</div>
                <div className="summary-card-value">{fmtEur(totalEarnings)}</div>
                <div className="summary-card-sub">pagado a profesionales</div>
              </div>
            </div>

            <div className="tabs">
              {CLUSTERS.map((c) => {
                const s = allStats.find((x) => x.category_code === c.code)
                return (
                  <button
                    key={c.code}
                    className={`tab${activeCluster === c.code ? ' active' : ''}`}
                    onClick={() => setActiveCluster(c.code)}
                  >
                    <span className="tab-icon">{c.icon}</span>
                    {c.label}
                    {s && <span style={{ marginLeft: 6, opacity: 0.7, fontSize: 12 }}>({fmt(Number(s.active_pros))})</span>}
                  </button>
                )
              })}
            </div>

            {clusterStats && (
              <div className="cluster-grid">
                <div className="stat-card">
                  <div className="stat-label">Profesionales Activos</div>
                  <div className="stat-value">{fmt(Number(clusterStats.active_pros))}</div>
                  <div className="stat-hint">con turnos aprobados</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Turnos Completados</div>
                  <div className="stat-value">{fmt(Number(clusterStats.total_shifts))}</div>
                  <div className="stat-hint">últimos 12 meses</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Media por Turno</div>
                  <div className="stat-value">{fmtEur(Number(clusterStats.avg_payment_per_shift))}</div>
                  <div className="stat-hint">ingreso medio profesional</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Ingresos Totales</div>
                  <div className="stat-value">{fmtEur(Number(clusterStats.total_earnings))}</div>
                  <div className="stat-hint">pagado al cluster</div>
                </div>
              </div>
            )}

            <div className="section-title">Distribución por Tier</div>
            <div className="tiers-grid">
              {tierBreakdown.map((tier) => {
                const tierDef = TIERS[activeCluster].find((t) => t.name === tier.name)!
                const nextTier = TIERS[activeCluster][TIERS[activeCluster].indexOf(tierDef) - 1]
                const threshold = nextTier
                  ? `${tierDef.min}–${nextTier.min - 1} turnos`
                  : `${tierDef.min}+ turnos`
                return (
                  <div
                    key={tier.name}
                    className="tier-card"
                    style={{ '--tier-color': tier.color } as React.CSSProperties}
                  >
                    <div className="tier-badge">{tier.icon} {tier.name}</div>
                    <div className="tier-count">{fmt(tier.count)}</div>
                    <div className="tier-label">profesionales</div>
                    <div className="tier-threshold">{threshold}</div>
                    <div className="tier-bar">
                      <div
                        className="tier-bar-fill"
                        style={{ width: `${(tier.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="section-title">Ranking de Profesionales</div>
            <div className="leaderboard">
              <div className="leaderboard-header">
                <span>#</span>
                <span>Profesional</span>
                <span>Turnos</span>
                <span>Ingresos</span>
                <span>Tier</span>
              </div>
              {clusterPros.slice(0, 100).map((pro, i) => {
                const tier = getTier(activeCluster, Number(pro.shifts_completed))
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
                return (
                  <div key={pro.professional_id} className="leaderboard-row">
                    <span className="rank">
                      {medal ? <span className="rank-medal">{medal}</span> : `${i + 1}`}
                    </span>
                    <span className="pro-name">
                      {pro.first_name} {pro.last_name}
                    </span>
                    <span className="shifts-val">{fmt(Number(pro.shifts_completed))}</span>
                    <span className="earnings-val">{fmtEur(Number(pro.total_earned))}</span>
                    <span>
                      <span
                        className="tier-pill"
                        style={{ '--tier-color': tier.color, '--tier-bg': tier.bg } as React.CSSProperties}
                      >
                        {tier.icon} {tier.name}
                      </span>
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
