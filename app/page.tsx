'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Period = 'week' | 'month' | 'quarter' | 'year' | 'custom'

const PERIOD_OPTIONS: { key: Period; label: string; short: string }[] = [
  { key: 'week',    label: 'Esta semana',   short: 'últimos 7 días' },
  { key: 'month',   label: 'Este mes',      short: 'últimos 30 días' },
  { key: 'quarter', label: 'Trimestre',     short: 'últimos 3 meses' },
  { key: 'year',    label: 'Año',           short: 'últimos 12 meses' },
  { key: 'custom',  label: 'Personalizado', short: 'rango personalizado' },
]

const css = `
  * { box-sizing: border-box; }
  .page { min-height: 100vh; background: #F2F7F9; font-family: 'Lexend', sans-serif; }

  /* ── Header ── */
  .header {
    background: #104455; padding: 0 32px;
    display: flex; align-items: center; justify-content: space-between;
    height: 64px; box-shadow: 0 2px 16px rgba(16,68,85,0.2);
  }
  .header-brand { display: flex; align-items: center; gap: 12px; }
  .header-logo {
    width: 36px; height: 36px; background: #86D2AC; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 700; color: #104455;
  }
  .header-title { color: #fff; font-size: 18px; font-weight: 600; letter-spacing: -0.3px; }
  .header-sub { color: #86D2AC; font-size: 12px; }
  .header-meta { color: rgba(255,255,255,0.45); font-size: 11px; text-align: right; line-height: 1.6; }

  /* ── Layout ── */
  .container { max-width: 1200px; margin: 0 auto; padding: 28px 24px; }

  /* ── Summary bar ── */
  .summary-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 28px; }
  .summary-card {
    background: #fff; border-radius: 14px; padding: 18px 20px;
    box-shadow: 0 2px 12px rgba(16,68,85,0.06); border-left: 4px solid #86D2AC;
  }
  .summary-card.orange { border-left-color: #ff6b35; }
  .summary-card-label { font-size: 11px; color: #5a7a84; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .summary-card-value { font-size: 26px; font-weight: 700; color: #104455; line-height: 1; }
  .summary-card-sub { font-size: 11px; color: #86D2AC; margin-top: 4px; font-weight: 500; }
  .summary-card.orange .summary-card-sub { color: #ff6b35; }

  /* ── Cluster tabs ── */
  .tabs { display: flex; gap: 0; margin-bottom: 20px; background: #fff; border-radius: 14px; padding: 5px; box-shadow: 0 2px 12px rgba(16,68,85,0.06); width: fit-content; }
  .tab {
    padding: 9px 26px; border-radius: 10px; cursor: pointer;
    font-size: 14px; font-weight: 500; color: #5a7a84;
    border: none; background: transparent; font-family: inherit; transition: all 0.15s;
  }
  .tab:hover { color: #104455; background: #F2F7F9; }
  .tab.active { background: #104455; color: #fff; font-weight: 600; }

  /* ── Sub tabs ── */
  .sub-tabs { display: flex; gap: 8px; margin-bottom: 22px; }
  .sub-tab {
    padding: 7px 18px; border-radius: 20px; cursor: pointer;
    font-size: 13px; font-weight: 500; color: #5a7a84;
    border: 1.5px solid #dde8ec; background: #fff; font-family: inherit; transition: all 0.15s;
  }
  .sub-tab:hover { border-color: #86D2AC; color: #104455; }
  .sub-tab.active { background: #104455; color: #fff; border-color: #104455; font-weight: 600; }

  /* ── Cluster stats ── */
  .cluster-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 24px; }
  .stat-card { background: #fff; border-radius: 13px; padding: 16px 18px; box-shadow: 0 2px 12px rgba(16,68,85,0.06); }
  .stat-label { font-size: 11px; color: #5a7a84; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 5px; }
  .stat-value { font-size: 22px; font-weight: 700; color: #104455; }
  .stat-hint { font-size: 11px; color: #86D2AC; margin-top: 2px; font-weight: 500; }

  /* ── Section headers ── */
  .section-title { font-size: 16px; font-weight: 700; color: #104455; margin-bottom: 6px; }
  .section-sub { font-size: 13px; color: #5a7a84; margin-bottom: 18px; }

  /* ── Tier cards ── */
  .tiers-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 28px; }
  .tier-card {
    background: #fff; border-radius: 14px; padding: 18px;
    box-shadow: 0 2px 12px rgba(16,68,85,0.06); border-top: 3px solid var(--tc);
    position: relative;
  }
  .tier-card-name { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; color: var(--tc); margin-bottom: 4px; }
  .tier-threshold { font-size: 11px; color: #9db5bc; margin-bottom: 12px; }
  .tier-count-big { font-size: 32px; font-weight: 700; color: #104455; line-height: 1; }
  .tier-count-label { font-size: 11px; color: #5a7a84; margin-top: 2px; margin-bottom: 10px; }
  .tier-bar { height: 5px; background: #F2F7F9; border-radius: 3px; overflow: hidden; }
  .tier-bar-fill { height: 100%; border-radius: 3px; background: var(--tc); transition: width 0.7s ease; }
  .tier-pct { font-size: 11px; color: #9db5bc; margin-top: 5px; }

  /* ── Leaderboard ── */
  .leaderboard { background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(16,68,85,0.06); overflow: hidden; }
  .lb-header {
    display: grid; grid-template-columns: 44px 1fr 90px 110px 90px 90px 110px;
    padding: 11px 20px; background: #F2F7F9;
    font-size: 10px; font-weight: 700; color: #5a7a84;
    text-transform: uppercase; letter-spacing: 0.6px; border-bottom: 1px solid #e8f0f3;
  }
  .lb-row {
    display: grid; grid-template-columns: 44px 1fr 90px 110px 90px 90px 110px;
    padding: 12px 20px; border-bottom: 1px solid #f0f5f7;
    align-items: center; transition: background 0.1s;
  }
  .lb-row:last-child { border-bottom: none; }
  .lb-row:hover { background: #fafcfd; }
  .rank { font-size: 13px; font-weight: 700; color: #9db5bc; }
  .pro-name { font-size: 13px; font-weight: 600; color: #104455; display: flex; align-items: center; flex-wrap: wrap; gap: 5px; }
  .shifts-val { font-size: 13px; font-weight: 600; color: #357382; }
  .lp-val { font-size: 13px; font-weight: 700; color: #5B6FE8; }
  .earnings-val { font-size: 13px; color: #5a7a84; }
  .tier-pill {
    display: inline-flex; align-items: center; gap: 3px;
    padding: 3px 9px; border-radius: 20px; font-size: 10px; font-weight: 700;
    background: var(--tb); color: var(--tc); white-space: nowrap;
  }

  /* ── Badges ── */
  .consistent-badge {
    display: inline-flex; align-items: center; gap: 2px;
    font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 8px;
    background: linear-gradient(135deg,#ff6b35,#f7931e); color: #fff;
    box-shadow: 0 1px 4px rgba(255,107,53,0.3); letter-spacing: 0.2px;
  }
  .milestone-badge {
    display: inline-flex; align-items: center;
    font-size: 14px; cursor: default;
  }
  .milestone-badge[title] { cursor: help; }

  /* ── LP progress bar in leaderboard ── */
  .lp-progress-wrap { display: flex; flex-direction: column; gap: 2px; }
  .lp-progress-bar { height: 3px; background: #F2F7F9; border-radius: 2px; overflow: hidden; width: 60px; }
  .lp-progress-fill { height: 100%; border-radius: 2px; background: var(--tc2, #5B6FE8); }
  .lp-progress-label { font-size: 9px; color: #9db5bc; }

  /* ── Retos del Mes ── */
  .retos-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 28px; }
  .reto-card {
    background: #fff; border-radius: 16px; padding: 22px;
    box-shadow: 0 2px 12px rgba(16,68,85,0.06);
    border-left: 4px solid var(--rc);
  }
  .reto-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; }
  .reto-icon { font-size: 28px; }
  .reto-reward {
    font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 10px;
    background: var(--rc-bg); color: var(--rc); letter-spacing: 0.3px;
  }
  .reto-title { font-size: 15px; font-weight: 700; color: #104455; margin-bottom: 4px; }
  .reto-desc { font-size: 12px; color: #5a7a84; line-height: 1.5; margin-bottom: 14px; }
  .reto-progress-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .reto-progress-label { font-size: 11px; color: #5a7a84; font-weight: 500; }
  .reto-progress-val { font-size: 11px; font-weight: 700; color: var(--rc); }
  .reto-bar { height: 6px; background: #F2F7F9; border-radius: 3px; overflow: hidden; margin-bottom: 10px; }
  .reto-bar-fill { height: 100%; border-radius: 3px; background: var(--rc); transition: width 0.8s ease; }
  .reto-deadline { font-size: 10px; color: #9db5bc; }

  .milestones-section { margin-bottom: 28px; }
  .milestones-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 12px; }
  .milestone-card {
    background: #fff; border-radius: 14px; padding: 16px;
    box-shadow: 0 2px 12px rgba(16,68,85,0.06);
    text-align: center; opacity: 0.4;
  }
  .milestone-card.unlocked { opacity: 1; border: 1.5px solid #86D2AC; }
  .milestone-card.next { opacity: 0.85; border: 1.5px dashed #86D2AC; }
  .milestone-card-icon { font-size: 28px; margin-bottom: 8px; }
  .milestone-card-name { font-size: 12px; font-weight: 700; color: #104455; margin-bottom: 3px; }
  .milestone-card-req { font-size: 11px; color: #5a7a84; margin-bottom: 6px; }
  .milestone-card-reward { font-size: 10px; font-weight: 600; color: #86D2AC; }
  .milestone-card-next-label { font-size: 10px; font-weight: 600; color: #D4A017; margin-top: 4px; }

  .rule-card {
    background: linear-gradient(135deg,#104455,#1d6278);
    border-radius: 16px; padding: 24px 28px; margin-bottom: 28px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
  }
  .rule-col-title { font-size: 11px; font-weight: 700; color: #86D2AC; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; }
  .rule-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .rule-icon { font-size: 18px; flex-shrink: 0; }
  .rule-text { font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.4; }
  .rule-text strong { color: #fff; }
  .rule-multiplier {
    font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 8px;
    background: rgba(134,210,172,0.2); color: #86D2AC; margin-left: 4px;
  }

  /* ── Perks ── */
  .perks-matrix { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 28px; }
  .perk-tier-card {
    background: #fff; border-radius: 16px; padding: 18px;
    box-shadow: 0 2px 12px rgba(16,68,85,0.06); border-top: 3px solid var(--tc);
  }
  .perk-tier-header { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
  .perk-tier-name { font-size: 14px; font-weight: 700; color: var(--tc); }
  .perk-tier-lp { font-size: 11px; color: #9db5bc; margin-top: 1px; }
  .perk-category { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f0f5f7; }
  .perk-category:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
  .perk-cat-label { display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; color: #5a7a84; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 5px; }
  .perk-value { font-size: 16px; font-weight: 700; color: #104455; margin-bottom: 2px; }
  .perk-detail { font-size: 11px; color: #5a7a84; line-height: 1.4; }
  .perk-partners { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 5px; }
  .perk-partner-chip { font-size: 9px; font-weight: 500; padding: 2px 7px; border-radius: 8px; background: #F2F7F9; color: #5a7a84; border: 1px solid #dde8ec; }
  .cat-note { background: #edf8f3; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; color: #357382; }

  /* ── Consistency banner ── */
  .consistency-banner {
    background: linear-gradient(135deg,#104455,#1d6278,#357382);
    border-radius: 16px; padding: 26px 28px; margin-bottom: 28px;
    position: relative; overflow: hidden;
    box-shadow: 0 4px 20px rgba(16,68,85,0.2);
  }
  .consistency-banner::before { content:'⚡'; position:absolute; right:24px; top:50%; transform:translateY(-50%); font-size:72px; opacity:0.07; pointer-events:none; }
  .consistency-banner-tag { font-size:10px; font-weight:700; color:#86D2AC; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; }
  .consistency-banner-title { font-size:20px; font-weight:700; color:#fff; margin-bottom:6px; }
  .consistency-banner-sub { font-size:12px; color:rgba(255,255,255,0.6); margin-bottom:18px; }
  .consistency-stats { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px; }
  .cstat { background:rgba(134,210,172,0.12); border:1px solid rgba(134,210,172,0.25); border-radius:10px; padding:8px 14px; }
  .cstat-val { font-size:20px; font-weight:700; color:#86D2AC; }
  .cstat-label { font-size:11px; color:rgba(255,255,255,0.55); }
  .consistency-perks-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
  .cperk { background:#fff; border-radius:12px; padding:14px 16px; border-top:2px solid #ff6b35; }
  .cperk-icon { font-size:20px; margin-bottom:6px; }
  .cperk-title { font-size:12px; font-weight:700; color:#104455; margin-bottom:3px; }
  .cperk-detail { font-size:11px; color:#5a7a84; line-height:1.4; }

  /* ── Priority shifts ── */
  .shifts-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 28px; }
  .shift-tier-card { background:#fff; border-radius:16px; padding:18px; box-shadow:0 2px 12px rgba(16,68,85,0.06); border-top:3px solid var(--tc); }
  .shift-tier-name { font-size:14px; font-weight:700; color:var(--tc); margin-bottom:3px; }
  .shift-tier-sub { font-size:10px; color:#9db5bc; margin-bottom:14px; }
  .shift-row { display:flex; align-items:flex-start; gap:8px; margin-bottom:10px; }
  .shift-icon { font-size:15px; flex-shrink:0; margin-top:1px; }
  .shift-row-label { font-size:10px; font-weight:700; color:#5a7a84; text-transform:uppercase; letter-spacing:0.4px; }
  .shift-row-val { font-size:12px; color:#104455; font-weight:500; line-height:1.4; }
  .shift-bonus-pill { display:inline-block; padding:2px 8px; border-radius:10px; background:#edf8f3; color:#2a8a5e; font-size:11px; font-weight:700; margin-top:3px; }
  .shift-facilities { display:flex; flex-direction:column; gap:3px; margin-top:3px; }
  .facility-tag { font-size:10px; padding:2px 8px; border-radius:6px; background:#F2F7F9; color:#357382; border:1px solid #dde8ec; display:inline-block; width:fit-content; }
  .facility-tag.premium { background:#fdf7e6; border-color:#f0d060; color:#8a6a00; }
  .facility-tag.exclusive { background:#eef0fd; border-color:#b0b8f0; color:#3a4ab0; }
  .cat-shift-note { background:#F2F7F9; border-radius:10px; padding:12px 16px; margin-bottom:20px; font-size:12px; color:#5a7a84; }

  /* ── Annual Prize ── */
  .prize-section { margin-bottom: 28px; }
  .prize-hero {
    background: linear-gradient(135deg, #1a1205, #3b2a06, #6b4c0a);
    border-radius: 16px; padding: 24px 28px; margin-bottom: 16px;
    box-shadow: 0 4px 24px rgba(202,138,4,0.2); position: relative; overflow: hidden;
  }
  .prize-hero::before { content:'🏆'; position:absolute; right:28px; top:50%; transform:translateY(-50%); font-size:90px; opacity:0.06; pointer-events:none; }
  .prize-hero-tag { font-size:10px; font-weight:700; color:#fbbf24; text-transform:uppercase; letter-spacing:1.2px; margin-bottom:6px; }
  .prize-hero-title { font-size:20px; font-weight:700; color:#fff; margin-bottom:5px; }
  .prize-hero-sub { font-size:12px; color:rgba(255,255,255,0.55); line-height:1.6; max-width:640px; }

  /* ── Prize matrix ── */
  .prize-matrix {
    background:#fff; border-radius:16px; overflow:hidden;
    box-shadow:0 2px 12px rgba(16,68,85,0.06); margin-bottom:14px;
  }
  .pm-row { display:grid; grid-template-columns:210px repeat(3,1fr); }
  .pm-row + .pm-row { border-top:1px solid #f0f5f7; }
  .pm-header { background:#F2F7F9; }
  .pm-corner {
    padding:16px 20px; display:flex; flex-direction:column; justify-content:flex-end;
    border-right:1px solid #eaeff2;
  }
  .pm-corner-label { font-size:10px; font-weight:700; color:#9db5bc; text-transform:uppercase; letter-spacing:0.5px; }
  .pm-cat-cell {
    padding:16px 18px; text-align:center; border-right:1px solid #eaeff2;
  }
  .pm-cat-cell:last-child { border-right:none; }
  .pm-cat-cluster { font-size:12px; font-weight:700; color:#5a7a84; margin-bottom:6px; display:flex; align-items:center; justify-content:center; gap:5px; }
  .pm-cat-name { font-size:14px; font-weight:700; color:#104455; margin-bottom:2px; line-height:1.3; }
  .pm-cat-shifts { font-size:11px; color:#9db5bc; }

  .pm-level-cell {
    padding:16px 20px; border-right:1px solid #eaeff2;
    display:flex; flex-direction:column; justify-content:center;
  }
  .pm-level-name { display:flex; align-items:center; gap:6px; font-size:15px; font-weight:800; color:var(--pc); margin-bottom:2px; }
  .pm-level-req { font-size:10px; color:#9db5bc; margin-bottom:8px; }
  .pm-level-stats { display:flex; gap:6px; flex-wrap:wrap; }
  .pm-stat-chip { font-size:10px; font-weight:600; padding:2px 8px; border-radius:6px; background:var(--pc-bg,#F2F7F9); color:var(--pc); }

  .pm-status-cell {
    padding:14px 16px; border-right:1px solid #f0f5f7;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:4px; text-align:center;
  }
  .pm-status-cell:last-child { border-right:none; }
  .pm-status-winner {
    background:var(--pc-bg); border-left:3px solid var(--pc);
  }
  .pm-winner-badge {
    display:inline-flex; align-items:center; gap:4px;
    font-size:11px; font-weight:700; padding:4px 12px; border-radius:20px;
    background:var(--pc); color:#fff; margin-bottom:4px;
  }
  .pm-winner-budget { font-size:16px; font-weight:700; color:var(--pc); }
  .pm-passed { font-size:18px; color:#86D2AC; }
  .pm-locked { font-size:11px; font-weight:600; color:#D4A017; }
  .pm-locked-shifts { font-size:10px; color:#9db5bc; margin-top:1px; }
  .pm-none { font-size:20px; color:#e8eff2; }
  .pm-bracket-leader { font-size:13px; font-weight:700; color:#104455; line-height:1.3; margin-bottom:2px; }
  .pm-bracket-shifts { font-size:11px; color:var(--pc); font-weight:600; }
  .pm-bracket-count { font-size:10px; color:#9db5bc; margin-top:3px; }
  .pm-bracket-empty { font-size:20px; color:#e8eff2; }
  .prize-note { font-size:11px; color:#9db5bc; text-align:center; padding:4px 0; }

  /* ── Clasificados por Nivel ── */
  .prize-classified { margin-top:20px; }
  .prize-classified-title { font-size:15px; font-weight:700; color:#104455; margin-bottom:4px; }
  .prize-classified-sub { font-size:13px; color:#5a7a84; margin-bottom:16px; }
  .prize-class-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
  .prize-class-card { background:#fff; border-radius:14px; overflow:hidden; box-shadow:0 2px 12px rgba(16,68,85,0.06); border-top:3px solid var(--pc); }
  .prize-class-card-header { padding:12px 16px 10px; border-bottom:1px solid #f0f5f7; display:flex; align-items:center; gap:8px; }
  .prize-class-card-icon { font-size:18px; }
  .prize-class-card-level { font-size:14px; font-weight:800; color:var(--pc); }
  .prize-class-card-range { font-size:10px; color:#9db5bc; margin-top:1px; }
  .prize-class-card-count { margin-left:auto; font-size:11px; font-weight:600; padding:2px 8px; border-radius:20px; background:var(--pc-bg); color:var(--pc); }
  .prize-class-pro-row { display:grid; grid-template-columns:22px 1fr auto; align-items:center; padding:8px 16px; border-bottom:1px solid #f6f9fa; gap:8px; }
  .prize-class-pro-row:last-child { border-bottom:none; }
  .prize-class-pos { font-size:11px; font-weight:700; color:#9db5bc; }
  .prize-class-name { font-size:12px; font-weight:600; color:#104455; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .prize-class-shifts { font-size:12px; font-weight:700; color:var(--pc); white-space:nowrap; }
  .prize-class-empty { padding:20px 16px; font-size:12px; color:#9db5bc; text-align:center; }

  /* ── Marketplace ── */
  .market-banner {
    background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
    border-radius: 16px; padding: 26px 32px; margin-bottom: 24px;
    display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: center;
    box-shadow: 0 4px 24px rgba(91,111,232,0.2);
  }
  .market-banner-tag { font-size:10px; font-weight:700; color:#a5b4fc; text-transform:uppercase; letter-spacing:1.2px; margin-bottom:6px; }
  .market-banner-title { font-size:22px; font-weight:700; color:#fff; margin-bottom:6px; }
  .market-banner-sub { font-size:12px; color:rgba(255,255,255,0.55); line-height:1.6; max-width:480px; }
  .market-rate-grid { display:flex; flex-direction:column; gap:6px; flex-shrink:0; }
  .market-rate-row { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.07); border-radius:10px; padding:8px 14px; white-space:nowrap; }
  .market-rate-lp { font-size:14px; font-weight:700; color:#a5b4fc; min-width:64px; }
  .market-rate-sep { font-size:11px; color:rgba(255,255,255,0.3); }
  .market-rate-val { font-size:12px; color:rgba(255,255,255,0.75); }

  .market-cats { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:24px; }
  .market-cat-btn {
    display:flex; align-items:center; gap:6px;
    padding:8px 16px; border-radius:20px; cursor:pointer;
    font-size:12px; font-weight:500; color:#5a7a84;
    border:1.5px solid #dde8ec; background:#fff; font-family:inherit; transition:all 0.15s;
  }
  .market-cat-btn:hover { border-color:#86D2AC; color:#104455; }
  .market-cat-btn.active { color:#fff; border-color:transparent; font-weight:600; }
  .market-cat-count { font-size:10px; opacity:0.7; margin-left:2px; }

  .market-featured-section { margin-bottom:28px; }
  .market-featured-label { font-size:11px; font-weight:700; color:#5a7a84; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:12px; display:flex; align-items:center; gap:6px; }
  .market-featured-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }

  .market-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }

  .market-card {
    background:#fff; border-radius:16px; padding:18px;
    box-shadow:0 2px 12px rgba(16,68,85,0.06);
    border-top:3px solid var(--mc); display:flex; flex-direction:column;
    transition:box-shadow 0.15s, transform 0.15s; position:relative;
  }
  .market-card:hover { box-shadow:0 6px 24px rgba(16,68,85,0.12); transform:translateY(-2px); }
  .market-card.featured { border-top-width:4px; box-shadow:0 4px 20px rgba(91,111,232,0.12); }
  .market-card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:10px; }
  .market-card-icon { font-size:26px; line-height:1; }
  .market-card-tag {
    font-size:9px; font-weight:700; padding:3px 8px; border-radius:8px;
    background:var(--mc-bg); color:var(--mc); letter-spacing:0.3px; white-space:nowrap;
  }
  .market-card-name { font-size:13px; font-weight:700; color:#104455; margin-bottom:5px; line-height:1.3; }
  .market-card-desc { font-size:11px; color:#5a7a84; line-height:1.5; flex:1; margin-bottom:12px; }
  .market-card-partner { display:inline-flex; align-items:center; gap:4px; font-size:10px; color:#9db5bc; font-weight:500; margin-bottom:14px; }
  .market-card-footer { margin-top:auto; }
  .market-card-lp-row { display:flex; align-items:baseline; gap:6px; margin-bottom:4px; }
  .market-card-lp { font-size:22px; font-weight:700; color:#5B6FE8; line-height:1; }
  .market-card-lp-label { font-size:11px; font-weight:600; color:#5B6FE8; opacity:0.7; }
  .market-card-shifts { font-size:10px; color:#9db5bc; margin-bottom:12px; }
  .market-cta {
    width:100%; padding:9px; border-radius:10px; cursor:pointer;
    font-size:12px; font-weight:600; color:#fff; text-align:center;
    border:none; background:var(--mc); font-family:inherit;
    transition:opacity 0.15s; display:block;
  }
  .market-cta:hover { opacity:0.85; }
  .market-cta.redeemed { background:#edf8f3; color:#2a8a5e; cursor:default; }

  .market-coming-toast {
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
    background:#104455; color:#fff; border-radius:12px; padding:12px 24px;
    font-size:13px; font-weight:500; box-shadow:0 4px 20px rgba(16,68,85,0.3);
    z-index:1000; pointer-events:none;
    animation: toastIn 0.25s ease, toastOut 0.3s ease 2.2s forwards;
  }
  @keyframes toastIn  { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
  @keyframes toastOut { from { opacity:1; } to { opacity:0; } }

  /* ── Period filter ── */
  .period-bar {
    display: flex; align-items: center; gap: 8px; margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .period-label { font-size: 11px; font-weight: 700; color: #5a7a84; text-transform: uppercase; letter-spacing: 0.5px; margin-right: 4px; }
  .period-btn {
    padding: 7px 16px; border-radius: 20px; cursor: pointer;
    font-size: 12px; font-weight: 500; color: #5a7a84;
    border: 1.5px solid #dde8ec; background: #fff; font-family: inherit; transition: all 0.15s;
  }
  .period-btn:hover { border-color: #86D2AC; color: #104455; }
  .period-btn.active { background: #104455; color: #fff; border-color: #104455; font-weight: 600; }
  .period-btn.refetching { opacity: 0.6; cursor: wait; }
  .custom-range {
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    background: #fff; border: 1.5px solid #dde8ec; border-radius: 12px; padding: 6px 14px;
  }
  .custom-range-label { font-size: 11px; color: #5a7a84; font-weight: 600; }
  .custom-input {
    border: 1px solid #dde8ec; border-radius: 8px; padding: 4px 10px;
    font-size: 12px; font-family: inherit; color: #104455; background: #F2F7F9; outline: none;
  }
  .custom-input:focus { border-color: #86D2AC; }
  .apply-btn {
    padding: 5px 14px; border-radius: 8px; cursor: pointer;
    font-size: 12px; font-weight: 600; color: #fff;
    border: none; background: #104455; font-family: inherit; transition: opacity 0.15s;
  }
  .apply-btn:hover { opacity: 0.85; }
  .apply-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .refetch-indicator {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; color: #86D2AC; font-weight: 500;
  }
  .refetch-spinner { width: 12px; height: 12px; border: 2px solid rgba(134,210,172,0.3); border-top-color: #86D2AC; border-radius: 50%; animation: spin 0.7s linear infinite; }

  /* ── States ── */
  .loading { display:flex; align-items:center; justify-content:center; min-height:300px; color:#5a7a84; font-size:15px; gap:10px; }
  .spinner { width:20px; height:20px; border:2px solid #e8f0f3; border-top-color:#86D2AC; border-radius:50%; animation:spin 0.8s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .error-box { background:#fff0f0; border:1px solid #ffcccc; border-radius:12px; padding:20px; color:#c0392b; font-size:14px; margin-bottom:24px; }

  .consistency-leaderboard { background:#fff; border-radius:14px; box-shadow:0 2px 12px rgba(16,68,85,0.06); overflow:hidden; margin-top:16px; }

  /* ── Urgent shifts ── */
  .urgent-banner {
    background: linear-gradient(135deg, #7f1d1d, #b91c1c, #e85d04);
    border-radius: 16px; padding: 26px 32px; margin-bottom: 24px;
    position: relative; overflow: hidden;
    box-shadow: 0 4px 24px rgba(232,93,4,0.25);
  }
  .urgent-banner::before { content:'🚨'; position:absolute; right:28px; top:50%; transform:translateY(-50%); font-size:80px; opacity:0.08; pointer-events:none; }
  .urgent-banner-tag { font-size:10px; font-weight:700; color:#fca5a5; text-transform:uppercase; letter-spacing:1.2px; margin-bottom:6px; }
  .urgent-banner-title { font-size:22px; font-weight:700; color:#fff; margin-bottom:6px; }
  .urgent-banner-sub { font-size:12px; color:rgba(255,255,255,0.6); margin-bottom:20px; max-width:560px; line-height:1.5; }
  .urgent-stats-row { display:flex; gap:12px; flex-wrap:wrap; }
  .ustat { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); border-radius:10px; padding:10px 16px; min-width:120px; }
  .ustat-val { font-size:22px; font-weight:700; color:#fff; line-height:1; }
  .ustat-label { font-size:11px; color:rgba(255,255,255,0.55); margin-top:3px; }

  .urgent-hero {
    background:#fff; border-radius:16px; padding:22px 26px; margin-bottom:24px;
    box-shadow: 0 2px 12px rgba(16,68,85,0.06);
    border-left: 4px solid #e85d04;
    display: flex; align-items: center; gap: 20px;
  }
  .urgent-hero-crown { font-size:42px; flex-shrink:0; }
  .urgent-hero-label { font-size:10px; font-weight:700; color:#e85d04; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:4px; }
  .urgent-hero-name { font-size:20px; font-weight:700; color:#104455; margin-bottom:6px; }
  .urgent-hero-stats { display:flex; gap:16px; flex-wrap:wrap; }
  .urgent-hero-stat { font-size:12px; color:#5a7a84; }
  .urgent-hero-stat strong { color:#104455; font-weight:700; }
  .urgent-hero-bonus { display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; background:#fff3e0; color:#e85d04; margin-left:auto; flex-shrink:0; }

  .urgent-lb { background:#fff; border-radius:16px; box-shadow:0 2px 12px rgba(16,68,85,0.06); overflow:hidden; }
  .urgent-lb-header {
    display:grid; grid-template-columns: 44px 1fr 100px 110px 100px 90px 100px;
    padding:11px 20px; background:#fff8f5;
    font-size:10px; font-weight:700; color:#9b4a1a;
    text-transform:uppercase; letter-spacing:0.6px; border-bottom:1px solid #fde8d8;
  }
  .urgent-lb-row {
    display:grid; grid-template-columns: 44px 1fr 100px 110px 100px 90px 100px;
    padding:12px 20px; border-bottom:1px solid #fdf5f0;
    align-items:center; transition:background 0.1s;
  }
  .urgent-lb-row:last-child { border-bottom:none; }
  .urgent-lb-row:hover { background:#fffaf7; }
  .urgent-val { font-size:13px; font-weight:700; color:#e85d04; }
  .bonus-rate-pill { display:inline-flex; align-items:center; gap:3px; padding:3px 9px; border-radius:20px; font-size:10px; font-weight:700; background:#fff3e0; color:#e85d04; }
  .urgent-empty { background:#fff; border-radius:16px; padding:48px; text-align:center; box-shadow:0 2px 12px rgba(16,68,85,0.06); }
  .urgent-empty-icon { font-size:48px; margin-bottom:12px; }
  .urgent-empty-title { font-size:16px; font-weight:700; color:#104455; margin-bottom:6px; }
  .urgent-empty-sub { font-size:13px; color:#5a7a84; }

  /* ── Reto rankings ── */
  .reto-rankings-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 28px; }
  .reto-rank-card {
    background: #fff; border-radius: 16px;
    box-shadow: 0 2px 12px rgba(16,68,85,0.06);
    border-top: 3px solid var(--rc); overflow: hidden;
  }
  .reto-rank-header {
    padding: 14px 18px 10px; border-bottom: 1px solid #f0f5f7;
    display: flex; align-items: center; gap: 8px;
  }
  .reto-rank-title { font-size: 13px; font-weight: 700; color: #104455; }
  .reto-rank-metric { font-size: 11px; color: #9db5bc; margin-top: 1px; }
  .reto-rank-row {
    display: grid; grid-template-columns: 28px 1fr 44px;
    align-items: center; padding: 9px 18px;
    border-bottom: 1px solid #f6f9fa; font-size: 12px;
  }
  .reto-rank-row:last-child { border-bottom: none; }
  .reto-rank-pos { font-size: 11px; font-weight: 700; color: #9db5bc; }
  .reto-rank-name { font-weight: 500; color: #104455; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .reto-rank-val { font-weight: 700; color: var(--rc); text-align: right; }
  .reto-rank-bar-wrap { grid-column: 1/-1; padding: 0 18px 8px; margin-top: -4px; }
  .reto-rank-bar { height: 2px; background: #F2F7F9; border-radius: 1px; }
  .reto-rank-bar-fill { height: 100%; border-radius: 1px; background: var(--rc); opacity: 0.4; }
  .reto-rank-empty { padding: 20px 18px; font-size: 12px; color: #9db5bc; text-align: center; }
`

