'use client'

import { useEffect, useState } from 'react'

const css = `
  .page { min-height: 100vh; background: #F2F7F9; }

  .header {
    background: #104455; padding: 0 32px;
    display: flex; align-items: center; justify-content: space-between;
    height: 64px; box-shadow: 0 2px 12px rgba(16,68,85,0.15);
  }
  .header-brand { display: flex; align-items: center; gap: 12px; }
  .header-logo {
    width: 36px; height: 36px; background: #86D2AC; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 700; color: #104455;
  }
  .header-title { color: #fff; font-size: 18px; font-weight: 600; letter-spacing: -0.3px; }
  .header-sub { color: #86D2AC; font-size: 13px; }
  .header-meta { color: rgba(255,255,255,0.5); font-size: 12px; text-align: right; }

  .container { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }

  .summary-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 32px; }
  .summary-card {
    background: #fff; border-radius: 16px; padding: 20px 24px;
    box-shadow: 0 2px 12px rgba(16,68,85,0.06); border-left: 4px solid #86D2AC;
  }
  .summary-card-label { font-size: 12px; color: #5a7a84; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .summary-card-value { font-size: 28px; font-weight: 700; color: #104455; line-height: 1; }
  .summary-card-sub { font-size: 12px; color: #86D2AC; margin-top: 4px; font-weight: 500; }

  .tabs { display: flex; gap: 0; margin-bottom: 24px; background: #fff; border-radius: 14px; padding: 6px; box-shadow: 0 2px 12px rgba(16,68,85,0.06); width: fit-content; }
  .tab {
    padding: 10px 28px; border-radius: 10px; cursor: pointer;
    font-size: 14px; font-weight: 500; color: #5a7a84;
    border: none; background: transparent; font-family: inherit; transition: all 0.15s;
  }
  .tab:hover { color: #104455; background: #F2F7F9; }
  .tab.active { background: #104455; color: #fff; font-weight: 600; }

  .sub-tabs { display: flex; gap: 8px; margin-bottom: 24px; }
  .sub-tab {
    padding: 8px 20px; border-radius: 20px; cursor: pointer;
    font-size: 13px; font-weight: 500; color: #5a7a84;
    border: 1.5px solid #dde8ec; background: #fff; font-family: inherit; transition: all 0.15s;
  }
  .sub-tab:hover { border-color: #86D2AC; color: #104455; }
  .sub-tab.active { background: #104455; color: #fff; border-color: #104455; font-weight: 600; }

  .cluster-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px; }
  .stat-card { background: #fff; border-radius: 14px; padding: 18px 20px; box-shadow: 0 2px 12px rgba(16,68,85,0.06); }
  .stat-label { font-size: 11px; color: #5a7a84; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .stat-value { font-size: 24px; font-weight: 700; color: #104455; }
  .stat-hint { font-size: 11px; color: #86D2AC; margin-top: 3px; font-weight: 500; }

  .section-title { font-size: 16px; font-weight: 600; color: #104455; margin-bottom: 16px; }
  .section-sub { font-size: 13px; color: #5a7a84; margin-top: -10px; margin-bottom: 20px; }

  .tiers-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 28px; }
  .tier-card {
    background: #fff; border-radius: 14px; padding: 16px 18px;
    box-shadow: 0 2px 12px rgba(16,68,85,0.06); border-top: 3px solid var(--tc);
  }
  .tier-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--tc); margin-bottom: 8px; }
  .tier-count { font-size: 28px; font-weight: 700; color: #104455; }
  .tier-label { font-size: 11px; color: #5a7a84; margin-top: 2px; }
  .tier-threshold { font-size: 11px; color: #9db5bc; margin-top: 6px; }
  .tier-bar { height: 4px; background: #F2F7F9; border-radius: 2px; margin-top: 10px; overflow: hidden; }
  .tier-bar-fill { height: 100%; border-radius: 2px; background: var(--tc); transition: width 0.6s; }

  .leaderboard { background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(16,68,85,0.06); overflow: hidden; }
  .lb-header {
    display: grid; grid-template-columns: 48px 1fr 120px 140px 100px;
    padding: 12px 20px; background: #F2F7F9;
    font-size: 11px; font-weight: 600; color: #5a7a84;
    text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e8f0f3;
  }
  .lb-row {
    display: grid; grid-template-columns: 48px 1fr 120px 140px 100px;
    padding: 14px 20px; border-bottom: 1px solid #f0f5f7; align-items: center; transition: background 0.1s;
  }
  .lb-row:last-child { border-bottom: none; }
  .lb-row:hover { background: #fafcfd; }
  .rank { font-size: 14px; font-weight: 700; color: #104455; }
  .pro-name { font-size: 14px; font-weight: 500; color: #104455; }
  .shifts-val { font-size: 14px; font-weight: 600; color: #357382; }
  .earnings-val { font-size: 14px; font-weight: 600; color: #104455; }
  .tier-pill {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
    background: var(--tb); color: var(--tc);
  }

  /* PERKS */
  .perks-matrix { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 32px; }
  .perk-tier-card {
    background: #fff; border-radius: 16px; padding: 20px;
    box-shadow: 0 2px 12px rgba(16,68,85,0.06); border-top: 3px solid var(--tc);
  }
  .perk-tier-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
  .perk-tier-name { font-size: 15px; font-weight: 700; color: var(--tc); }
  .perk-tier-req { font-size: 11px; color: #9db5bc; margin-top: 2px; }
  .perk-category { margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid #f0f5f7; }
  .perk-category:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
  .perk-cat-label { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #5a7a84; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px; }
  .perk-value { font-size: 18px; font-weight: 700; color: #104455; margin-bottom: 3px; }
  .perk-detail { font-size: 12px; color: #5a7a84; line-height: 1.4; }
  .perk-partners { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
  .perk-partner-chip {
    font-size: 10px; font-weight: 500; padding: 2px 8px; border-radius: 10px;
    background: #F2F7F9; color: #5a7a84; border: 1px solid #dde8ec;
  }
  .perk-locked { opacity: 0.35; }
  .perk-lock-icon { font-size: 12px; margin-left: 4px; }

  .cat-note { background: #edf8f3; border-radius: 10px; padding: 12px 16px; margin-bottom: 24px; font-size: 13px; color: #357382; }
  .cat-note strong { color: #104455; }

  /* PRIORITY SHIFTS */
  .shifts-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px; }
  .shift-tier-card {
    background: #fff; border-radius: 16px; padding: 20px;
    box-shadow: 0 2px 12px rgba(16,68,85,0.06); border-top: 3px solid var(--tc);
  }
  .shift-tier-name { font-size: 15px; font-weight: 700; color: var(--tc); margin-bottom: 4px; }
  .shift-tier-sub { font-size: 11px; color: #9db5bc; margin-bottom: 16px; }
  .shift-row { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px; }
  .shift-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
  .shift-row-label { font-size: 11px; font-weight: 600; color: #5a7a84; text-transform: uppercase; letter-spacing: 0.4px; }
  .shift-row-val { font-size: 13px; color: #104455; font-weight: 500; line-height: 1.4; }
  .shift-bonus-pill {
    display: inline-block; padding: 2px 10px; border-radius: 20px;
    background: #edf8f3; color: #2a8a5e; font-size: 12px; font-weight: 700; margin-top: 4px;
  }
  .shift-facilities { display: flex; flex-direction: column; gap: 4px; margin-top: 4px; }
  .facility-tag {
    font-size: 11px; padding: 3px 10px; border-radius: 8px;
    background: #F2F7F9; color: #357382; border: 1px solid #dde8ec; display: inline-block; width: fit-content;
  }
  .facility-tag.premium { background: #fdf7e6; border-color: #f0d060; color: #8a6a00; }
  .facility-tag.exclusive { background: #eef0fd; border-color: #b0b8f0; color: #3a4ab0; }
  .cat-shift-note { background: #F2F7F9; border-radius: 10px; padding: 12px 16px; margin-bottom: 24px; font-size: 13px; color: #5a7a84; }
  .cat-shift-note strong { color: #104455; }

  .loading { display: flex; align-items: center; justify-content: center; min-height: 300px; color: #5a7a84; font-size: 15px; gap: 10px; }
  .spinner { width: 20px; height: 20px; border: 2px solid #e8f0f3; border-top-color: #86D2AC; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .error-box { background: #fff0f0; border: 1px solid #ffcccc; border-radius: 12px; padding: 20px 24px; color: #c0392b; font-size: 14px; margin-bottom: 24px; }

  /* CONSISTENCY BADGE */
  .consistent-badge {
    display: inline-flex; align-items: center; gap: 3px;
    font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 10px;
    background: linear-gradient(135deg, #ff6b35, #f7c59f);
    color: #fff; margin-left: 6px; vertical-align: middle;
    box-shadow: 0 1px 4px rgba(255,107,53,0.35); letter-spacing: 0.2px;
  }

  /* CONSISTENCY BENEFIT CARD */
  .consistency-banner {
    background: linear-gradient(135deg, #104455 0%, #1d6278 50%, #357382 100%);
    border-radius: 16px; padding: 28px 32px; margin-bottom: 28px;
    position: relative; overflow: hidden;
    box-shadow: 0 4px 20px rgba(16,68,85,0.2);
  }
  .consistency-banner::before {
    content: '⚡';
    position: absolute; right: 28px; top: 50%; transform: translateY(-50%);
    font-size: 80px; opacity: 0.08; pointer-events: none;
  }
  .consistency-banner-title {
    font-size: 11px; font-weight: 600; letter-spacing: 1px;
    text-transform: uppercase; color: #86D2AC; margin-bottom: 6px;
  }
  .consistency-banner-headline {
    font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 8px; line-height: 1.2;
  }
  .consistency-banner-sub {
    font-size: 13px; color: rgba(255,255,255,0.65); margin-bottom: 20px;
  }
  .consistency-stat {
    display: inline-flex; align-items: baseline; gap: 6px;
    background: rgba(134,210,172,0.15); border: 1px solid rgba(134,210,172,0.3);
    border-radius: 10px; padding: 8px 16px; margin-right: 10px; margin-bottom: 8px;
  }
  .consistency-stat-val { font-size: 22px; font-weight: 700; color: #86D2AC; }
  .consistency-stat-label { font-size: 12px; color: rgba(255,255,255,0.6); }
  .consistency-perks-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-top: 0; }
  .consistency-perk-card {
    background: #fff; border-radius: 14px; padding: 18px;
    box-shadow: 0 2px 12px rgba(16,68,85,0.06);
    border-top: 3px solid #ff6b35;
  }
  .consistency-perk-icon { font-size: 24px; margin-bottom: 8px; }
  .consistency-perk-title { font-size: 13px; font-weight: 700; color: #104455; margin-bottom: 4px; }
  .consistency-perk-detail { font-size: 12px; color: #5a7a84; line-height: 1.4; }
  .consistency-leaderboard { background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(16,68,85,0.06); overflow: hidden; margin-top: 20px; }
`

// ─── Types ───────────────────────────────────────────────────────────────────
type Professional = {
  category_code: string; professional_id: number
  first_name: string; last_name: string
  shifts_completed: number; total_earned: number; avg_per_shift: number
}
type ClusterStats = {
  category_code: string; active_pros: number
  total_shifts: number; avg_payment_per_shift: number; total_earnings: number
}
type ConsistentPro = {
  category_code: string; professional_id: number
  first_name: string; last_name: string
  total_shifts: number; weeks_active: number; avg_weekly_shifts: number
}
type LoyaltyData = {
  leaderboard: Professional[]; stats: ClusterStats[]
  monthly: unknown[]; consistent: ConsistentPro[]; fetchedAt: string
}

// ─── Constants ───────────────────────────────────────────────────────────────
const CLUSTERS = [
  { code: 'ENF',  label: 'Enfermería', icon: '👩‍⚕️' },
  { code: 'TCAE', label: 'TCAE',       icon: '🏥'   },
  { code: 'DOC',  label: 'Doctores',   icon: '👨‍⚕️' },
]

const TIERS: Record<string, { name: string; min: number; color: string; bg: string; icon: string }[]> = {
  ENF:  [
    { name: 'Platinum', min: 100, color: '#5B6FE8', bg: '#eef0fd', icon: '💎' },
    { name: 'Gold',     min: 50,  color: '#D4A017', bg: '#fdf7e6', icon: '🥇' },
    { name: 'Silver',   min: 20,  color: '#7A8FA6', bg: '#f0f4f7', icon: '🥈' },
    { name: 'Starter',  min: 1,   color: '#86D2AC', bg: '#edf8f3', icon: '⭐' },
  ],
  TCAE: [
    { name: 'Platinum', min: 50, color: '#5B6FE8', bg: '#eef0fd', icon: '💎' },
    { name: 'Gold',     min: 25, color: '#D4A017', bg: '#fdf7e6', icon: '🥇' },
    { name: 'Silver',   min: 10, color: '#7A8FA6', bg: '#f0f4f7', icon: '🥈' },
    { name: 'Starter',  min: 1,  color: '#86D2AC', bg: '#edf8f3', icon: '⭐' },
  ],
  DOC:  [
    { name: 'Platinum', min: 11, color: '#5B6FE8', bg: '#eef0fd', icon: '💎' },
    { name: 'Gold',     min: 6,  color: '#D4A017', bg: '#fdf7e6', icon: '🥇' },
    { name: 'Silver',   min: 3,  color: '#7A8FA6', bg: '#f0f4f7', icon: '🥈' },
    { name: 'Starter',  min: 1,  color: '#86D2AC', bg: '#edf8f3', icon: '⭐' },
  ],
}