// ─── Data types ────────────────────────────────────────────────────────────────
type Professional = {
  category_code: string; professional_id: number
  first_name: string; last_name: string
  shifts_completed: number; total_earned: number; avg_per_shift: number
  livo_points: number; weekend_shifts: number; night_shifts: number; unique_facilities: number
}
type ClusterStats = {
  category_code: string; active_pros: number
  total_shifts: number; avg_payment_per_shift: number; total_earnings: number
}
type ChallengeStats = {
  category_code: string; shifts_this_month: number
  pros_active_this_month: number; weekend_shifts_month: number
}
type ConsistentPro = {
  category_code: string; professional_id: number
  first_name: string; last_name: string
  total_shifts: number; weeks_active: number; avg_weekly_shifts: number
}
type MonthlyPro = {
  category_code: string; professional_id: number
  first_name: string; last_name: string
  shifts_this_month: number; weekend_shifts_month: number
  night_shifts_month: number; facilities_this_month: number
}
type UrgentPro = {
  category_code: string; professional_id: number
  first_name: string; last_name: string
  urgent_shifts: number; urgent_earnings: number
  avg_per_urgent: number; avg_notice_hours: number; shifts_with_bonus: number
}
type UrgentStats = {
  category_code: string; total_urgent: number; pros_covering: number
  avg_pay: number; total_earnings: number; shifts_with_bonus: number
}
type LoyaltyData = {
  leaderboard: Professional[]; stats: ClusterStats[]
  challenges: ChallengeStats[]; consistent: ConsistentPro[]
  monthlyPros: MonthlyPro[]
  urgentStats: UrgentStats[]; urgent: UrgentPro[]
  fetchedAt: string
}