// ─── Perks per tier ──────────────────────────────────────────────────────────
const PERK_CATEGORIES = [
  {
    key: 'university', icon: '🎓', label: 'Formación',
    partners: { ENF: ['Univ. Barcelona', 'UAB', 'Blanquerna'], TCAE: ['UAB', 'Fundació Pere Tarrés', 'SEAS'], DOC: ['UPF', 'UB Medicina', 'IESE Health'] },
    tiers: {
      Starter:  { value: '5% dto.',  detail: '5% en másters y postgrados de salud' },
      Silver:   { value: '10% dto.', detail: '10% + acceso a becas parciales' },
      Gold:     { value: '15% dto.', detail: '15% + matrícula prioritaria garantizada' },
      Platinum: { value: '20% dto.', detail: '20% + mentoría con catedráticos + carta de recomendación Livo' },
    },
  },
  {
    key: 'travel', icon: '✈️', label: 'Viajes',
    partners: { ENF: ['Iberia', 'Vueling', 'Booking'], TCAE: ['Vueling', 'Civitatis', 'HotelBeds'], DOC: ['Iberia Business', 'NH Hotels', 'American Express Travel'] },
    tiers: {
      Starter:  { value: '5% dto.',  detail: '5% en vuelos seleccionados' },
      Silver:   { value: '8% dto.',  detail: '8% vuelos + 6% hoteles partner' },
      Gold:     { value: '12% dto.', detail: '12% vuelos + 10% hoteles + acceso sala VIP' },
      Platinum: { value: '15% dto.', detail: '15% + upgrades gratuitos + sala VIP siempre' },
    },
  },
  {
    key: 'restaurants', icon: '🍽️', label: 'Restaurantes',
    partners: { ENF: ['Lateral', 'La Tagliatella', 'TGB'], TCAE: ['TGB', 'Parking Pizza', 'Goiko'], DOC: ['Grupo Sagardi', 'Honest Greens', 'Rías de Galicia'] },
    tiers: {
      Starter:  { value: '2×1',      detail: 'Menú del día 2×1 entre semana' },
      Silver:   { value: '10% dto.', detail: '10% en carta completa · fines de semana incluidos' },
      Gold:     { value: '15% dto.', detail: '15% + postre gratis + reserva garantizada' },
      Platinum: { value: '20% dto.', detail: '20% + mesa VIP reservada siempre + menú degustación invitado' },
    },
  },
  {
    key: 'wellness', icon: '🧘', label: 'Wellness',
    partners: { ENF: ['VivaGym', 'Anytime Fitness', 'Neoforma'], TCAE: ['VivaGym', 'Yoga Studio BCN', 'Calm App'], DOC: ['Meliá Spa', 'SHA Wellness', 'Mindfulness MD'] },
    tiers: {
      Starter:  { value: '10% dto.', detail: '10% en cuotas de gimnasio partner' },
      Silver:   { value: '15% dto.', detail: '15% gym + 1 clase grupal/mes gratis' },
      Gold:     { value: '20% dto.', detail: '20% + sesión personal trainer mensual' },
      Platinum: { value: '25% dto.', detail: '25% + acceso spa mensual + retiro bienestar anual' },
    },
  },
]

// ─── Category notes ───────────────────────────────────────────────────────────
const CAT_NOTES: Record<string, string> = {
  ENF:  'Los beneficios de <strong>Enfermería</strong> priorizan formación en UCI, quirófano y especialidades avanzadas, junto con descanso activo.',
  TCAE: 'Para <strong>TCAE</strong>, el programa facilita la progresión hacia Grado de Enfermería y técnicas especializadas.',
  DOC:  'Los beneficios de <strong>Doctores</strong> incluyen MBA Salud, acceso a congresos internacionales y viajes en clase Business.',
}

// ─── Priority Shifts per tier & cluster ──────────────────────────────────────
const PRIORITY_SHIFTS = {
  Starter: {
    label: 'Acceso Estándar',
    sub: 'Turnos públicos, sin prioridad',
    access: 'Acceso al marketplace al mismo tiempo que todos los profesionales',
    rateBonus: null,
    guaranteed: null,
    facilities: { ENF: ['Centros verificados'], TCAE: ['Centros verificados'], DOC: ['Clínicas y hospitales verificados'] },
  },
  Silver: {
    label: 'Acceso Preferente',
    sub: '+2h antes que Starter',
    access: 'Notificación 2 horas antes de la publicación general',
    rateBonus: '+5%',
    guaranteed: null,
    facilities: {
      ENF:  ['Centros verificados', 'Hospitales concertados'],
      TCAE: ['Centros verificados', 'Residencias premium'],
      DOC:  ['Hospitales concertados', 'Clínicas privadas'],
    },
  },
  Gold: {
    label: 'Acceso Prioritario',
    sub: '+4h antes del mercado público',
    access: 'First look 4h antes + alertas push personalizadas',
    rateBonus: '+8%',
    guaranteed: '4 turnos/mes garantizados',
    facilities: {
      ENF:  ['Hospitales Universitarios', 'Grupos hospitalarios premium'],
      TCAE: ['Residencias premium', 'Hospitales concertados'],
      DOC:  ['Hospitales Universitarios', 'Clínicas de alta gama'],
    },
  },
  Platinum: {
    label: 'Acceso Exclusivo',
    sub: '24h antes + turnos reservados',
    access: '24h antes del mercado + pool de turnos exclusivos Platinum',
    rateBonus: '+12%',
    guaranteed: '10 turnos/mes garantizados',
    facilities: {
      ENF:  ['Hospitales top 10 España', 'Centros de excelencia JCI', 'Grupos exclusivos Livo'],
      TCAE: ['Hospitales top', 'Centros especializados exclusivos'],
      DOC:  ['Hospitales top 10 España', 'Centros privados de lujo', 'Centros internacionales'],
    },
  },
}