// ─── Tier definitions ──────────────────────────────────────────────────────────
// LP = shifts × 10, so LP thresholds = shift thresholds × 10
const TIERS: Record<string, { name: string; minLP: number; color: string; bg: string; icon: string; desc: string }[]> = {
  ENF: [
    { name: 'Elite',      minLP: 1000, color: '#5B6FE8', bg: '#eef0fd', icon: '🏆', desc: '100+ turnos' },
    { name: 'Referente',  minLP: 500,  color: '#D4A017', bg: '#fdf7e6', icon: '⭐', desc: '50–99 turnos' },
    { name: 'Activo',     minLP: 200,  color: '#357382', bg: '#e8f4f7', icon: '🚀', desc: '20–49 turnos' },
    { name: 'Emergente',  minLP: 10,   color: '#86D2AC', bg: '#edf8f3', icon: '🌱', desc: '1–19 turnos' },
  ],
  TCAE: [
    { name: 'Elite',      minLP: 500,  color: '#5B6FE8', bg: '#eef0fd', icon: '🏆', desc: '50+ turnos' },
    { name: 'Referente',  minLP: 250,  color: '#D4A017', bg: '#fdf7e6', icon: '⭐', desc: '25–49 turnos' },
    { name: 'Activo',     minLP: 100,  color: '#357382', bg: '#e8f4f7', icon: '🚀', desc: '10–24 turnos' },
    { name: 'Emergente',  minLP: 10,   color: '#86D2AC', bg: '#edf8f3', icon: '🌱', desc: '1–9 turnos'  },
  ],
  DOC: [
    { name: 'Elite',      minLP: 110,  color: '#5B6FE8', bg: '#eef0fd', icon: '🏆', desc: '11+ turnos' },
    { name: 'Referente',  minLP: 60,   color: '#D4A017', bg: '#fdf7e6', icon: '⭐', desc: '6–10 turnos' },
    { name: 'Activo',     minLP: 20,   color: '#357382', bg: '#e8f4f7', icon: '🚀', desc: '2–5 turnos'  },
    { name: 'Emergente',  minLP: 10,   color: '#86D2AC', bg: '#edf8f3', icon: '🌱', desc: '1 turno'     },
  ],
}

const MILESTONES = [
  { id: 'first',    shifts: 1,   icon: '🎯', name: 'Primer turno',    reward: '+10 LP de bienvenida' },
  { id: 'diez',     shifts: 10,  icon: '🔥', name: 'Decena',          reward: '+20 LP bonus' },
  { id: 'veinti',   shifts: 25,  icon: '⚡', name: 'Constante',       reward: '+1% tarifa permanente' },
  { id: 'cincuenta',shifts: 50,  icon: '💪', name: 'Medio centenario', reward: 'Acceso sala VIP viajes' },
  { id: 'cien',     shifts: 100, icon: '🏅', name: 'Centenario',      reward: 'AM dedicado + regalo Livo' },
]

const CLUSTERS = [
  { code: 'ENF',  label: 'Enfermería', icon: '👩‍⚕️' },
  { code: 'TCAE', label: 'TCAE',       icon: '🏥'   },
  { code: 'DOC',  label: 'Doctores',   icon: '👨‍⚕️' },
]