const SHIFT_CAT_NOTES: Record<string, string> = {
  ENF:  '<strong>Enfermeras:</strong> A partir de Gold, acceso exclusivo a servicios de UCI, Neonatos y Quirófano en hospitales universitarios.',
  TCAE: '<strong>TCAE:</strong> Platinum abre acceso a hospitales de alta complejidad y residencias privadas de referencia nacional.',
  DOC:  '<strong>Doctores:</strong> Silver+ incluye servicios de urgencias de hospitales privados y Gold+ accede a grupos hospitalarios exclusivos con tarifa negociada Livo.',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getTier(code: string, shifts: number) {
  const tiers = TIERS[code] ?? TIERS.ENF
  return tiers.find((t) => shifts >= t.min) ?? tiers[tiers.length - 1]
}
function fmt(n: number) { return new Intl.NumberFormat('es-ES').format(n) }
function fmtEur(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function LoyaltyPage() {
  const [data, setData] = useState<LoyaltyData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [cluster, setCluster] = useState('ENF')
  const [view, setView] = useState<'ranking' | 'beneficios' | 'turnos'>('ranking')

  useEffect(() => {
    fetch('/api/loyalty')
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setData(d) })
      .catch(() => setError('No se pudo conectar con Metabase'))
      .finally(() => setLoading(false))
  }, [])

  const clusterPros = data?.leaderboard.filter((p) => p.category_code === cluster) ?? []
  const clusterStats = data?.stats.find((s) => s.category_code === cluster)
  const allStats = data?.stats ?? []
  const totalPros = allStats.reduce((a, s) => a + Number(s.active_pros), 0)
  const totalShifts = allStats.reduce((a, s) => a + Number(s.total_shifts), 0)
  const totalEarnings = allStats.reduce((a, s) => a + Number(s.total_earnings), 0)
  const allConsistent = data?.consistent ?? []
  const clusterConsistent = allConsistent.filter((p) => p.category_code === cluster)
  const consistentIds = new Set(clusterConsistent.map((p) => p.professional_id))

  const tierDefs = TIERS[cluster]
  const tierBreakdown = tierDefs.map((tier) => ({
    ...tier,
    count: clusterPros.filter((p) => getTier(cluster, Number(p.shifts_completed)).name === tier.name).length,
  }))
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
          <div className="loading"><div className="spinner" />Cargando datos de Metabase…</div>
        ) : data && (
          <>
            {/* ── Summary ── */}
            <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
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
              <div className="summary-card" style={{ borderLeftColor: '#ff6b35' }}>
                <div className="summary-card-label">⚡ Pros Consistentes</div>
                <div className="summary-card-value">{fmt(allConsistent.length)}</div>
                <div className="summary-card-sub" style={{ color: '#ff6b35' }}>≥ 2 turnos/semana</div>
              </div>
            </div>

            {/* ── Cluster tabs ── */}
            <div className="tabs">
              {CLUSTERS.map((c) => {
                const s = allStats.find((x) => x.category_code === c.code)
                return (
                  <button
                    key={c.code}
                    className={`tab${cluster === c.code ? ' active' : ''}`}
                    onClick={() => setCluster(c.code)}
                  >
                    {c.icon} {c.label}
                    {s && <span style={{ marginLeft: 6, opacity: 0.7, fontSize: 12 }}>({fmt(Number(s.active_pros))})</span>}
                  </button>
                )
              })}
            </div>

            {/* ── Sub tabs ── */}
            <div className="sub-tabs">
              {[
                { key: 'ranking',    label: '🏆 Ranking' },
                { key: 'beneficios', label: '🎁 Beneficios & Partners' },
                { key: 'turnos',     label: '🔑 Turnos Prioritarios' },
              ].map((t) => (
                <button
                  key={t.key}
                  className={`sub-tab${view === t.key ? ' active' : ''}`}
                  onClick={() => setView(t.key as typeof view)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Cluster stats (always visible) ── */}
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

            {/* ── Tier distribution (always visible) ── */}
            <div className="section-title">Distribución por Tier</div>
            <div className="tiers-grid">
              {tierBreakdown.map((tier) => {
                const i = tierDefs.indexOf(tier as typeof tierDefs[0])
                const next = tierDefs[i - 1]
                const threshold = next ? `${tier.min}–${next.min - 1} turnos` : `${tier.min}+ turnos`
                return (
                  <div key={tier.name} className="tier-card" style={{ '--tc': tier.color } as React.CSSProperties}>
                    <div className="tier-badge">{tier.icon} {tier.name}</div>
                    <div className="tier-count">{fmt(tier.count)}</div>
                    <div className="tier-label">profesionales</div>
                    <div className="tier-threshold">{threshold}</div>
                    <div className="tier-bar">
                      <div className="tier-bar-fill" style={{ width: `${(tier.count / maxCount) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ══════════════════ VIEW: RANKING ══════════════════ */}
            {view === 'ranking' && (
              <>
                <div className="section-title">Ranking de Profesionales</div>
                <div className="leaderboard">
                  <div className="lb-header">
                    <span>#</span><span>Profesional</span>
                    <span>Turnos</span><span>Ingresos</span><span>Tier</span>
                  </div>
                  {clusterPros.slice(0, 100).map((pro, i) => {
                    const tier = getTier(cluster, Number(pro.shifts_completed))
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
                    return (
                      <div key={pro.professional_id} className="lb-row">
                        <span className="rank">{medal ?? `${i + 1}`}</span>
                        <span className="pro-name">
                          {pro.first_name} {pro.last_name}
                          {consistentIds.has(pro.professional_id) && (
                            <span className="consistent-badge">⚡ Consistente</span>
                          )}
                        </span>
                        <span className="shifts-val">{fmt(Number(pro.shifts_completed))}</span>
                        <span className="earnings-val">{fmtEur(Number(pro.total_earned))}</span>
                        <span>
                          <span className="tier-pill" style={{ '--tc': tier.color, '--tb': tier.bg } as React.CSSProperties}>
                            {tier.icon} {tier.name}
                          </span>
                        </span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* ══════════════════ VIEW: BENEFICIOS ══════════════════ */}
            {view === 'beneficios' && (
              <>
                {/* ── Consistency bonus banner ── */}
                <div className="consistency-banner">
                  <div className="consistency-banner-title">⚡ Bono Exclusivo · Disponible para todos los tiers</div>
                  <div className="consistency-banner-headline">Bono Consistencia — 2 turnos por semana</div>
                  <div className="consistency-banner-sub">
                    Completa una media de 2 turnos semanales y desbloquea beneficios extra acumulables a tu tier actual.
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <span className="consistency-stat">
                      <span className="consistency-stat-val">{fmt(clusterConsistent.length)}</span>
                      <span className="consistency-stat-label">pros activos con bono en este cluster</span>
                    </span>
                    <span className="consistency-stat">
                      <span className="consistency-stat-val">
                        {clusterConsistent.length > 0
                          ? `${Math.round(clusterConsistent.reduce((a, p) => a + Number(p.avg_weekly_shifts), 0) / clusterConsistent.length * 10) / 10}`
                          : '—'}
                      </span>
                      <span className="consistency-stat-label">media turnos/semana del grupo</span>
                    </span>
                  </div>
                  <div className="consistency-perks-grid">
                    {[
                      { icon: '💰', title: '+3% extra en tarifa', detail: 'Se acumula al bonus de tu tier (Gold = +8% tier + 3% consistencia = +11% total).' },
                      { icon: '🔄', title: 'Swap sin penalización', detail: 'Cambia hasta 2 turnos al mes sin perder el slot ni la valoración.' },
                      { icon: '🎯', title: 'Account Manager propio', detail: 'Acceso directo a un AM dedicado de Livo para gestión prioritaria.' },
                      { icon: '🏆', title: 'Reconocimiento mensual', detail: 'Mención en el ranking especial de Consistencia + regalo sorpresa mensual de Livo.' },
                    ].map((p) => (
                      <div key={p.title} className="consistency-perk-card">
                        <div className="consistency-perk-icon">{p.icon}</div>
                        <div className="consistency-perk-title">{p.title}</div>
                        <div className="consistency-perk-detail">{p.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {clusterConsistent.length > 0 && (
                  <>
                    <div className="section-title">Profesionales con Bono ⚡ Activo</div>
                    <div className="consistency-leaderboard" style={{ marginBottom: 32 }}>
                      <div className="lb-header">
                        <span>#</span><span>Profesional</span>
                        <span>Turnos (12m)</span><span>Media semanal</span><span>Tier</span>
                      </div>
                      {clusterConsistent.slice(0, 20).map((pro, i) => {
                        const tier = getTier(cluster, Number(pro.total_shifts))
                        return (
                          <div key={pro.professional_id} className="lb-row">
                            <span className="rank">{i + 1}</span>
                            <span className="pro-name">
                              {pro.first_name} {pro.last_name}
                              <span className="consistent-badge">⚡ Consistente</span>
                            </span>
                            <span className="shifts-val">{fmt(Number(pro.total_shifts))}</span>
                            <span className="earnings-val">{Number(pro.avg_weekly_shifts).toFixed(1)} / sem</span>
                            <span>
                              <span className="tier-pill" style={{ '--tc': tier.color, '--tb': tier.bg } as React.CSSProperties}>
                                {tier.icon} {tier.name}
                              </span>
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}

                <div className="section-title">Beneficios por Tier</div>
                <div className="section-sub">Cuanto mayor sea tu tier, mayores son los descuentos y el acceso exclusivo a partners.</div>
                <div className="cat-note" dangerouslySetInnerHTML={{ __html: CAT_NOTES[cluster] }} />

                <div className="perks-matrix">
                  {tierDefs.map((tier, ti) => {
                    const TIER_REQS: Record<string, Record<string, string>> = {
                      ENF:  { Starter:'1–19 turnos', Silver:'20–49 turnos', Gold:'50–99 turnos', Platinum:'100+ turnos' },
                      TCAE: { Starter:'1–9 turnos',  Silver:'10–24 turnos', Gold:'25–49 turnos', Platinum:'50+ turnos'  },
                      DOC:  { Starter:'1–2 turnos',  Silver:'3–5 turnos',   Gold:'6–10 turnos',  Platinum:'11+ turnos'  },
                    }
                    const tierReqs = TIER_REQS[cluster]?.[tier.name] ?? ''

                    return (
                      <div key={tier.name} className="perk-tier-card" style={{ '--tc': tier.color } as React.CSSProperties}>
                        <div className="perk-tier-header">
                          <span style={{ fontSize: 22 }}>{tier.icon}</span>
                          <div>
                            <div className="perk-tier-name">{tier.name}</div>
                            <div className="perk-tier-req">{tierReqs}</div>
                          </div>
                        </div>

                        {PERK_CATEGORIES.map((cat, ci) => {
                          const perk = cat.tiers[tier.name as keyof typeof cat.tiers]
                          const partners = (cat.partners as Record<string, string[]>)[cluster] ?? []
                          const isLocked = ti > 0 && ci >= 3 && tier.name === 'Starter'
                          return (
                            <div key={cat.key} className={`perk-category${isLocked ? ' perk-locked' : ''}`}>
                              <div className="perk-cat-label">
                                {cat.icon} {cat.label}
                                {isLocked && <span className="perk-lock-icon">🔒</span>}
                              </div>
                              <div className="perk-value">{perk.value}</div>
                              <div className="perk-detail">{perk.detail}</div>
                              {tier.name !== 'Starter' && (
                                <div className="perk-partners">
                                  {partners.map((p) => (
                                    <span key={p} className="perk-partner-chip">{p}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* ══════════════════ VIEW: TURNOS PRIORITARIOS ══════════════════ */}
            {view === 'turnos' && (
              <>
                <div className="section-title">Acceso Prioritario a Turnos</div>
                <div className="section-sub">Mayor tier = acceso antes, mejores centros, tarifa más alta.</div>
                <div className="cat-shift-note" dangerouslySetInnerHTML={{ __html: SHIFT_CAT_NOTES[cluster] }} />

                <div className="shifts-grid">
                  {tierDefs.map((tier) => {
                    const ps = PRIORITY_SHIFTS[tier.name as keyof typeof PRIORITY_SHIFTS]
                    const facilities = ps.facilities[cluster as keyof typeof ps.facilities] ?? []
                    return (
                      <div key={tier.name} className="shift-tier-card" style={{ '--tc': tier.color } as React.CSSProperties}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 20 }}>{tier.icon}</span>
                          <div>
                            <div className="shift-tier-name">{tier.name}</div>
                            <div className="shift-tier-sub">{ps.sub}</div>
                          </div>
                        </div>

                        <div className="shift-row">
                          <span className="shift-icon">⏰</span>
                          <div>
                            <div className="shift-row-label">Acceso</div>
                            <div className="shift-row-val">{ps.access}</div>
                          </div>
                        </div>

                        <div className="shift-row">
                          <span className="shift-icon">💰</span>
                          <div>
                            <div className="shift-row-label">Bonificación tarifa</div>
                            {ps.rateBonus
                              ? <span className="shift-bonus-pill">{ps.rateBonus} sobre tarifa base</span>
                              : <div className="shift-row-val" style={{ color: '#9db5bc' }}>Sin bonificación</div>}
                          </div>
                        </div>

                        {ps.guaranteed && (
                          <div className="shift-row">
                            <span className="shift-icon">✅</span>
                            <div>
                              <div className="shift-row-label">Garantía</div>
                              <div className="shift-row-val">{ps.guaranteed}</div>
                            </div>
                          </div>
                        )}

                        <div className="shift-row">
                          <span className="shift-icon">🏥</span>
                          <div>
                            <div className="shift-row-label">Centros disponibles</div>
                            <div className="shift-facilities">
                              {facilities.map((f, fi) => (
                                <span key={f} className={`facility-tag${fi === facilities.length - 1 && tier.name === 'Gold' ? ' premium' : fi === facilities.length - 1 && tier.name === 'Platinum' ? ' exclusive' : ''}`}>
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