// ─── Annual Prize ─────────────────────────────────────────────────────────────
const ANNUAL_PRIZES = [
  { level: 'Bronze',  minShifts: 25, revenue: 5000,  budget: 1000, pct: 20, color: '#b45309', bg: '#fef3c7', icon: '🥉' },
  { level: 'Plata',   minShifts: 50, revenue: 10000, budget: 2500, pct: 25, color: '#4b5563', bg: '#f3f4f6', icon: '🥈' },
  { level: 'Oro',     minShifts: 75, revenue: 15000, budget: 4500, pct: 30, color: '#ca8a04', bg: '#fefce8', icon: '🥇' },
  { level: 'Platino', minShifts: 90, revenue: 18000, budget: 6300, pct: 35, color: '#7c3aed', bg: '#f5f3ff', icon: '💎' },
]

function getAnnualPrize(shifts: number) {
  for (let i = ANNUAL_PRIZES.length - 1; i >= 0; i--) {
    if (shifts >= ANNUAL_PRIZES[i].minShifts) return ANNUAL_PRIZES[i]
  }
  return null
}

// ─── Marketplace ───────────────────────────────────────────────────────────────
type MarketItem = {
  id: string; category: string; icon: string; name: string
  desc: string; lpCost: number; partner: string
  featured?: boolean; tag?: string
}

const MARKET_CATS = [
  { key: 'all',       label: 'Todo',          icon: '🛒', color: '#104455' },
  { key: 'formation', label: 'Formación',      icon: '🎓', color: '#5B6FE8' },
  { key: 'travel',    label: 'Viajes',         icon: '✈️', color: '#357382' },
  { key: 'dining',    label: 'Restaurantes',   icon: '🍽️', color: '#e85d04' },
  { key: 'wellness',  label: 'Wellness',       icon: '🧘', color: '#2a8a5e' },
  { key: 'tech',      label: 'Tech',           icon: '📱', color: '#7c3aed' },
  { key: 'clinical',  label: 'Equipamiento',   icon: '🩺', color: '#0891b2' },
  { key: 'giftcard',  label: 'Gift Cards',     icon: '💳', color: '#D4A017' },
]

const MARKET_ITEMS: MarketItem[] = [
  // Formación
  { id: 'f1', category: 'formation', icon: '📱', name: 'Plataforma e-learning 1 mes',     desc: '+200 cursos acreditados para sanitarios con certificado oficial',           lpCost: 100,  partner: 'Aula Salud',    tag: 'Más popular' },
  { id: 'f2', category: 'formation', icon: '🎓', name: 'Curso ACLS/BLS online',            desc: 'Certificación en soporte vital avanzado y básico reconocida por la AHA',    lpCost: 400,  partner: 'AHA Spain' },
  { id: 'f3', category: 'formation', icon: '🏥', name: 'Postgrado UCI Adulto — €300 dto',  desc: 'Descuento directo sobre la matrícula del postgrado de cuidados intensivos',  lpCost: 1500, partner: 'Univ. Barcelona', featured: true },
  { id: 'f4', category: 'formation', icon: '🔬', name: 'Máster Enf. Quirúrgica — €600 dto',desc: 'Descuento aplicado en el máster oficial de enfermería de quirófano',          lpCost: 4000, partner: 'Blanquerna',   tag: 'Premium' },
  { id: 'f5', category: 'formation', icon: '📚', name: 'EvidenceNurse Premium 6 meses',    desc: 'Acceso a base de datos de evidencia enfermera, protocolos y guías clínicas', lpCost: 300,  partner: 'EvidenceNurse' },

  // Viajes
  { id: 'v1', category: 'travel',    icon: '✈️', name: 'Vuelo nacional hasta €80',        desc: 'Voucher para vuelo nacional en aerolíneas partner · sin restricción de fecha', lpCost: 600,  partner: 'Vueling',      tag: 'Más popular' },
  { id: 'v2', category: 'travel',    icon: '🏨', name: '2 noches hotel ciudad española',  desc: 'Hotel 3★ o superior en Madrid, Barcelona, Valencia o Sevilla',                lpCost: 900,  partner: 'Booking.com' },
  { id: 'v3', category: 'travel',    icon: '🌍', name: 'Vuelo europeo hasta €150',        desc: 'Voucher para vuelo a cualquier destino europeo en aerolíneas Iberia Group',   lpCost: 1200, partner: 'Iberia',       featured: true },
  { id: 'v4', category: 'travel',    icon: '🏖️', name: 'Pack spa 2 noches',              desc: 'Escapada a hotel balneario con acceso a spa y desayuno incluido',              lpCost: 1800, partner: 'NH Hotels',    tag: 'Limitado' },

  // Restaurantes
  { id: 'r1', category: 'dining',    icon: '🍽️', name: 'Voucher restaurante €20',        desc: 'Canjeable en más de 200 restaurantes partner en toda España',                  lpCost: 150,  partner: 'TheFork',      tag: 'Más popular' },
  { id: 'r2', category: 'dining',    icon: '🥂', name: 'Cena para 2 con copa incluida',  desc: 'Menú completo para dos en restaurantes seleccionados de la red Livo',           lpCost: 400,  partner: 'Lateral' },
  { id: 'r3', category: 'dining',    icon: '⭐', name: 'Menú degustación premium',       desc: 'Experiencia gastronómica con maridaje de vinos en restaurante premium',         lpCost: 700,  partner: 'Grupo Sagardi' },

  // Wellness
  { id: 'w1', category: 'wellness',  icon: '🧘', name: 'App meditación Calm 1 año',      desc: 'Suscripción anual premium para mindfulness y gestión del estrés post-turno',   lpCost: 120,  partner: 'Calm',         tag: 'Más popular' },
  { id: 'w2', category: 'wellness',  icon: '🧖', name: 'Sesión masaje 60 min',           desc: 'Masaje relajante o descontracturante en centros de bienestar partner',          lpCost: 300,  partner: 'Neoforma' },
  { id: 'w3', category: 'wellness',  icon: '💪', name: '1 mes de gimnasio gratis',       desc: 'Cuota mensual en cualquier centro de la red VivaGym o Anytime Fitness',         lpCost: 350,  partner: 'VivaGym' },
  { id: 'w4', category: 'wellness',  icon: '🌿', name: 'Retiro bienestar 3 días',        desc: 'Escapada a centro de retiro con yoga, meditación y alimentación saludable',     lpCost: 1800, partner: 'SHA Wellness',  featured: true, tag: 'Limitado' },

  // Tech
  { id: 't1', category: 'tech',      icon: '🎧', name: 'Auriculares inalámbricos',       desc: 'Auriculares Bluetooth con cancelación de ruido activa · ideal post-turno',      lpCost: 800,  partner: 'Amazon',       tag: 'Nuevo' },
  { id: 't2', category: 'tech',      icon: '⌚', name: 'Smartwatch de salud',            desc: 'Reloj inteligente con monitorización de sueño, estrés y actividad física',      lpCost: 2000, partner: 'Samsung Health', featured: true },
  { id: 't3', category: 'tech',      icon: '🖥️', name: 'Voucher tech €150',             desc: 'Vale de compra en MediaMarkt o El Corte Inglés tecnología',                     lpCost: 1500, partner: 'MediaMarkt' },

  // Equipamiento clínico
  { id: 'c1', category: 'clinical',  icon: '🩺', name: 'Estetoscopio Littmann Classic', desc: 'Littmann Classic III, el estándar de oro en auscultación clínica',              lpCost: 700,  partner: 'Livo Store',   tag: 'Más popular' },
  { id: 'c2', category: 'clinical',  icon: '👟', name: 'Zuecos ergonómicos premium',    desc: 'Zuecos profesionales con soporte de arco y plantilla antiestática',              lpCost: 350,  partner: 'Clogs & Care' },
  { id: 'c3', category: 'clinical',  icon: '💊', name: 'Kit diagnóstico completo',      desc: 'Set con otoscopio, oftalmoscopio y tensiómetro digital profesional',             lpCost: 500,  partner: 'Livo Store' },

  // Gift Cards
  { id: 'g1', category: 'giftcard',  icon: '🛍️', name: 'Amazon Gift Card €20',          desc: 'Tarjeta regalo Amazon válida para cualquier producto',                          lpCost: 200,  partner: 'Amazon',       tag: 'Más popular' },
  { id: 'g2', category: 'giftcard',  icon: '🛍️', name: 'Amazon Gift Card €50',          desc: 'Tarjeta regalo Amazon válida para cualquier producto',                          lpCost: 500,  partner: 'Amazon' },
  { id: 'g3', category: 'giftcard',  icon: '🏬', name: 'El Corte Inglés €50',           desc: 'Tarjeta regalo válida en cualquier sección de El Corte Inglés',                 lpCost: 500,  partner: 'El Corte Inglés' },
  { id: 'g4', category: 'giftcard',  icon: '🏃', name: 'Decathlon €30',                 desc: 'Tarjeta regalo para material deportivo en cualquier tienda Decathlon',           lpCost: 300,  partner: 'Decathlon' },
]

// LP multipliers applied client-side (server sends raw LP = shifts×10)
function computeLP(pro: Professional, isConsistent: boolean) {
  let lp = Number(pro.shifts_completed) * 10
  lp += Number(pro.weekend_shifts) * 2
  lp += Number(pro.night_shifts) * 3
  if (isConsistent) lp = Math.round(lp * 1.2)
  return lp
}

function getTier(code: string, lp: number) {
  const tiers = TIERS[code] ?? TIERS.ENF
  return tiers.find((t) => lp >= t.minLP) ?? tiers[tiers.length - 1]
}

function getNextTier(code: string, lp: number) {
  const tiers = TIERS[code] ?? TIERS.ENF
  const idx = tiers.findIndex((t) => lp >= t.minLP)
  return idx > 0 ? tiers[idx - 1] : null
}

function tierProgress(code: string, lp: number) {
  const tier = getTier(code, lp)
  const next = getNextTier(code, lp)
  if (!next) return 100
  const tiers = TIERS[code] ?? TIERS.ENF
  const tierIdx = tiers.findIndex((t) => t.name === tier.name)
  const prevMin = tiers[tierIdx + 1]?.minLP ?? 0
  return Math.min(100, Math.round(((lp - prevMin) / (next.minLP - prevMin)) * 100))
}

function getMilestones(shifts: number) {
  return MILESTONES.map((m) => ({
    ...m,
    unlocked: shifts >= m.shifts,
    isNext: shifts < m.shifts && MILESTONES.filter((x) => x.shifts > shifts)[0]?.id === m.id,
  }))
}

const PERK_CATEGORIES = [
  {
    key: 'university', icon: '🎓', label: 'Formación',
    partners: { ENF: ['Univ. Barcelona', 'UAB', 'Blanquerna'], TCAE: ['UAB', 'Fundació Pere Tarrés', 'SEAS'], DOC: ['UPF', 'UB Medicina', 'IESE Health'] },
    tiers: {
      Emergente: { value: '5%',  detail: '5% en másters y postgrados de salud' },
      Activo:    { value: '10%', detail: '10% + acceso a becas parciales' },
      Referente: { value: '15%', detail: '15% + matrícula prioritaria garantizada' },
      Elite:     { value: '20%', detail: '20% + mentoría con catedráticos + carta Livo' },
    },
  },
  {
    key: 'travel', icon: '✈️', label: 'Viajes',
    partners: { ENF: ['Iberia', 'Vueling', 'Booking'], TCAE: ['Vueling', 'Civitatis', 'HotelBeds'], DOC: ['Iberia Business', 'NH Hotels', 'Amex Travel'] },
    tiers: {
      Emergente: { value: '5%',  detail: '5% en vuelos seleccionados' },
      Activo:    { value: '8%',  detail: '8% vuelos + 6% hoteles partner' },
      Referente: { value: '12%', detail: '12% vuelos + 10% hoteles + sala VIP' },
      Elite:     { value: '15%', detail: '15% + upgrades gratuitos + sala VIP siempre' },
    },
  },
  {
    key: 'restaurants', icon: '🍽️', label: 'Restaurantes',
    partners: { ENF: ['Lateral', 'La Tagliatella', 'TGB'], TCAE: ['TGB', 'Parking Pizza', 'Goiko'], DOC: ['Grupo Sagardi', 'Honest Greens', 'Rías de Galicia'] },
    tiers: {
      Emergente: { value: '2×1',  detail: 'Menú del día 2×1 entre semana' },
      Activo:    { value: '10%',  detail: '10% en carta completa · fines incluidos' },
      Referente: { value: '15%',  detail: '15% + postre gratis + reserva garantizada' },
      Elite:     { value: '20%',  detail: '20% + mesa VIP siempre + menú degustación' },
    },
  },
  {
    key: 'wellness', icon: '🧘', label: 'Wellness',
    partners: { ENF: ['VivaGym', 'Anytime Fitness', 'Neoforma'], TCAE: ['VivaGym', 'Yoga Studio BCN', 'Calm App'], DOC: ['Meliá Spa', 'SHA Wellness', 'Mindfulness MD'] },
    tiers: {
      Emergente: { value: '10%', detail: '10% en cuotas de gimnasio partner' },
      Activo:    { value: '15%', detail: '15% gym + 1 clase grupal/mes gratis' },
      Referente: { value: '20%', detail: '20% + sesión personal trainer mensual' },
      Elite:     { value: '25%', detail: '25% + acceso spa mensual + retiro anual' },
    },
  },
]

const CAT_NOTES: Record<string, string> = {
  ENF:  'Los beneficios de <strong>Enfermería</strong> priorizan formación en UCI, quirófano y especialidades avanzadas.',
  TCAE: 'Para <strong>TCAE</strong>, el programa facilita la progresión hacia Grado de Enfermería y técnicas especializadas.',
  DOC:  'Los beneficios de <strong>Doctores</strong> incluyen MBA Salud, congresos internacionales y viajes Business.',
}

const PRIORITY_SHIFTS: Record<string, {
  sub: string; access: string; rateBonus: string | null; guaranteed: string | null
  facilities: Record<string, string[]>
}> = {
  Emergente: {
    sub: 'Acceso estándar al marketplace',
    access: 'Mismo acceso que todos los profesionales',
    rateBonus: null, guaranteed: null,
    facilities: { ENF: ['Centros verificados'], TCAE: ['Centros verificados'], DOC: ['Clínicas verificadas'] },
  },
  Activo: {
    sub: '+2h antes que Emergente',
    access: 'Notificación 2h antes de la publicación general',
    rateBonus: '+5%', guaranteed: null,
    facilities: { ENF: ['Centros verificados', 'Hospitales concertados'], TCAE: ['Centros verificados', 'Residencias premium'], DOC: ['Hospitales concertados', 'Clínicas privadas'] },
  },
  Referente: {
    sub: '+4h antes del mercado público',
    access: 'First look 4h antes + alertas push personalizadas',
    rateBonus: '+8%', guaranteed: '4 turnos/mes garantizados',
    facilities: { ENF: ['Hospitales Universitarios', 'Grupos premium'], TCAE: ['Residencias premium', 'Hospitales concertados'], DOC: ['Hospitales Universitarios', 'Clínicas de alta gama'] },
  },
  Elite: {
    sub: '24h antes + turnos reservados',
    access: '24h antes del mercado + pool de turnos exclusivos Elite',
    rateBonus: '+12%', guaranteed: '10 turnos/mes garantizados',
    facilities: { ENF: ['Top 10 hospitales España', 'Centros JCI', 'Grupos exclusivos Livo'], TCAE: ['Hospitales top', 'Centros especializados exclusivos'], DOC: ['Top 10 hospitales España', 'Centros privados de lujo', 'Centros internacionales'] },
  },
}

const SHIFT_CAT_NOTES: Record<string, string> = {
  ENF:  '<strong>Enfermeras:</strong> A partir de Referente, acceso exclusivo a UCI, Neonatos y Quirófano en hospitales universitarios.',
  TCAE: '<strong>TCAE:</strong> Elite abre acceso a hospitales de alta complejidad y residencias privadas de referencia nacional.',
  DOC:  '<strong>Doctores:</strong> Activo+ incluye urgencias de hospitales privados. Referente+ accede a grupos exclusivos con tarifa negociada.',
}

// Defines which monthly metric backs each challenge ranking, per cluster
const CHALLENGE_RANK_DEFS: Record<string, { title: string; icon: string; field: string; metricLabel: string; unit: string; color: string }[]> = {
  ENF: [
    { title: 'Maratón de mayo',       icon: '📅', field: 'shifts_this_month',    metricLabel: 'turnos completados en mayo', unit: 'turnos', color: '#5B6FE8' },
    { title: 'Guardias nocturnas',    icon: '🌙', field: 'night_shifts_month',   metricLabel: 'turnos nocturnos (22h–6h)',   unit: 'noches', color: '#104455' },
    { title: 'Explorador de centros', icon: '🏥', field: 'facilities_this_month', metricLabel: 'centros distintos este mes', unit: 'centros', color: '#86D2AC' },
  ],
  TCAE: [
    { title: 'Reto del mes',          icon: '📅', field: 'shifts_this_month',    metricLabel: 'turnos completados en mayo', unit: 'turnos', color: '#5B6FE8' },
    { title: 'Nuevas instalaciones',  icon: '🤝', field: 'facilities_this_month', metricLabel: 'centros distintos este mes', unit: 'centros', color: '#D4A017' },
    { title: 'Fin de semana',         icon: '📆', field: 'weekend_shifts_month', metricLabel: 'turnos en fin de semana',     unit: 'turnos', color: '#86D2AC' },
  ],
  DOC: [
    { title: 'Turno doble',           icon: '📅', field: 'shifts_this_month',    metricLabel: 'turnos completados en mayo', unit: 'turnos', color: '#5B6FE8' },
    { title: 'Fin de semana',         icon: '🌙', field: 'weekend_shifts_month', metricLabel: 'turnos en fin de semana',     unit: 'turnos', color: '#D4A017' },
    { title: 'Explorador',            icon: '🏥', field: 'facilities_this_month', metricLabel: 'centros distintos este mes', unit: 'centros', color: '#357382' },
  ],
}

function fmt(n: number) { return new Intl.NumberFormat('es-ES').format(n) }
function fmtEur(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// Days left in current month
function daysLeftInMonth() {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return end.getDate() - now.getDate()
}

export default function LoyaltyPage() {
  const [data, setData] = useState<LoyaltyData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refetching, setRefetching] = useState(false)
  const [cluster, setCluster] = useState('ENF')
  const [view, setView] = useState<'ranking' | 'retos' | 'tienda' | 'beneficios' | 'turnos' | 'urgentes'>('ranking')
  const [period, setPeriod] = useState<Period>('year')
  const [marketCat, setMarketCat] = useState('all')
  const [toastItem, setToastItem] = useState<string | null>(null)
  const [customFrom, setCustomFrom] = useState('')
  const today = new Date().toISOString().slice(0, 10)
  const [customTo, setCustomTo] = useState(today)
  const abortRef = useRef<AbortController | null>(null)

  const fetchData = useCallback((p: Period, from?: string, to?: string, isInitial = false) => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    if (isInitial) setLoading(true); else setRefetching(true)
    setError(null)
    let url = `/api/loyalty?period=${p}`
    if (p === 'custom' && from && to) url += `&from=${from}&to=${to}`
    fetch(url, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setData(d) })
      .catch((e) => { if (e.name !== 'AbortError') setError('No se pudo conectar con Metabase') })
      .finally(() => { setLoading(false); setRefetching(false) })
  }, [])

  useEffect(() => { fetchData('year', undefined, undefined, true) }, [fetchData])

  const handlePeriod = (p: Period) => {
    setPeriod(p)
    if (p !== 'custom') fetchData(p)
  }

  const handleRedeem = (itemName: string) => {
    setToastItem(itemName)
    setTimeout(() => setToastItem(null), 2500)
  }

  const allStats     = data?.stats ?? []
  const allConsistent = data?.consistent ?? []
  const clusterPros  = (data?.leaderboard ?? []).filter((p) => p.category_code === cluster)
  const clusterStats = allStats.find((s) => s.category_code === cluster)
  const clusterConsistent = allConsistent.filter((p) => p.category_code === cluster)
  const consistentIds = new Set(clusterConsistent.map((p) => p.professional_id))
  const challengeStats = data?.challenges?.find((c) => c.category_code === cluster)
  const monthlyCluster = (data?.monthlyPros ?? []).filter((p) => p.category_code === cluster)
  const urgentCluster  = (data?.urgent ?? []).filter((p) => p.category_code === cluster)
  const urgentStat     = data?.urgentStats?.find((s) => s.category_code === cluster)

  const periodShort = period === 'custom' && customFrom && customTo
    ? `${customFrom} – ${customTo}`
    : (PERIOD_OPTIONS.find(p => p.key === period)?.short ?? 'últimos 12 meses')

  const totalPros     = allStats.reduce((a, s) => a + Number(s.active_pros), 0)
  const totalShifts   = allStats.reduce((a, s) => a + Number(s.total_shifts), 0)
  const totalEarnings = allStats.reduce((a, s) => a + Number(s.total_earnings), 0)

  const tierDefs = TIERS[cluster]

  const prosWithLP = clusterPros.map((p) => ({
    ...p,
    effectiveLP: computeLP(p, consistentIds.has(p.professional_id)),
  })).sort((a, b) => b.effectiveLP - a.effectiveLP)

  const tierBreakdown = tierDefs.map((tier) => ({
    ...tier,
    count: prosWithLP.filter((p) => getTier(cluster, p.effectiveLP).name === tier.name).length,
  }))
  const maxCount = Math.max(...tierBreakdown.map((t) => t.count), 1)

  const days = daysLeftInMonth()
  const monthName = new Date().toLocaleString('es-ES', { month: 'long' })

  // Monthly challenges per cluster
  const CHALLENGES: Record<string, {
    icon: string; title: string; desc: string; reward: string
    current: number; target: number; color: string; colorBg: string
  }[]> = {
    ENF: [
      { icon: '📅', title: 'Maratón de mayo', desc: 'Completa 8 o más turnos este mes y suma 80 LP extra.', reward: '+80 LP', current: Math.min(Number(challengeStats?.shifts_this_month ?? 0), 8), target: 8, color: '#5B6FE8', colorBg: '#eef0fd' },
      { icon: '🌙', title: 'Guardias nocturnas', desc: 'Trabaja 3 turnos en horario nocturno (22h–6h) este mes.', reward: '+45 LP + badge', current: 1, target: 3, color: '#104455', colorBg: '#e0edf2' },
      { icon: '🏥', title: 'Explorador de centros', desc: 'Trabaja en al menos 2 centros distintos a los que ya conoces.', reward: '+30 LP', current: Number(challengeStats?.pros_active_this_month ?? 0) > 5 ? 1 : 0, target: 2, color: '#86D2AC', colorBg: '#edf8f3' },
    ],
    TCAE: [
      { icon: '📅', title: `Reto ${monthName}`, desc: 'Completa 5 o más turnos este mes para ganar LP extra.', reward: '+50 LP', current: Math.min(Number(challengeStats?.shifts_this_month ?? 0), 5), target: 5, color: '#5B6FE8', colorBg: '#eef0fd' },
      { icon: '🤝', title: 'Nuevas instalaciones', desc: 'Trabaja en un centro nuevo que no hayas visitado antes.', reward: '+25 LP + badge', current: 0, target: 1, color: '#D4A017', colorBg: '#fdf7e6' },
      { icon: '⭐', title: 'Valoración perfecta', desc: 'Recibe una valoración de 5 estrellas en tus turnos de este mes.', reward: '+20 LP', current: 0, target: 1, color: '#86D2AC', colorBg: '#edf8f3' },
    ],
    DOC: [
      { icon: '📅', title: 'Turno doble', desc: 'Completa 4 turnos este mes.', reward: '+40 LP', current: Math.min(Number(challengeStats?.shifts_this_month ?? 0), 4), target: 4, color: '#5B6FE8', colorBg: '#eef0fd' },
      { icon: '🏆', title: 'Especialista', desc: 'Trabaja en 2 especialidades distintas este mes.', reward: '+30 LP + badge', current: 0, target: 2, color: '#D4A017', colorBg: '#fdf7e6' },
      { icon: '🌙', title: 'Guardia de fin de semana', desc: 'Completa 1 turno en fin de semana.', reward: '+15 LP', current: Math.min(Number(challengeStats?.weekend_shifts_month ?? 0), 1), target: 1, color: '#357382', colorBg: '#e8f4f7' },
    ],
  }

  return (
    <div className="page">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ── Header ── */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">L</div>
          <div>
            <div className="header-title">Livo Pro Loyalty</div>
            <div className="header-sub">Programa de Fidelización · Temporada 2025–2026</div>
          </div>
        </div>
        <div className="header-meta">
          {data && <>Actualizado: {fmtDate(data.fetchedAt)}<br />Período: {periodShort} · 1 LP = 1 turno base</>}
        </div>
      </header>

      <div className="container">
        {error && <div className="error-box">⚠️ {error}</div>}

        {loading ? (
          <div className="loading"><div className="spinner" /> Cargando datos de Metabase…</div>
        ) : data && (
          <>
            {/* ── Summary ── */}
            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-card-label">Profesionales Activos</div>
                <div className="summary-card-value">{fmt(totalPros)}</div>
                <div className="summary-card-sub">ENF + TCAE + DOC</div>
              </div>
              <div className="summary-card">
                <div className="summary-card-label">Turnos Completados</div>
                <div className="summary-card-value">{fmt(totalShifts)}</div>
                <div className="summary-card-sub">{periodShort}</div>
              </div>
              <div className="summary-card">
                <div className="summary-card-label">Ingresos Totales Pros</div>
                <div className="summary-card-value">{fmtEur(totalEarnings)}</div>
                <div className="summary-card-sub">pagado a profesionales</div>
              </div>
              <div className="summary-card orange">
                <div className="summary-card-label">⚡ Pros Consistentes</div>
                <div className="summary-card-value">{fmt(allConsistent.length)}</div>
                <div className="summary-card-sub">≥ 2 turnos/semana</div>
              </div>
            </div>

            {/* ── Period filter ── */}
            <div className="period-bar">
              <span className="period-label">Período</span>
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  className={`period-btn${period === opt.key ? ' active' : ''}${refetching ? ' refetching' : ''}`}
                  onClick={() => handlePeriod(opt.key)}
                  disabled={refetching}
                >
                  {opt.label}
                </button>
              ))}
              {period === 'custom' && (
                <div className="custom-range">
                  <span className="custom-range-label">Del</span>
                  <input
                    type="date" className="custom-input" value={customFrom} max={customTo || today}
                    onChange={(e) => setCustomFrom(e.target.value)}
                  />
                  <span className="custom-range-label">Al</span>
                  <input
                    type="date" className="custom-input" value={customTo} min={customFrom} max={today}
                    onChange={(e) => setCustomTo(e.target.value)}
                  />
                  <button
                    className="apply-btn"
                    disabled={!customFrom || !customTo || refetching}
                    onClick={() => fetchData('custom', customFrom, customTo)}
                  >
                    Aplicar
                  </button>
                </div>
              )}
              {refetching && (
                <span className="refetch-indicator">
                  <span className="refetch-spinner" /> Actualizando…
                </span>
              )}
            </div>

            {/* ── Cluster tabs ── */}
            <div className="tabs">
              {CLUSTERS.map((c) => {
                const s = allStats.find((x) => x.category_code === c.code)
                return (
                  <button key={c.code} className={`tab${cluster === c.code ? ' active' : ''}`} onClick={() => setCluster(c.code)}>
                    {c.icon} {c.label}
                    {s && <span style={{ marginLeft: 6, opacity: 0.65, fontSize: 11 }}>({fmt(Number(s.active_pros))})</span>}
                  </button>
                )
              })}
            </div>

            {/* ── Sub tabs ── */}
            <div className="sub-tabs">
              {[
                { key: 'ranking',    label: '🏆 Ranking LP' },
                { key: 'retos',      label: '🎯 Retos del Mes' },
                { key: 'tienda',     label: '🛒 Tienda LP' },
                { key: 'urgentes',   label: '🚨 Turnos Urgentes' },
                { key: 'beneficios', label: '🎁 Beneficios' },
                { key: 'turnos',     label: '🔑 Turnos Prioritarios' },
              ].map((t) => (
                <button key={t.key} className={`sub-tab${view === t.key ? ' active' : ''}`} onClick={() => setView(t.key as typeof view)}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Cluster stats (always) ── */}
            {clusterStats && (
              <div className="cluster-grid">
                <div className="stat-card">
                  <div className="stat-label">Profesionales Activos</div>
                  <div className="stat-value">{fmt(Number(clusterStats.active_pros))}</div>
                  <div className="stat-hint">turnos aprobados</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Turnos Completados</div>
                  <div className="stat-value">{fmt(Number(clusterStats.total_shifts))}</div>
                  <div className="stat-hint">{periodShort}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Media por Turno</div>
                  <div className="stat-value">{fmtEur(Number(clusterStats.avg_payment_per_shift))}</div>
                  <div className="stat-hint">ingreso medio</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Ingresos Totales</div>
                  <div className="stat-value">{fmtEur(Number(clusterStats.total_earnings))}</div>
                  <div className="stat-hint">pagado al cluster</div>
                </div>
              </div>
            )}

            {/* ── Tier distribution (always) ── */}
            <div className="section-title">Distribución por Tier</div>
            <div className="section-sub">Tiers basados en Livo Points (LP) · {periodShort}. 1 turno base = 10 LP · +2 LP finde · +3 LP noche · ×1.2 si ⚡ Consistente</div>
            <div className="tiers-grid">
              {tierBreakdown.map((tier) => {
                const total = tierBreakdown.reduce((a, t) => a + t.count, 0)
                return (
                  <div key={tier.name} className="tier-card" style={{ '--tc': tier.color } as React.CSSProperties}>
                    <div className="tier-card-name">{tier.icon} {tier.name}</div>
                    <div className="tier-threshold">{tier.desc}</div>
                    <div className="tier-count-big">{fmt(tier.count)}</div>
                    <div className="tier-count-label">profesionales</div>
                    <div className="tier-bar">
                      <div className="tier-bar-fill" style={{ width: `${(tier.count / maxCount) * 100}%` }} />
                    </div>
                    <div className="tier-pct">{total > 0 ? `${Math.round((tier.count / total) * 100)}%` : '—'} del cluster</div>
                  </div>
                )
              })}
            </div>

            {/* ══════════ VIEW: RANKING ══════════ */}
            {view === 'ranking' && (
              <>
                {/* ── Annual Prize ── */}
                {(() => {
                  const allLb = data?.leaderboard ?? []
                  const allConsistentSet = new Set((data?.consistent ?? []).map(p => p.professional_id))

                  // Per cluster: compute bracket leaders and classified lists
                  const clusterBracketData = CLUSTERS.map(c => {
                    const pros = allLb
                      .filter(p => p.category_code === c.code)
                      .map(p => ({ ...p, shifts: Number(p.shifts_completed), effectiveLP: computeLP(p, allConsistentSet.has(p.professional_id)) }))
                      .sort((a, b) => b.shifts - a.shifts)

                    const brackets = ANNUAL_PRIZES.map((prize, i) => {
                      const nextMin = ANNUAL_PRIZES[i + 1]?.minShifts ?? Infinity
                      const inBracket = pros.filter(p => p.shifts >= prize.minShifts && p.shifts < nextMin)
                      return { prize, pros: inBracket, leader: inBracket[0] ?? null }
                    })

                    return { code: c.code, icon: c.icon, label: c.label, brackets }
                  })

                  // Classified list for the currently selected cluster
                  const currentClusterBrackets = clusterBracketData.find(c => c.code === cluster)?.brackets ?? []

                  return (
                    <div className="prize-section">
                      <div className="prize-hero">
                        <div className="prize-hero-tag">🏆 Premio Anual · Clasificación Final</div>
                        <div className="prize-hero-title">Top #1 por Nivel — Recompensa por Actividad</div>
                        <div className="prize-hero-sub">
                          Cada nivel muestra el profesional líder dentro de ese rango de turnos. El profesional #1 de cada categoría al cierre del período anual recibe un presupuesto de recompensa proporcional al revenue generado.
                        </div>
                      </div>

                      {/* Matrix table */}
                      <div className="prize-matrix">
                        {/* Header row — category labels */}
                        <div className="pm-row pm-header">
                          <div className="pm-corner">
                            <span className="pm-corner-label">Nivel · Rango</span>
                          </div>
                          {clusterBracketData.map(cl => (
                            <div key={cl.code} className="pm-cat-cell">
                              <div className="pm-cat-cluster">{cl.icon} {cl.label}</div>
                              <div className="pm-cat-shifts">#1 por nivel · {periodShort}</div>
                            </div>
                          ))}
                        </div>

                        {/* One row per prize level */}
                        {ANNUAL_PRIZES.map((p, i) => {
                          const nextMin = ANNUAL_PRIZES[i + 1]?.minShifts
                          const rangeLabel = nextMin ? `${p.minShifts}–${nextMin - 1} turnos` : `≥ ${p.minShifts} turnos`
                          return (
                            <div key={p.level} className="pm-row">
                              {/* Level info cell */}
                              <div className="pm-level-cell" style={{ '--pc': p.color, '--pc-bg': p.bg } as React.CSSProperties}>
                                <div className="pm-level-name">{p.icon} {p.level}</div>
                                <div className="pm-level-req">{rangeLabel}</div>
                                <div className="pm-level-stats">
                                  <span className="pm-stat-chip">Rev. {fmtEur(p.revenue)}</span>
                                  <span className="pm-stat-chip">Premio {fmtEur(p.budget)}</span>
                                  <span className="pm-stat-chip">{p.pct}%</span>
                                </div>
                              </div>

                              {/* Bracket leader per category */}
                              {clusterBracketData.map(cl => {
                                const bracket = cl.brackets[i]
                                const leader  = bracket.leader
                                const count   = bracket.pros.length
                                const cellStyle = { '--pc': p.color, '--pc-bg': p.bg } as React.CSSProperties
                                const isTopBracket = i === ANNUAL_PRIZES.length - 1
                                return (
                                  <div key={cl.code}
                                    className={`pm-status-cell${leader && isTopBracket ? ' pm-status-winner' : ''}`}
                                    style={cellStyle}>
                                    {leader ? (
                                      <>
                                        {isTopBracket && <div className="pm-winner-badge">{p.icon} Líder</div>}
                                        <div className="pm-bracket-leader">{leader.first_name} {leader.last_name}</div>
                                        <div className="pm-bracket-shifts">{fmt(leader.shifts)} turnos</div>
                                        <div className="pm-bracket-count">{count} clasificado{count !== 1 ? 's' : ''}</div>
                                      </>
                                    ) : (
                                      <div className="pm-bracket-empty">—</div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })}
                      </div>
                      <div className="prize-note">* Revenue y presupuesto calculados como referencia · El nivel final se determina al cierre del período anual</div>

                      {/* ── Clasificados por Nivel ── */}
                      <div className="prize-classified">
                        <div className="prize-classified-title">Clasificados por Nivel · {CLUSTERS.find(c => c.code === cluster)?.icon} {CLUSTERS.find(c => c.code === cluster)?.label}</div>
                        <div className="prize-classified-sub">Todos los profesionales clasificados en cada nivel de premio según sus turnos en el período seleccionado</div>
                        <div className="prize-class-grid">
                          {currentClusterBrackets.map((bracket, i) => {
                            const p = bracket.prize
                            const nextMin = ANNUAL_PRIZES[i + 1]?.minShifts
                            const rangeLabel = nextMin ? `${p.minShifts}–${nextMin - 1} turnos` : `≥ ${p.minShifts} turnos`
                            return (
                              <div key={p.level} className="prize-class-card" style={{ '--pc': p.color, '--pc-bg': p.bg } as React.CSSProperties}>
                                <div className="prize-class-card-header">
                                  <span className="prize-class-card-icon">{p.icon}</span>
                                  <div>
                                    <div className="prize-class-card-level">{p.level}</div>
                                    <div className="prize-class-card-range">{rangeLabel}</div>
                                  </div>
                                  <span className="prize-class-card-count">{bracket.pros.length}</span>
                                </div>
                                {bracket.pros.length === 0 ? (
                                  <div className="prize-class-empty">Sin clasificados</div>
                                ) : (
                                  bracket.pros.slice(0, 20).map((pro, idx) => (
                                    <div key={pro.professional_id} className="prize-class-pro-row">
                                      <span className="prize-class-pos">{idx + 1}</span>
                                      <span className="prize-class-name">{pro.first_name} {pro.last_name}</span>
                                      <span className="prize-class-shifts">{fmt(pro.shifts)}t</span>
                                    </div>
                                  ))
                                )}
                                {bracket.pros.length > 20 && (
                                  <div className="prize-class-empty">+{bracket.pros.length - 20} más</div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })()}

                <div className="section-title">Ranking por Livo Points</div>
                <div className="section-sub">LP incluye multiplicadores por turnos de fin de semana, nocturnos y bono de consistencia · {periodShort}.</div>
                <div className="leaderboard">
                  <div className="lb-header">
                    <span>#</span><span>Profesional</span>
                    <span>Turnos</span><span>Livo Points</span>
                    <span>Ingresos</span><span>Premio</span><span>Tier</span>
                  </div>
                  {prosWithLP.slice(0, 100).map((pro, i) => {
                    const tier = getTier(cluster, pro.effectiveLP)
                    const next = getNextTier(cluster, pro.effectiveLP)
                    const pct  = tierProgress(cluster, pro.effectiveLP)
                    const ms   = getMilestones(Number(pro.shifts_completed))
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
                    return (
                      <div key={pro.professional_id} className="lb-row">
                        <span className="rank">{medal ?? `${i + 1}`}</span>
                        <span className="pro-name">
                          {pro.first_name} {pro.last_name}
                          {consistentIds.has(pro.professional_id) && (
                            <span className="consistent-badge">⚡ Consistente</span>
                          )}
                          <span>
                            {ms.filter(m => m.unlocked).map((m) => (
                              <span key={m.id} className="milestone-badge" title={`${m.name}: ${m.reward}`}>{m.icon}</span>
                            ))}
                          </span>
                        </span>
                        <span className="shifts-val">{fmt(Number(pro.shifts_completed))}</span>
                        <span>
                          <div className="lp-progress-wrap">
                            <span className="lp-val">{fmt(pro.effectiveLP)} LP</span>
                            {next && (
                              <>
                                <div className="lp-progress-bar">
                                  <div className="lp-progress-fill" style={{ width: `${pct}%`, '--tc2': tier.color } as React.CSSProperties} />
                                </div>
                                <span className="lp-progress-label">{pct}% → {next.name}</span>
                              </>
                            )}
                          </div>
                        </span>
                        <span className="earnings-val">{fmtEur(Number(pro.total_earned))}</span>
                        <span>
                          {(() => {
                            const prize = getAnnualPrize(Number(pro.shifts_completed))
                            return prize ? (
                              <span className="tier-pill" style={{ '--tc': prize.color, '--tb': prize.bg } as React.CSSProperties}>
                                {prize.icon} {prize.level}
                              </span>
                            ) : <span style={{ color: '#c8d8de', fontSize: 13 }}>—</span>
                          })()}
                        </span>
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

            {/* ══════════ VIEW: RETOS ══════════ */}
            {view === 'retos' && (
              <>
                {/* LP rules card */}
                <div className="rule-card">
                  <div>
                    <div className="rule-col-title">Cómo se ganan Livo Points</div>
                    {[
                      { icon: '✅', text: <><strong>Turno completado</strong> → <span>10 LP base</span></> },
                      { icon: '📅', text: <><strong>Turno en fin de semana</strong> → <span className="rule-multiplier">+2 LP</span></> },
                      { icon: '🌙', text: <><strong>Turno nocturno</strong> (22h–6h) → <span className="rule-multiplier">+3 LP</span></> },
                      { icon: '⚡', text: <><strong>Bono consistencia</strong> (2/semana) → <span className="rule-multiplier">×1.2 total</span></> },
                    ].map((r, i) => (
                      <div key={i} className="rule-row">
                        <span className="rule-icon">{r.icon}</span>
                        <span className="rule-text">{r.text}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="rule-col-title">Hitos y protección de tier</div>
                    {[
                      { icon: '🎯', text: <><strong>1er turno</strong> → badge de bienvenida + 10 LP extra</> },
                      { icon: '🔥', text: <><strong>10 turnos</strong> → badge Decena + 20 LP bonus</> },
                      { icon: '💪', text: <><strong>25 turnos</strong> → badge Constante + +1% tarifa permanente</> },
                      { icon: '🏅', text: <><strong>Tier no baja</strong> hasta revisión trimestral — nunca retroactivo</> },
                    ].map((r, i) => (
                      <div key={i} className="rule-row">
                        <span className="rule-icon">{r.icon}</span>
                        <span className="rule-text">{r.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly challenges */}
                <div className="section-title">🎯 Retos de {monthName.charAt(0).toUpperCase() + monthName.slice(1)}</div>
                <div className="section-sub">Quedan <strong>{days} días</strong>. Completa los retos para ganar LP extra y badges exclusivos.</div>
                <div className="retos-grid">
                  {(CHALLENGES[cluster] ?? []).map((ch) => {
                    const pct = Math.min(100, Math.round((ch.current / ch.target) * 100))
                    return (
                      <div key={ch.title} className="reto-card" style={{ '--rc': ch.color, '--rc-bg': ch.colorBg } as React.CSSProperties}>
                        <div className="reto-header">
                          <span className="reto-icon">{ch.icon}</span>
                          <span className="reto-reward">{ch.reward}</span>
                        </div>
                        <div className="reto-title">{ch.title}</div>
                        <div className="reto-desc">{ch.desc}</div>
                        <div className="reto-progress-row">
                          <span className="reto-progress-label">Progreso</span>
                          <span className="reto-progress-val">{ch.current} / {ch.target}</span>
                        </div>
                        <div className="reto-bar">
                          <div className="reto-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="reto-deadline">⏳ {days} días restantes · {pct === 100 ? '✅ Completado' : `${pct}% completado`}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Challenge rankings */}
                <div className="section-title">Ranking por Reto</div>
                <div className="section-sub">Top 10 profesionales del cluster en cada reto este mes.</div>
                <div className="reto-rankings-grid">
                  {(CHALLENGE_RANK_DEFS[cluster] ?? []).map((def) => {
                    const sorted = [...monthlyCluster]
                      .filter((p) => Number((p as Record<string,unknown>)[def.field]) > 0)
                      .sort((a, b) => Number((b as Record<string,unknown>)[def.field]) - Number((a as Record<string,unknown>)[def.field]))
                      .slice(0, 10)
                    const max = sorted[0] ? Number((sorted[0] as Record<string,unknown>)[def.field]) : 1
                    return (
                      <div key={def.field} className="reto-rank-card" style={{ '--rc': def.color } as React.CSSProperties}>
                        <div className="reto-rank-header">
                          <span style={{ fontSize: 20 }}>{def.icon}</span>
                          <div>
                            <div className="reto-rank-title">{def.title}</div>
                            <div className="reto-rank-metric">{def.metricLabel}</div>
                          </div>
                        </div>
                        {sorted.length === 0 ? (
                          <div className="reto-rank-empty">Sin datos este mes</div>
                        ) : sorted.map((p, i) => {
                          const val = Number((p as Record<string,unknown>)[def.field])
                          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
                          return (
                            <div key={p.professional_id}>
                              <div className="reto-rank-row">
                                <span className="reto-rank-pos">{medal ?? `${i + 1}`}</span>
                                <span className="reto-rank-name">{p.first_name} {p.last_name}</span>
                                <span className="reto-rank-val">{val} {def.unit}</span>
                              </div>
                              <div className="reto-rank-bar-wrap">
                                <div className="reto-rank-bar">
                                  <div className="reto-rank-bar-fill" style={{ width: `${(val / max) * 100}%` }} />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>

                {/* Milestones */}
                <div className="milestones-section">
                  <div className="section-title">🏅 Hitos del Programa</div>
                  <div className="section-sub">Desbloquea badges permanentes según tus turnos totales acumulados.</div>
                  <div className="milestones-grid">
                    {MILESTONES.map((m) => {
                      const topPro = prosWithLP[0]
                      const topShifts = topPro ? Number(topPro.shifts_completed) : 0
                      const unlocked = topShifts >= m.shifts
                      const isNext = !unlocked && MILESTONES.filter((x) => topShifts < x.shifts)[0]?.id === m.id
                      return (
                        <div key={m.id} className={`milestone-card${unlocked ? ' unlocked' : isNext ? ' next' : ''}`}>
                          <div className="milestone-card-icon">{m.icon}</div>
                          <div className="milestone-card-name">{m.name}</div>
                          <div className="milestone-card-req">{m.shifts} turnos</div>
                          <div className="milestone-card-reward">{m.reward}</div>
                          {isNext && <div className="milestone-card-next-label">⬆ Próximo hito</div>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ══════════ VIEW: TIENDA LP ══════════ */}
            {view === 'tienda' && (() => {
              const topLP = prosWithLP[0]?.effectiveLP ?? 0
              const filtered = marketCat === 'all'
                ? MARKET_ITEMS
                : MARKET_ITEMS.filter(i => i.category === marketCat)
              const featured = MARKET_ITEMS.filter(i => i.featured)

              return (
                <>
                  {/* Banner */}
                  <div className="market-banner">
                    <div>
                      <div className="market-banner-tag">🛒 Canjea tus Livo Points</div>
                      <div className="market-banner-title">Tienda de Recompensas</div>
                      <div className="market-banner-sub">
                        Convierte tus LP en formación, viajes, experiencias y equipamiento clínico.
                        Top del cluster actual: <strong style={{color:'#a5b4fc'}}>{fmt(topLP)} LP</strong>.
                        Cada turno que cubres suma puntos para canjear aquí.
                      </div>
                    </div>
                    <div className="market-rate-grid">
                      {[
                        { lp: '100 LP',  val: 'App wellness 1 año' },
                        { lp: '350 LP',  val: '1 mes de gimnasio' },
                        { lp: '700 LP',  val: 'Estetoscopio Littmann' },
                        { lp: '1.200 LP',val: 'Vuelo europeo hasta €150' },
                        { lp: '2.000 LP',val: 'Smartwatch de salud' },
                      ].map(r => (
                        <div key={r.lp} className="market-rate-row">
                          <span className="market-rate-lp">{r.lp}</span>
                          <span className="market-rate-sep">→</span>
                          <span className="market-rate-val">{r.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category filter */}
                  <div className="market-cats">
                    {MARKET_CATS.map(cat => {
                      const count = cat.key === 'all' ? MARKET_ITEMS.length : MARKET_ITEMS.filter(i => i.category === cat.key).length
                      return (
                        <button
                          key={cat.key}
                          className={`market-cat-btn${marketCat === cat.key ? ' active' : ''}`}
                          style={marketCat === cat.key ? { background: cat.color } as React.CSSProperties : {}}
                          onClick={() => setMarketCat(cat.key)}
                        >
                          {cat.icon} {cat.label}
                          <span className="market-cat-count">({count})</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Featured — only when showing all */}
                  {marketCat === 'all' && (
                    <div className="market-featured-section">
                      <div className="market-featured-label">⭐ Destacados</div>
                      <div className="market-featured-grid">
                        {featured.map(item => {
                          const cat = MARKET_CATS.find(c => c.key === item.category)!
                          const shiftsNeeded = Math.ceil(item.lpCost / 10)
                          return (
                            <div key={item.id} className="market-card featured"
                              style={{ '--mc': cat.color, '--mc-bg': cat.color + '18' } as React.CSSProperties}>
                              <div className="market-card-top">
                                <span className="market-card-icon">{item.icon}</span>
                                <span className="market-card-tag">{cat.icon} {cat.label}</span>
                              </div>
                              <div className="market-card-name">{item.name}</div>
                              <div className="market-card-desc">{item.desc}</div>
                              <div className="market-card-partner">🤝 {item.partner}</div>
                              <div className="market-card-footer">
                                <div className="market-card-lp-row">
                                  <span className="market-card-lp">{fmt(item.lpCost)}</span>
                                  <span className="market-card-lp-label">LP</span>
                                </div>
                                <div className="market-card-shifts">≈ {shiftsNeeded} turnos base</div>
                                <button className="market-cta" style={{ background: cat.color } as React.CSSProperties}
                                  onClick={() => handleRedeem(item.name)}>
                                  Canjear →
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Full catalog */}
                  <div className="section-title">{marketCat === 'all' ? 'Catálogo completo' : MARKET_CATS.find(c => c.key === marketCat)?.label}</div>
                  <div className="section-sub">{filtered.length} productos disponibles · ordenados por coste LP ascendente</div>
                  <div className="market-grid">
                    {[...filtered].sort((a,b) => a.lpCost - b.lpCost).map(item => {
                      const cat = MARKET_CATS.find(c => c.key === item.category)!
                      const shiftsNeeded = Math.ceil(item.lpCost / 10)
                      const canAfford = topLP >= item.lpCost
                      return (
                        <div key={item.id} className="market-card"
                          style={{ '--mc': cat.color, '--mc-bg': cat.color + '18' } as React.CSSProperties}>
                          <div className="market-card-top">
                            <span className="market-card-icon">{item.icon}</span>
                            {item.tag
                              ? <span className="market-card-tag">{item.tag}</span>
                              : <span className="market-card-tag">{cat.icon} {cat.label}</span>}
                          </div>
                          <div className="market-card-name">{item.name}</div>
                          <div className="market-card-desc">{item.desc}</div>
                          <div className="market-card-partner">🤝 {item.partner}</div>
                          <div className="market-card-footer">
                            <div className="market-card-lp-row">
                              <span className="market-card-lp">{fmt(item.lpCost)}</span>
                              <span className="market-card-lp-label">LP</span>
                            </div>
                            <div className="market-card-shifts">
                              ≈ {shiftsNeeded} turnos base
                              {canAfford && <span style={{color:'#2a8a5e', marginLeft:6, fontWeight:600}}>✓ Al alcance del top</span>}
                            </div>
                            <button className="market-cta" style={{ background: cat.color } as React.CSSProperties}
                              onClick={() => handleRedeem(item.name)}>
                              Canjear →
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )
            })()}

            {/* ══════════ VIEW: URGENTES ══════════ */}
            {view === 'urgentes' && (
              <>
                {/* Banner */}
                <div className="urgent-banner">
                  <div className="urgent-banner-tag">⚡ Datos reales · últimos 12 meses</div>
                  <div className="urgent-banner-title">Ranking de Turnos Urgentes</div>
                  <div className="urgent-banner-sub">
                    Profesionales que cubren turnos marcados como urgentes en la plataforma · {periodShort}.
                    Estos turnos suelen llevar bono Livo y son críticos para las instalaciones.
                  </div>
                  {urgentStat ? (
                    <div className="urgent-stats-row">
                      <div className="ustat">
                        <div className="ustat-val">{fmt(Number(urgentStat.total_urgent))}</div>
                        <div className="ustat-label">turnos urgentes</div>
                      </div>
                      <div className="ustat">
                        <div className="ustat-val">{fmt(Number(urgentStat.pros_covering))}</div>
                        <div className="ustat-label">pros respondiendo</div>
                      </div>
                      <div className="ustat">
                        <div className="ustat-val">{fmtEur(Number(urgentStat.avg_pay))}</div>
                        <div className="ustat-label">pago medio / turno</div>
                      </div>
                      <div className="ustat">
                        <div className="ustat-val">
                          {urgentStat.total_urgent > 0
                            ? `${Math.round((Number(urgentStat.shifts_with_bonus) / Number(urgentStat.total_urgent)) * 100)}%`
                            : '—'}
                        </div>
                        <div className="ustat-label">con bono Livo</div>
                      </div>
                      <div className="ustat">
                        <div className="ustat-val">{fmtEur(Number(urgentStat.total_earnings))}</div>
                        <div className="ustat-label">ingresos totales</div>
                      </div>
                    </div>
                  ) : (
                    <div className="ustat"><div className="ustat-val">—</div><div className="ustat-label">sin datos este período</div></div>
                  )}
                </div>

                {urgentCluster.length === 0 ? (
                  <div className="urgent-empty">
                    <div className="urgent-empty-icon">🏥</div>
                    <div className="urgent-empty-title">Sin turnos urgentes registrados</div>
                    <div className="urgent-empty-sub">Este cluster no tiene turnos marcados como urgentes en los últimos 12 meses.</div>
                  </div>
                ) : (
                  <>
                    {/* Hero — top responder */}
                    {urgentCluster[0] && (() => {
                      const hero = urgentCluster[0]
                      const bonusPct = hero.urgent_shifts > 0
                        ? Math.round((Number(hero.shifts_with_bonus) / Number(hero.urgent_shifts)) * 100)
                        : 0
                      const tier = getTier(cluster, Number(hero.urgent_shifts) * 10)
                      return (
                        <div className="urgent-hero">
                          <div className="urgent-hero-crown">🥇</div>
                          <div style={{ flex: 1 }}>
                            <div className="urgent-hero-label">First Responder del cluster</div>
                            <div className="urgent-hero-name">{hero.first_name} {hero.last_name}</div>
                            <div className="urgent-hero-stats">
                              <span className="urgent-hero-stat"><strong>{fmt(Number(hero.urgent_shifts))}</strong> turnos urgentes</span>
                              <span className="urgent-hero-stat"><strong>{fmtEur(Number(hero.urgent_earnings))}</strong> ganados</span>
                              <span className="urgent-hero-stat"><strong>{fmtEur(Number(hero.avg_per_urgent))}</strong> / turno</span>
                              <span className="tier-pill" style={{ '--tc': tier.color, '--tb': tier.bg } as React.CSSProperties}>{tier.icon} {tier.name}</span>
                            </div>
                          </div>
                          <div className="urgent-hero-bonus">🎁 {bonusPct}% con bono Livo</div>
                        </div>
                      )
                    })()}

                    {/* Leaderboard */}
                    <div className="section-title">Ranking completo — Turnos Urgentes</div>
                    <div className="section-sub">Ordenado por número de turnos urgentes cubiertos · {periodShort}.</div>
                    <div className="urgent-lb">
                      <div className="urgent-lb-header">
                        <span>#</span>
                        <span>Profesional</span>
                        <span>Urgentes</span>
                        <span>Ingresos</span>
                        <span>Avg / turno</span>
                        <span>% Bono</span>
                        <span>Tier</span>
                      </div>
                      {urgentCluster.map((pro, i) => {
                        const bonusPct = pro.urgent_shifts > 0
                          ? Math.round((Number(pro.shifts_with_bonus) / Number(pro.urgent_shifts)) * 100)
                          : 0
                        const tier = getTier(cluster, Number(pro.urgent_shifts) * 10)
                        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
                        return (
                          <div key={pro.professional_id} className="urgent-lb-row">
                            <span className="rank">{medal ?? `${i + 1}`}</span>
                            <span className="pro-name">
                              {pro.first_name} {pro.last_name}
                              {consistentIds.has(pro.professional_id) && (
                                <span className="consistent-badge">⚡ Consistente</span>
                              )}
                            </span>
                            <span className="urgent-val">{fmt(Number(pro.urgent_shifts))}</span>
                            <span className="earnings-val">{fmtEur(Number(pro.urgent_earnings))}</span>
                            <span className="shifts-val">{fmtEur(Number(pro.avg_per_urgent))}</span>
                            <span>
                              <span className="bonus-rate-pill">🎁 {bonusPct}%</span>
                            </span>
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
              </>
            )}

            {/* ══════════ VIEW: BENEFICIOS ══════════ */}
            {view === 'beneficios' && (
              <>
                {/* Consistency bonus */}
                <div className="consistency-banner">
                  <div className="consistency-banner-tag">⚡ Bono Exclusivo · Acumulable a cualquier tier</div>
                  <div className="consistency-banner-title">Bono Consistencia — 2 turnos por semana</div>
                  <div className="consistency-banner-sub">Media de 2+ turnos semanales en los últimos 12 meses. LP ×1.2 + beneficios extra.</div>
                  <div className="consistency-stats">
                    <div className="cstat">
                      <div className="cstat-val">{fmt(clusterConsistent.length)}</div>
                      <div className="cstat-label">pros con bono activo</div>
                    </div>
                    <div className="cstat">
                      <div className="cstat-val">
                        {clusterConsistent.length > 0
                          ? `${(clusterConsistent.reduce((a, p) => a + Number(p.avg_weekly_shifts), 0) / clusterConsistent.length).toFixed(1)}`
                          : '—'}
                      </div>
                      <div className="cstat-label">media turnos/semana</div>
                    </div>
                  </div>
                  <div className="consistency-perks-grid">
                    {[
                      { icon: '💰', title: '+3% extra tarifa', detail: 'Stackable con bonus de tier. Referente + ⚡ = +11% total.' },
                      { icon: '🔄', title: 'Swap sin penalización', detail: 'Cambia 2 turnos/mes sin perder slot ni valoración.' },
                      { icon: '🎯', title: 'Account Manager propio', detail: 'Acceso directo a un AM de Livo para gestión prioritaria.' },
                      { icon: '🏆', title: 'Reconocimiento mensual', detail: 'Mención en ranking ⚡ + regalo sorpresa mensual de Livo.' },
                    ].map((p) => (
                      <div key={p.title} className="cperk">
                        <div className="cperk-icon">{p.icon}</div>
                        <div className="cperk-title">{p.title}</div>
                        <div className="cperk-detail">{p.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consistent pros leaderboard */}
                {clusterConsistent.length > 0 && (
                  <>
                    <div className="section-title">Profesionales con ⚡ Bono Activo</div>
                    <div className="consistency-leaderboard" style={{ marginBottom: 28 }}>
                      <div className="lb-header">
                        <span>#</span><span>Profesional</span>
                        <span>Turnos (12m)</span><span>Media semanal</span><span>LP efectivos</span><span>Tier</span>
                      </div>
                      {clusterConsistent.slice(0, 15).map((pro, i) => {
                        const baseLP = Number(pro.total_shifts) * 10
                        const effectiveLP = Math.round(baseLP * 1.2)
                        const tier = getTier(cluster, effectiveLP)
                        return (
                          <div key={pro.professional_id} className="lb-row">
                            <span className="rank">{i + 1}</span>
                            <span className="pro-name">
                              {pro.first_name} {pro.last_name}
                              <span className="consistent-badge">⚡ Consistente</span>
                            </span>
                            <span className="shifts-val">{fmt(Number(pro.total_shifts))}</span>
                            <span className="lp-val">{Number(pro.avg_weekly_shifts).toFixed(1)}/sem</span>
                            <span className="lp-val">{fmt(effectiveLP)} LP</span>
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

                {/* Perks matrix */}
                <div className="section-title">Beneficios & Partners por Tier</div>
                <div className="section-sub">Cuanto mayor tu tier, mayores descuentos y acceso exclusivo. Diferenciado por cluster.</div>
                <div className="cat-note" dangerouslySetInnerHTML={{ __html: CAT_NOTES[cluster] }} />
                <div className="perks-matrix">
                  {tierDefs.map((tier) => {
                    const LP_LABELS: Record<string, Record<string, string>> = {
                      ENF:  { Emergente: '10–199 LP', Activo: '200–499 LP', Referente: '500–999 LP', Elite: '1000+ LP' },
                      TCAE: { Emergente: '10–99 LP',  Activo: '100–249 LP', Referente: '250–499 LP', Elite: '500+ LP' },
                      DOC:  { Emergente: '10–19 LP',  Activo: '20–59 LP',   Referente: '60–109 LP',  Elite: '110+ LP' },
                    }
                    return (
                      <div key={tier.name} className="perk-tier-card" style={{ '--tc': tier.color } as React.CSSProperties}>
                        <div className="perk-tier-header">
                          <span style={{ fontSize: 20 }}>{tier.icon}</span>
                          <div>
                            <div className="perk-tier-name">{tier.name}</div>
                            <div className="perk-tier-lp">{LP_LABELS[cluster]?.[tier.name]}</div>
                          </div>
                        </div>
                        {PERK_CATEGORIES.map((cat) => {
                          const perk = cat.tiers[tier.name as keyof typeof cat.tiers]
                          const partners = (cat.partners as Record<string, string[]>)[cluster] ?? []
                          return (
                            <div key={cat.key} className="perk-category">
                              <div className="perk-cat-label">{cat.icon} {cat.label}</div>
                              <div className="perk-value">{perk?.value}</div>
                              <div className="perk-detail">{perk?.detail}</div>
                              {tier.name !== 'Emergente' && (
                                <div className="perk-partners">
                                  {partners.map((p) => <span key={p} className="perk-partner-chip">{p}</span>)}
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

            {/* ══════════ VIEW: TURNOS ══════════ */}
            {view === 'turnos' && (
              <>
                <div className="section-title">Acceso Prioritario a Turnos por Tier</div>
                <div className="section-sub">Mayor tier = antes, mejores centros, mejor tarifa.</div>
                <div className="cat-shift-note" dangerouslySetInnerHTML={{ __html: SHIFT_CAT_NOTES[cluster] }} />
                <div className="shifts-grid">
                  {tierDefs.map((tier) => {
                    const ps = PRIORITY_SHIFTS[tier.name]
                    const facilities = ps?.facilities[cluster] ?? []
                    return (
                      <div key={tier.name} className="shift-tier-card" style={{ '--tc': tier.color } as React.CSSProperties}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 18 }}>{tier.icon}</span>
                          <div>
                            <div className="shift-tier-name">{tier.name}</div>
                            <div className="shift-tier-sub">{ps?.sub}</div>
                          </div>
                        </div>
                        <div className="shift-row">
                          <span className="shift-icon">⏰</span>
                          <div>
                            <div className="shift-row-label">Acceso</div>
                            <div className="shift-row-val">{ps?.access}</div>
                          </div>
                        </div>
                        <div className="shift-row">
                          <span className="shift-icon">💰</span>
                          <div>
                            <div className="shift-row-label">Bonificación</div>
                            {ps?.rateBonus
                              ? <span className="shift-bonus-pill">{ps.rateBonus} sobre tarifa base</span>
                              : <div className="shift-row-val" style={{ color: '#9db5bc' }}>Sin bonificación</div>}
                          </div>
                        </div>
                        {ps?.guaranteed && (
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
                                <span key={f} className={`facility-tag${fi === facilities.length - 1 && tier.name === 'Referente' ? ' premium' : fi === facilities.length - 1 && tier.name === 'Elite' ? ' exclusive' : ''}`}>{f}</span>
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

      {toastItem && (
        <div className="market-coming-toast">
          🎉 <strong>{toastItem}</strong> — Canje disponible en Q3 2026. ¡Sigue acumulando LP!
        </div>
      )}
    </div>
  )
}
