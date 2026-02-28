import { useState, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0f1117;
    --surface: #181c26;
    --surface2: #1e2333;
    --surface3: #252c3e;
    --border: #252c3e;
    --border2: #2e3650;
    --orange: #f97316;
    --orange-dim: #c2550f;
    --orange-glow: rgba(249,115,22,0.13);
    --amber: #fbbf24;
    --text: #eef0f7;
    --text-dim: #8a93b0;
    --text-muted: #4e5770;
    --green: #22c55e;
    --green-bg: rgba(34,197,94,0.1);
    --blue: #3b82f6;
    --blue-bg: rgba(59,130,246,0.1);
    --purple: #a855f7;
    --purple-bg: rgba(168,85,247,0.1);
    --red: #ef4444;
    --red-bg: rgba(239,68,68,0.1);
    --yellow: #eab308;
    --yellow-bg: rgba(234,179,8,0.1);
    --font-head: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); }

  .shell { display: flex; height: 100vh; overflow: hidden; }

  /* SIDEBAR */
  .sidebar { width: 216px; flex-shrink: 0; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; }
  .sidebar-logo { padding: 18px 16px 0; display: flex; align-items: center; gap: 10px; }
  .logo-mark { width: 30px; height: 30px; background: var(--orange); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
  .logo-text { font-family: var(--font-head); font-weight: 800; font-size: 14px; color: var(--text); line-height: 1.1; }
  .logo-text span { display: block; font-weight: 400; font-size: 9.5px; color: var(--text-dim); letter-spacing: 0.5px; text-transform: uppercase; font-family: var(--font-body); }
  .sidebar-nav { padding: 20px 8px; flex: 1; display: flex; flex-direction: column; gap: 1px; overflow: auto; }
  .nav-label { font-size: 9px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--text-muted); padding: 8px 8px 3px; margin-top: 6px; }
  .nav-item { display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 7px; cursor: pointer; color: var(--text-dim); font-size: 13px; font-weight: 400; transition: all 0.12s; position: relative; }
  .nav-item:hover { background: var(--surface2); color: var(--text); }
  .nav-item.active { background: var(--orange-glow); color: var(--orange); font-weight: 500; }
  .nav-item.active::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 3px; height: 16px; background: var(--orange); border-radius: 0 3px 3px 0; }
  .nav-icon { font-size: 14px; width: 18px; text-align: center; opacity: 0.8; }
  .nav-badge { margin-left: auto; background: var(--orange); color: white; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 20px; }
  .sidebar-footer { padding: 12px 8px; border-top: 1px solid var(--border); }
  .user-pill { display: flex; align-items: center; gap: 8px; padding: 7px 8px; border-radius: 7px; cursor: pointer; }
  .user-pill:hover { background: var(--surface2); }
  .avatar { border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; flex-shrink: 0; }

  /* MAIN */
  .main { flex: 1; overflow: auto; display: flex; flex-direction: column; min-width: 0; }
  .topbar { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0 24px; height: 52px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; position: sticky; top: 0; z-index: 20; }
  .page-title { font-family: var(--font-head); font-weight: 700; font-size: 16px; }
  .topbar-right { display: flex; align-items: center; gap: 8px; }
  .content { padding: 20px 24px; flex: 1; }

  /* BUTTONS */
  .btn { display: inline-flex; align-items: center; gap: 5px; padding: 7px 13px; border-radius: 7px; font-size: 12.5px; font-weight: 500; cursor: pointer; border: none; transition: all 0.13s; font-family: var(--font-body); }
  .btn-primary { background: var(--orange); color: white; }
  .btn-primary:hover { background: #ea6a0a; }
  .btn-ghost { background: transparent; color: var(--text-dim); border: 1px solid var(--border2); }
  .btn-ghost:hover { background: var(--surface2); color: var(--text); }
  .btn-ghost.active { border-color: var(--orange); color: var(--orange); background: var(--orange-glow); }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; }

  /* PANELS */
  .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 11px; overflow: hidden; }
  .panel-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid var(--border); }
  .panel-title { font-family: var(--font-head); font-weight: 600; font-size: 13.5px; }
  .panel-action { font-size: 12px; color: var(--orange); cursor: pointer; font-weight: 500; }

  /* KPI CARDS */
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
  .kpi-card { background: var(--surface); border: 1px solid var(--border); border-radius: 11px; padding: 16px 18px; position: relative; overflow: hidden; }
  .kpi-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--accent, var(--orange)); }
  .kpi-label { font-size: 10.5px; font-weight: 500; letter-spacing: 0.4px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
  .kpi-value { font-family: var(--font-head); font-size: 26px; font-weight: 700; color: var(--text); line-height: 1; margin-bottom: 7px; }
  .kpi-delta { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 500; padding: 2px 6px; border-radius: 20px; }
  .kpi-delta.up { background: var(--green-bg); color: var(--green); }
  .kpi-delta.down { background: var(--red-bg); color: var(--red); }

  /* TABLES */
  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th { text-align: left; padding: 9px 18px; font-size: 10px; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--border); white-space: nowrap; }
  .data-table td { padding: 12px 18px; font-size: 12.5px; border-bottom: 1px solid var(--border); color: var(--text-dim); vertical-align: middle; }
  .data-table tbody tr { cursor: pointer; transition: background 0.1s; }
  .data-table tbody tr:hover { background: var(--surface2); }
  .data-table tr:last-child td { border-bottom: none; }
  .cell-primary { font-weight: 500; color: var(--text); }
  .cell-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

  /* STAGE BADGE */
  .stage-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 20px; font-size: 11px; font-weight: 500; white-space: nowrap; }
  .stage-dot { width: 5px; height: 5px; border-radius: 50%; }

  /* PROB BAR */
  .prob-wrap { display: flex; align-items: center; gap: 7px; }
  .prob-bar { flex: 1; height: 3px; background: var(--border2); border-radius: 2px; overflow: hidden; max-width: 52px; }
  .prob-fill { height: 100%; border-radius: 2px; }
  .prob-text { font-size: 11.5px; color: var(--text-dim); min-width: 26px; }

  /* TAGS */
  .tag { display: inline-flex; align-items: center; padding: 2px 7px; border-radius: 4px; font-size: 10.5px; font-weight: 500; white-space: nowrap; }

  /* FILTERS */
  .filter-bar { display: flex; gap: 6px; padding: 12px 18px; border-bottom: 1px solid var(--border); align-items: center; flex-wrap: wrap; }
  .filter-pill { padding: 4px 11px; border-radius: 20px; font-size: 11.5px; font-weight: 500; cursor: pointer; border: 1px solid var(--border2); color: var(--text-dim); background: transparent; font-family: var(--font-body); transition: all 0.12s; }
  .filter-pill:hover { border-color: var(--orange); color: var(--orange); }
  .filter-pill.active { background: var(--orange-glow); border-color: var(--orange); color: var(--orange); }

  /* SEARCH */
  .search-wrap { position: relative; }
  .search-input { background: var(--surface2); border: 1px solid var(--border2); border-radius: 7px; padding: 7px 10px 7px 30px; font-size: 12.5px; color: var(--text); font-family: var(--font-body); outline: none; }
  .search-input:focus { border-color: var(--orange); }
  .search-icon { position: absolute; left: 9px; top: 50%; transform: translateY(-50%); font-size: 12px; color: var(--text-muted); pointer-events: none; }

  /* ACTIVITY */
  .act-icon { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
  .timeline-item { display: flex; gap: 12px; position: relative; padding-bottom: 18px; }
  .timeline-item::before { content: ''; position: absolute; left: 14px; top: 28px; bottom: 0; width: 1px; background: var(--border); }
  .timeline-item:last-child::before { display: none; }
  .timeline-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; z-index: 1; }
  .timeline-body { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 9px; padding: 10px 14px; }
  .timeline-title { font-size: 12.5px; font-weight: 500; color: var(--text); margin-bottom: 3px; }
  .timeline-content { font-size: 12px; color: var(--text-dim); line-height: 1.5; }
  .timeline-meta { display: flex; align-items: center; gap: 8px; margin-top: 7px; font-size: 10.5px; color: var(--text-muted); flex-wrap: wrap; }

  /* KANBAN */
  .kanban-wrap { display: flex; gap: 12px; overflow-x: auto; padding: 20px 24px; min-height: calc(100vh - 52px); align-items: flex-start; }
  .kanban-col { width: 272px; flex-shrink: 0; display: flex; flex-direction: column; gap: 0; }
  .kanban-col-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 0 8px; }
  .kanban-col-title { font-family: var(--font-head); font-size: 12px; font-weight: 700; letter-spacing: 0.3px; }
  .kanban-col-meta { font-size: 11px; color: var(--text-muted); }
  .kanban-col-body { display: flex; flex-direction: column; gap: 8px; min-height: 80px; padding: 6px 0; }
  .opp-card { background: var(--surface); border: 1px solid var(--border); border-radius: 9px; padding: 12px 14px; cursor: grab; transition: all 0.12s; position: relative; }
  .opp-card:hover { border-color: var(--border2); box-shadow: 0 4px 16px rgba(0,0,0,0.3); transform: translateY(-1px); }
  .opp-card.dragging { opacity: 0.4; }
  .opp-card.drag-over { border-color: var(--orange); background: var(--orange-glow); }
  .opp-card-name { font-size: 12.5px; font-weight: 500; color: var(--text); margin-bottom: 4px; line-height: 1.35; }
  .opp-card-company { font-size: 11px; color: var(--text-dim); margin-bottom: 10px; }
  .opp-card-footer { display: flex; align-items: center; justify-content: space-between; }
  .opp-card-value { font-family: var(--font-head); font-size: 13px; font-weight: 700; color: var(--text); }
  .opp-card-owner { width: 22px; height: 22px; border-radius: 50%; font-size: 9px; font-weight: 700; color: white; display: flex; align-items: center; justify-content: center; }
  .opp-card-prob { font-size: 10.5px; color: var(--text-muted); }
  .kanban-add-col { width: 220px; flex-shrink: 0; }
  .kanban-add-btn { width: 100%; padding: 10px; border: 1.5px dashed var(--border2); border-radius: 9px; background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer; font-family: var(--font-body); transition: all 0.12s; }
  .kanban-add-btn:hover { border-color: var(--orange); color: var(--orange); }
  .drop-zone { border: 1.5px dashed var(--border2); border-radius: 9px; min-height: 60px; transition: all 0.12s; }
  .drop-zone.over { border-color: var(--orange); background: var(--orange-glow); }

  /* CONTACTS */
  .contact-layout { display: grid; grid-template-columns: 300px 1fr; height: calc(100vh - 52px); }
  .contact-list-pane { border-right: 1px solid var(--border); overflow: auto; }
  .contact-row { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.1s; }
  .contact-row:hover { background: var(--surface2); }
  .contact-row.selected { background: var(--orange-glow); }
  .contact-detail-pane { overflow: auto; background: var(--bg); }
  .detail-header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 20px 24px; display: flex; align-items: flex-start; gap: 16px; }
  .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 16px 24px; }
  .detail-panel { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; }
  .detail-panel-title { font-family: var(--font-head); font-size: 10.5px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px; }
  .field-row { display: flex; justify-content: space-between; align-items: baseline; padding: 5px 0; border-bottom: 1px solid var(--border); }
  .field-row:last-child { border-bottom: none; }
  .field-key { font-size: 11.5px; color: var(--text-muted); }
  .field-val { font-size: 12.5px; color: var(--text); }
  .log-bar { display: flex; gap: 7px; padding: 12px 24px; background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); align-items: center; }
  .act-type-btn { padding: 4px 9px; border-radius: 5px; font-size: 11.5px; cursor: pointer; border: 1px solid var(--border2); background: transparent; color: var(--text-dim); font-family: var(--font-body); transition: all 0.12s; }
  .act-type-btn:hover, .act-type-btn.active { border-color: var(--orange); color: var(--orange); background: var(--orange-glow); }
  .act-input { flex: 1; background: var(--surface2); border: 1px solid var(--border2); border-radius: 6px; padding: 7px 10px; font-size: 12.5px; color: var(--text); font-family: var(--font-body); outline: none; min-width: 0; }
  .act-input:focus { border-color: var(--orange); }

  /* ACCOUNTS */
  .account-layout { display: grid; grid-template-columns: 1fr 360px; gap: 12px; }

  /* REPORTS */
  .report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .chart-area { padding: 16px 18px; }
  .bar-chart { display: flex; gap: 8px; align-items: flex-end; height: 120px; }
  .bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
  .bar { width: 100%; border-radius: 4px 4px 0 0; transition: opacity 0.2s; cursor: pointer; min-height: 4px; }
  .bar:hover { opacity: 0.8; }
  .bar-label { font-size: 9.5px; color: var(--text-muted); text-align: center; }
  .bar-val { font-size: 10.5px; color: var(--text-dim); font-weight: 600; }
  .h-bar-row { display: flex; align-items: center; gap: 10px; padding: 6px 0; }
  .h-bar-label { font-size: 12px; color: var(--text-dim); min-width: 80px; }
  .h-bar-track { flex: 1; height: 8px; background: var(--border2); border-radius: 4px; overflow: hidden; }
  .h-bar-fill { height: 100%; border-radius: 4px; }
  .h-bar-val { font-size: 11.5px; color: var(--text); font-weight: 600; min-width: 40px; text-align: right; }
  .forecast-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .forecast-row:last-child { border-bottom: none; }

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

  .section-title { font-family: var(--font-head); font-size: 11px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; }

  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 48px; color: var(--text-muted); }
  .empty-state-icon { font-size: 36px; opacity: 0.4; }
  .empty-state-text { font-size: 13px; }
`;

// ─── DATA ────────────────────────────────────────────────────────────────────

const STAGES = [
  { id: "s1", name: "Discovery", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", prob: 20 },
  { id: "s2", name: "Qualification", color: "#a855f7", bg: "rgba(168,85,247,0.1)", prob: 35 },
  { id: "s3", name: "Proposal", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", prob: 60 },
  { id: "s4", name: "Negotiation", color: "#f97316", bg: "rgba(249,115,22,0.1)", prob: 80 },
  { id: "s5", name: "Won", color: "#22c55e", bg: "rgba(34,197,94,0.1)", prob: 100 },
];

const OWNERS = { "Sara V.": "#f97316", "Tom H.": "#3b82f6", "Mark D.": "#a855f7" };

const [OPPS_INIT] = [
  [
    { id: 1, name: "Studio Pro + Training Bundle", company: "Rabobank", value: 48000, stageId: "s3", prob: 65, owner: "Sara V.", close: "Mar 15", product: "License + Training" },
    { id: 2, name: "Enterprise License Renewal", company: "ING Group", value: 120000, stageId: "s4", prob: 80, owner: "Tom H.", close: "Feb 28", product: "License" },
    { id: 3, name: "3-Month Dev Sprint Package", company: "Allianz NL", value: 72000, stageId: "s1", prob: 30, owner: "Sara V.", close: "Apr 10", product: "Development" },
    { id: 4, name: "Starter Training (5 seats)", company: "VGZ Health", value: 12500, stageId: "s5", prob: 100, owner: "Mark D.", close: "Feb 01", product: "Training" },
    { id: 5, name: "Platform Migration Consulting", company: "NS Railways", value: 95000, stageId: "s2", prob: 45, owner: "Tom H.", close: "May 20", product: "Development" },
    { id: 6, name: "Advanced Developer Training", company: "Capgemini NL", value: 28000, stageId: "s3", prob: 55, owner: "Mark D.", close: "Mar 30", product: "Training" },
    { id: 7, name: "Low-Code Transformation Roadmap", company: "Heineken Digital", value: 38000, stageId: "s4", prob: 75, owner: "Sara V.", close: "Mar 05", product: "Consulting" },
    { id: 8, name: "Mendix Renewal + Expansion", company: "ASML", value: 185000, stageId: "s5", prob: 100, owner: "Tom H.", close: "Jan 15", product: "License" },
    { id: 9, name: "Digital Ops Platform Build", company: "Randstad Group", value: 64000, stageId: "s2", prob: 40, owner: "Sara V.", close: "Jun 01", product: "Development" },
  ]
];

const CONTACTS = [
  { id: 1, name: "Joris van der Berg", company: "Rabobank", role: "Head of Digital Innovation", email: "j.vdberg@rabobank.nl", phone: "+31 6 1234 5678", lastContact: "2 days ago", status: "Active", tags: ["Champion", "Decision Maker"], grad: "linear-gradient(135deg,#f97316,#fbbf24)" },
  { id: 2, name: "Marieke de Boer", company: "ING Group", role: "VP Technology", email: "m.deboer@ing.nl", phone: "+31 6 9876 5432", lastContact: "Today", status: "Hot", tags: ["Economic Buyer"], grad: "linear-gradient(135deg,#3b82f6,#a855f7)" },
  { id: 3, name: "Pieter Smits", company: "Allianz NL", role: "IT Director", email: "p.smits@allianz.nl", phone: "+31 6 5566 7788", lastContact: "1 week ago", status: "Warm", tags: ["Influencer"], grad: "linear-gradient(135deg,#22c55e,#16a34a)" },
  { id: 4, name: "Anna Kowalski", company: "NS Railways", role: "CTO", email: "a.kowalski@ns.nl", phone: "+31 6 4433 2211", lastContact: "3 days ago", status: "Active", tags: ["Champion", "Technical"], grad: "linear-gradient(135deg,#ef4444,#f97316)" },
  { id: 5, name: "Luc Hendriksen", company: "Heineken Digital", role: "Digital Platform Lead", email: "l.hendriksen@heineken.com", phone: "+31 6 7788 9900", lastContact: "Yesterday", status: "Hot", tags: ["Decision Maker"], grad: "linear-gradient(135deg,#a855f7,#ec4899)" },
];

const ACCOUNTS = [
  { id: 1, name: "Rabobank", industry: "Banking", size: "Enterprise", contacts: 3, deals: 2, value: 48000, status: "Active Customer", country: "NL", logo: "🏦" },
  { id: 2, name: "ING Group", industry: "Banking", size: "Enterprise", contacts: 2, deals: 1, value: 120000, status: "Hot Lead", country: "NL", logo: "🏛️" },
  { id: 3, name: "ASML", industry: "Technology", size: "Enterprise", contacts: 4, deals: 2, value: 185000, status: "Active Customer", country: "NL", logo: "🔬" },
  { id: 4, name: "NS Railways", industry: "Transport", size: "Large", contacts: 2, deals: 1, value: 95000, status: "In Progress", country: "NL", logo: "🚂" },
  { id: 5, name: "Heineken Digital", industry: "FMCG", size: "Enterprise", contacts: 1, deals: 1, value: 38000, status: "In Progress", country: "NL", logo: "🍺" },
  { id: 6, name: "Capgemini NL", industry: "Consulting", size: "Large", contacts: 2, deals: 1, value: 28000, status: "Active Customer", country: "NL", logo: "💼" },
];

const INTERACTIONS = [
  { id: 1, type: "call", title: "Discovery call — Q1 roadmap", content: "Discussed Mendix expansion plans. Budget confirmed for 3 more seats. Demo scheduled next Tuesday.", user: "Sara V.", time: "Today, 11:30", tags: ["Budget Confirmed"] },
  { id: 2, type: "email", title: "Proposal sent — Studio Pro Bundle", content: "Full proposal including license pricing, 2-day onboarding training, and dedicated SLA. Awaiting sign-off from procurement.", user: "Sara V.", time: "Yesterday, 09:15", tags: ["Proposal"] },
  { id: 3, type: "meeting", title: "On-site presentation at HQ", content: "Presented platform capabilities to 12 stakeholders. Strong reception — PoC requested.", user: "Tom H.", time: "Feb 15, 14:00", tags: ["PoC Requested"] },
  { id: 4, type: "note", title: "Internal note — pricing sensitivity", content: "Comparing with OutSystems. Keep pricing flexible but firm on enterprise tier.", user: "Sara V.", time: "Feb 14, 16:44", tags: ["Internal", "Competitive"] },
  { id: 5, type: "email", title: "LinkedIn intro + first email", content: "Initial outreach via LinkedIn. Joris responded within 2 hours.", user: "Mark D.", time: "Feb 08, 10:00", tags: ["Outreach"] },
];

const STAGE_STYLE = (s) => STAGES.find(st => st.id === s) || STAGES[0];

const ACT_STYLES = {
  call:    { icon: "📞", bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
  email:   { icon: "✉️",  bg: "rgba(59,130,246,0.12)", color: "#3b82f6" },
  meeting: { icon: "🤝", bg: "rgba(249,115,22,0.12)", color: "#f97316" },
  note:    { icon: "📝", bg: "rgba(168,85,247,0.12)", color: "#a855f7" },
};

// ─── HELPERS ────────────────────────────────────────────────────────────────

function StageBadge({ stageId }) {
  const s = STAGE_STYLE(stageId);
  return (
    <span className="stage-badge" style={{ background: s.bg, color: s.color }}>
      <span className="stage-dot" style={{ background: s.color }} />
      {s.name}
    </span>
  );
}

function ProbBar({ prob }) {
  const color = prob >= 80 ? "#22c55e" : prob >= 50 ? "#f97316" : "#4e5770";
  return (
    <div className="prob-wrap">
      <div className="prob-bar"><div className="prob-fill" style={{ width: `${prob}%`, background: color }} /></div>
      <span className="prob-text">{prob}%</span>
    </div>
  );
}

function Av({ name, size = 28, radius = "50%", style = {} }) {
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("");
  const colors = ["linear-gradient(135deg,#f97316,#fbbf24)", "linear-gradient(135deg,#3b82f6,#a855f7)", "linear-gradient(135deg,#22c55e,#16a34a)", "linear-gradient(135deg,#ef4444,#f97316)", "linear-gradient(135deg,#a855f7,#ec4899)"];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div style={{ width: size, height: size, borderRadius: radius, background: colors[idx], display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: size * 0.38, flexShrink: 0, ...style }}>
      {initials}
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

function Dashboard({ opps }) {
  const open = opps.filter(o => o.stageId !== "s5");
  const won = opps.filter(o => o.stageId === "s5");
  const pipeline = open.reduce((a, b) => a + b.value, 0);
  const wonVal = won.reduce((a, b) => a + b.value, 0);
  const weighted = open.reduce((a, b) => a + b.value * b.prob / 100, 0);

  const stageCounts = STAGES.map(s => ({
    ...s,
    count: opps.filter(o => o.stageId === s.id).length,
    val: opps.filter(o => o.stageId === s.id).reduce((a, b) => a + b.value, 0),
  }));
  const maxVal = Math.max(...stageCounts.map(s => s.val));

  return (
    <div className="content">
      <div className="kpi-grid">
        {[
          { label: "Pipeline Value", value: `€${(pipeline/1000).toFixed(0)}K`, delta: "+18%", up: true, accent: "#f97316" },
          { label: "Won YTD", value: `€${(wonVal/1000).toFixed(0)}K`, delta: "+34%", up: true, accent: "#22c55e" },
          { label: "Weighted Forecast", value: `€${(weighted/1000).toFixed(0)}K`, delta: "+11%", up: true, accent: "#3b82f6" },
          { label: "Open Deals", value: open.length, delta: "+3", up: true, accent: "#a855f7" },
        ].map(k => (
          <div className="kpi-card" key={k.label} style={{ "--accent": k.accent }}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            <span className={`kpi-delta ${k.up ? "up" : "down"}`}>{k.up ? "↑" : "↓"} {k.delta} vs Q3</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 12, marginBottom: 12 }}>
        <div className="panel">
          <div className="panel-header"><span className="panel-title">Pipeline by Stage</span></div>
          <div className="chart-area">
            <div className="bar-chart" style={{ height: 140 }}>
              {stageCounts.map(s => {
                const h = maxVal > 0 ? Math.max(8, (s.val / maxVal) * 110) : 8;
                return (
                  <div key={s.id} className="bar-wrap">
                    <div className="bar-val">€{(s.val/1000).toFixed(0)}K</div>
                    <div className="bar" style={{ height: h, background: s.bg, border: `1px solid ${s.color}44` }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: s.color, textAlign: "center" }}>{s.count}</div>
                    <div className="bar-label">{s.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><span className="panel-title">Recent Activity</span></div>
          {[
            { icon: "📞", bg: "rgba(34,197,94,0.1)", title: "Call — Marieke de Boer (ING)", sub: "Negotiation update", time: "11:30" },
            { icon: "✉️", bg: "rgba(59,130,246,0.1)", title: "Proposal sent — Capgemini NL", sub: "Sara V. · €28K", time: "09:15" },
            { icon: "🎉", bg: "rgba(34,197,94,0.1)", title: "Deal WON — ASML Renewal", sub: "Tom H. · €185K", time: "Yesterday" },
            { icon: "📝", bg: "rgba(168,85,247,0.1)", title: "Note — NS Railways CTO", sub: "Follow-up next week", time: "Feb 19" },
          ].map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer" }} className="hover-surface">
              <div className="act-icon" style={{ background: a.bg }}>{a.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{a.sub}</div>
              </div>
              <div style={{ fontSize: 10.5, color: "var(--text-muted)", flexShrink: 0 }}>{a.time}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><span className="panel-title">Top Open Opportunities</span><span className="panel-action">View all →</span></div>
        <table className="data-table">
          <thead><tr><th>Opportunity</th><th>Stage</th><th>Value</th><th>Probability</th><th>Owner</th><th>Close</th></tr></thead>
          <tbody>
            {opps.filter(o => o.stageId !== "s5").slice(0, 5).map(o => (
              <tr key={o.id}>
                <td><div className="cell-primary">{o.name}</div><div className="cell-sub">{o.company}</div></td>
                <td><StageBadge stageId={o.stageId} /></td>
                <td style={{ fontWeight: 600, color: "var(--text)" }}>€{o.value.toLocaleString()}</td>
                <td><ProbBar prob={o.prob} /></td>
                <td><div style={{ display: "flex", alignItems: "center", gap: 6 }}><Av name={o.owner} size={22} /><span style={{ fontSize: 12, color: "var(--text-dim)" }}>{o.owner}</span></div></td>
                <td style={{ fontSize: 12, color: "var(--text-dim)" }}>{o.close}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── KANBAN ───────────────────────────────────────────────────────────────────

function Kanban({ opps, setOpps }) {
  const dragRef = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  const onDragStart = (opp) => { dragRef.current = opp; };
  const onDragOver = (e, stageId) => { e.preventDefault(); setDragOver(stageId); };
  const onDrop = (stageId) => {
    if (!dragRef.current) return;
    setOpps(prev => prev.map(o => o.id === dragRef.current.id ? { ...o, stageId } : o));
    dragRef.current = null;
    setDragOver(null);
  };
  const onDragEnd = () => { dragRef.current = null; setDragOver(null); };

  return (
    <div className="kanban-wrap">
      {STAGES.map(stage => {
        const stageOpps = opps.filter(o => o.stageId === stage.id);
        const stageVal = stageOpps.reduce((a, b) => a + b.value, 0);
        return (
          <div key={stage.id} className="kanban-col">
            <div className="kanban-col-header">
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color }} />
                <span className="kanban-col-title" style={{ color: stage.color }}>{stage.name}</span>
                <span style={{ background: stage.bg, color: stage.color, fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 20 }}>{stageOpps.length}</span>
              </div>
              <span className="kanban-col-meta">€{(stageVal/1000).toFixed(0)}K</span>
            </div>

            <div
              className={`kanban-col-body drop-zone ${dragOver === stage.id ? "over" : ""}`}
              onDragOver={e => onDragOver(e, stage.id)}
              onDrop={() => onDrop(stage.id)}
              onDragLeave={() => setDragOver(null)}
            >
              {stageOpps.map(opp => (
                <div
                  key={opp.id}
                  className="opp-card"
                  draggable
                  onDragStart={() => onDragStart(opp)}
                  onDragEnd={onDragEnd}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
                    <span className="tag" style={{ background: "var(--surface2)", color: "var(--text-muted)", fontSize: 10 }}>{opp.product}</span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{opp.close}</span>
                  </div>
                  <div className="opp-card-name">{opp.name}</div>
                  <div className="opp-card-company">{opp.company}</div>
                  <div className="opp-card-footer">
                    <span className="opp-card-value">€{opp.value.toLocaleString()}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span className="opp-card-prob">{opp.prob}%</span>
                      <Av name={opp.owner} size={22} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── PIPELINE TABLE ──────────────────────────────────────────────────────────

function Pipeline({ opps }) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "License", "Training", "Development", "Consulting"];
  const visible = filter === "All" ? opps : opps.filter(o => o.product === filter);

  return (
    <div className="content" style={{ padding: 0 }}>
      <div className="filter-bar">
        {filters.map(f => <button key={f} className={`filter-pill ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>)}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" style={{ padding: "5px 11px" }}>↕ Sort</button>
          <button className="btn btn-primary" style={{ padding: "5px 11px" }}>+ New Deal</button>
        </div>
      </div>
      <table className="data-table">
        <thead><tr><th>Opportunity</th><th>Product</th><th>Stage</th><th>Value</th><th>Prob.</th><th>Owner</th><th>Close</th></tr></thead>
        <tbody>
          {visible.map(o => (
            <tr key={o.id}>
              <td><div className="cell-primary">{o.name}</div><div className="cell-sub">{o.company}</div></td>
              <td><span className="tag" style={{ background: "var(--surface2)", color: "var(--text-dim)" }}>{o.product}</span></td>
              <td><StageBadge stageId={o.stageId} /></td>
              <td style={{ fontWeight: 600, color: "var(--text)" }}>€{o.value.toLocaleString()}</td>
              <td><ProbBar prob={o.prob} /></td>
              <td><div style={{ display: "flex", alignItems: "center", gap: 6 }}><Av name={o.owner} size={20} /><span style={{ fontSize: 12 }}>{o.owner}</span></div></td>
              <td style={{ fontSize: 12, color: o.stageId === "s5" ? "var(--green)" : "var(--text-dim)" }}>{o.close}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── CONTACTS ────────────────────────────────────────────────────────────────

function Contacts({ opps }) {
  const [selected, setSelected] = useState(CONTACTS[0]);
  const [actType, setActType] = useState("note");
  const [actText, setActText] = useState("");

  return (
    <div className="contact-layout">
      <div className="contact-list-pane">
        <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input className="search-input" style={{ width: "100%" }} placeholder="Search contacts..." />
          </div>
        </div>
        {CONTACTS.map(c => (
          <div key={c.id} className={`contact-row ${selected?.id === c.id ? "selected" : ""}`} onClick={() => setSelected(c)}>
            <Av name={c.name} size={34} radius="8px" style={{ background: c.grad }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{c.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 1 }}>{c.company} · {c.role}</div>
            </div>
            <span className="tag" style={{
              background: c.status === "Hot" ? "rgba(249,115,22,0.12)" : c.status === "Active" ? "rgba(34,197,94,0.12)" : "rgba(251,191,36,0.1)",
              color: c.status === "Hot" ? "var(--orange)" : c.status === "Active" ? "var(--green)" : "var(--amber)",
              fontSize: 10
            }}>{c.status}</span>
          </div>
        ))}
      </div>

      {selected && (
        <div className="contact-detail-pane">
          <div className="detail-header">
            <Av name={selected.name} size={48} radius="12px" style={{ background: selected.grad }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontFamily: "var(--font-head)", fontSize: 19, fontWeight: 700, marginBottom: 6 }}>{selected.name}</h2>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12.5, color: "var(--text-dim)" }}>
                <span>🏢 {selected.company}</span><span>💼 {selected.role}</span>
                <span>✉️ {selected.email}</span><span>📞 {selected.phone}</span>
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 5, flexWrap: "wrap" }}>
                {selected.tags.map(t => <span key={t} className="tag" style={{ background: "var(--orange-glow)", color: "var(--orange)", fontSize: 11 }}>{t}</span>)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button className="btn btn-ghost">📞</button>
              <button className="btn btn-ghost">✉️</button>
              <button className="btn btn-primary">+ Log</button>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-panel">
              <div className="detail-panel-title">Details</div>
              {[["Company", selected.company], ["Title", selected.role], ["Email", selected.email], ["Phone", selected.phone], ["Last Activity", selected.lastContact], ["Status", selected.status]].map(([k, v]) => (
                <div className="field-row" key={k}><span className="field-key">{k}</span><span className="field-val">{v}</span></div>
              ))}
            </div>
            <div className="detail-panel">
              <div className="detail-panel-title">Linked Opportunities</div>
              {opps.filter(o => o.company === selected.company).length > 0 ? opps.filter(o => o.company === selected.company).map(o => (
                <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                  <div><div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text)" }}>{o.name}</div><div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{o.product}</div></div>
                  <div style={{ textAlign: "right" }}><StageBadge stageId={o.stageId} /><div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 3 }}>€{o.value.toLocaleString()}</div></div>
                </div>
              )) : <div style={{ color: "var(--text-muted)", fontSize: 12.5 }}>No linked opportunities.</div>}
            </div>
          </div>

          <div className="log-bar">
            <div style={{ display: "flex", gap: 4 }}>
              {["note","call","email","meeting"].map(t => (
                <button key={t} className={`act-type-btn ${actType === t ? "active" : ""}`} onClick={() => setActType(t)}>
                  {ACT_STYLES[t].icon} {t[0].toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>
            <input className="act-input" placeholder={`Log a ${actType}...`} value={actText} onChange={e => setActText(e.target.value)} />
            <button className="btn btn-primary" disabled={!actText}>Save</button>
          </div>

          <div style={{ padding: "16px 24px" }}>
            <div className="section-title">Interaction History</div>
            {INTERACTIONS.map(item => {
              const s = ACT_STYLES[item.type];
              return (
                <div className="timeline-item" key={item.id}>
                  <div className="timeline-icon" style={{ background: s.bg }}>{s.icon}</div>
                  <div className="timeline-body">
                    <div className="timeline-title">{item.title}</div>
                    <div className="timeline-content">{item.content}</div>
                    <div className="timeline-meta">
                      <span>👤 {item.user}</span>
                      <span>🕐 {item.time}</span>
                      {item.tags.map(t => <span key={t} className="tag" style={{ background: "var(--surface2)", color: "var(--text-dim)", fontSize: 10 }}>{t}</span>)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ACCOUNTS ────────────────────────────────────────────────────────────────

function Accounts({ opps }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="content">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div className="search-wrap"><span className="search-icon">🔍</span><input className="search-input" style={{ width: 220 }} placeholder="Search accounts..." /></div>
        <button className="btn btn-primary">+ New Account</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: 12 }}>
        <div className="panel">
          <table className="data-table">
            <thead><tr><th>Account</th><th>Industry</th><th>Size</th><th>Contacts</th><th>Open Deals</th><th>Total Value</th><th>Status</th></tr></thead>
            <tbody>
              {ACCOUNTS.map(a => {
                const acctOpps = opps.filter(o => o.company === a.name);
                const total = acctOpps.reduce((s, o) => s + o.value, 0);
                return (
                  <tr key={a.id} onClick={() => setSelected(selected?.id === a.id ? null : a)}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{a.logo}</div>
                        <div><div className="cell-primary">{a.name}</div><div className="cell-sub">{a.country}</div></div>
                      </div>
                    </td>
                    <td>{a.industry}</td>
                    <td>{a.size}</td>
                    <td>{a.contacts}</td>
                    <td>{acctOpps.filter(o => o.stageId !== "s5").length}</td>
                    <td style={{ fontWeight: 600, color: "var(--text)" }}>€{total.toLocaleString()}</td>
                    <td>
                      <span className="tag" style={{
                        background: a.status === "Active Customer" ? "rgba(34,197,94,0.1)" : a.status === "Hot Lead" ? "rgba(249,115,22,0.1)" : "rgba(251,191,36,0.1)",
                        color: a.status === "Active Customer" ? "var(--green)" : a.status === "Hot Lead" ? "var(--orange)" : "var(--amber)"
                      }}>{a.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="panel" style={{ height: "fit-content" }}>
            <div className="panel-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{selected.logo}</div>
                <div>
                  <div className="panel-title">{selected.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{selected.industry} · {selected.size}</div>
                </div>
              </div>
              <span style={{ cursor: "pointer", color: "var(--text-muted)", fontSize: 14 }} onClick={() => setSelected(null)}>✕</span>
            </div>
            <div style={{ padding: 16 }}>
              <div className="section-title" style={{ marginBottom: 8 }}>Contacts</div>
              {CONTACTS.filter(c => c.company === selected.name).map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
                  <Av name={c.name} size={28} style={{ background: c.grad }} />
                  <div><div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text)" }}>{c.name}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.role}</div></div>
                </div>
              ))}
              {CONTACTS.filter(c => c.company === selected.name).length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 12.5 }}>No contacts yet.</div>}

              <div className="section-title" style={{ marginTop: 16, marginBottom: 8 }}>Opportunities</div>
              {opps.filter(o => o.company === selected.name).map(o => (
                <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
                  <div><div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text)" }}>{o.name}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{o.product}</div></div>
                  <div style={{ textAlign: "right" }}><StageBadge stageId={o.stageId} /><div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 3 }}>€{o.value.toLocaleString()}</div></div>
                </div>
              ))}
              {opps.filter(o => o.company === selected.name).length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 12.5 }}>No linked deals yet.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────

function Reports({ opps }) {
  const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const wonByMonth = [28000, 45000, 62000, 38000, 95000, 185000, 0];
  const forecastByMonth = [0, 0, 0, 0, 0, 0, 48000 + 38000 * 0.75];
  const maxM = Math.max(...wonByMonth);

  const owners = Object.keys(OWNERS);
  const ownerStats = owners.map(name => ({
    name,
    open: opps.filter(o => o.owner === name && o.stageId !== "s5").length,
    won: opps.filter(o => o.owner === name && o.stageId === "s5").length,
    value: opps.filter(o => o.owner === name).reduce((a, b) => a + b.value, 0),
    weighted: opps.filter(o => o.owner === name).reduce((a, b) => a + b.value * b.prob / 100, 0),
  }));

  const productMix = ["License", "Training", "Development", "Consulting"].map(p => ({
    name: p,
    value: opps.filter(o => o.product === p || o.product?.includes(p)).reduce((a, b) => a + b.value, 0),
    count: opps.filter(o => o.product === p || o.product?.includes(p)).length,
  }));
  const maxP = Math.max(...productMix.map(p => p.value));

  const stageForecast = STAGES.map(s => {
    const stageOpps = opps.filter(o => o.stageId === s.id);
    return {
      ...s,
      gross: stageOpps.reduce((a, b) => a + b.value, 0),
      weighted: stageOpps.reduce((a, b) => a + b.value * b.prob / 100, 0),
      count: stageOpps.length,
    };
  });

  return (
    <div className="content">
      <div className="kpi-grid">
        {[
          { label: "Win Rate", value: "38%", delta: "+5%", up: true, accent: "#22c55e" },
          { label: "Avg. Sales Cycle", value: "47 days", delta: "-8d", up: true, accent: "#3b82f6" },
          { label: "Avg. Deal Size", value: "€58K", delta: "+12%", up: true, accent: "#f97316" },
          { label: "Deals Created (MTD)", value: "7", delta: "+2", up: true, accent: "#a855f7" },
        ].map(k => (
          <div className="kpi-card" key={k.label} style={{ "--accent": k.accent }}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            <span className={`kpi-delta ${k.up ? "up" : "down"}`}>{k.up ? "↑" : "↓"} {k.delta}</span>
          </div>
        ))}
      </div>

      <div className="report-grid">
        <div className="panel">
          <div className="panel-header"><span className="panel-title">Revenue Closed by Month</span></div>
          <div className="chart-area">
            <div className="bar-chart">
              {months.map((m, i) => {
                const h = maxM > 0 ? Math.max(4, (wonByMonth[i] / maxM) * 100) : 4;
                const fh = maxM > 0 ? Math.max(0, (forecastByMonth[i] / maxM) * 100) : 0;
                return (
                  <div key={m} className="bar-wrap">
                    <div className="bar-val">{wonByMonth[i] > 0 ? `€${(wonByMonth[i]/1000).toFixed(0)}K` : forecastByMonth[i] > 0 ? `~€${(forecastByMonth[i]/1000).toFixed(0)}K` : ""}</div>
                    <div className="bar" style={{ height: wonByMonth[i] > 0 ? h : fh, background: wonByMonth[i] > 0 ? "rgba(34,197,94,0.2)" : "rgba(249,115,22,0.12)", border: `1px solid ${wonByMonth[i] > 0 ? "#22c55e44" : "#f9731622"}`, borderStyle: forecastByMonth[i] > 0 ? "dashed" : "solid" }} />
                    <div className="bar-label">{m}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 11, color: "var(--text-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(34,197,94,0.2)", border: "1px solid #22c55e44", display: "inline-block" }} />Closed</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(249,115,22,0.12)", border: "1px dashed #f9731622", display: "inline-block" }} />Forecast</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><span className="panel-title">Revenue by Product</span></div>
          <div className="chart-area">
            {productMix.map(p => (
              <div className="h-bar-row" key={p.name}>
                <span className="h-bar-label">{p.name}</span>
                <div className="h-bar-track"><div className="h-bar-fill" style={{ width: `${maxP > 0 ? (p.value / maxP) * 100 : 0}%`, background: "var(--orange)" }} /></div>
                <span className="h-bar-val">€{(p.value/1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><span className="panel-title">Rep Performance</span></div>
          <table className="data-table">
            <thead><tr><th>Rep</th><th>Open</th><th>Won</th><th>Pipeline</th><th>Weighted</th></tr></thead>
            <tbody>
              {ownerStats.map(r => (
                <tr key={r.name}>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 7 }}><Av name={r.name} size={24} /><span style={{ fontWeight: 500, color: "var(--text)", fontSize: 12.5 }}>{r.name}</span></div></td>
                  <td>{r.open}</td>
                  <td style={{ color: "var(--green)", fontWeight: 600 }}>{r.won}</td>
                  <td style={{ fontWeight: 600, color: "var(--text)", fontSize: 12.5 }}>€{(r.value/1000).toFixed(0)}K</td>
                  <td style={{ fontSize: 12.5 }}>€{(r.weighted/1000).toFixed(0)}K</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-header"><span className="panel-title">Q1 Forecast by Stage</span></div>
          <div style={{ padding: "12px 16px" }}>
            {stageForecast.map(s => (
              <div className="forecast-row" key={s.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="stage-badge" style={{ background: s.bg, color: s.color }}><span className="stage-dot" style={{ background: s.color }} />{s.name}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.count} deals</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-head)" }}>€{(s.weighted/1000).toFixed(0)}K</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>€{(s.gross/1000).toFixed(0)}K gross</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 14, padding: "12px 0", borderTop: "2px solid var(--border2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 13 }}>Total Weighted Forecast</span>
              <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 20, color: "var(--orange)" }}>
                €{(opps.filter(o => o.stageId !== "s5").reduce((a, b) => a + b.value * b.prob / 100, 0) / 1000).toFixed(0)}K
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ACTIVITIES ───────────────────────────────────────────────────────────────

function Activities() {
  const [typeFilter, setTypeFilter] = useState("All");
  const all = [
    { id: 1, type: "call", title: "Follow-up call with Marieke de Boer", company: "ING Group", user: "Sara V.", time: "Today 14:00", opp: "Enterprise License", outcome: "Positive — moving to contract" },
    { id: 2, type: "meeting", title: "Quarterly Business Review", company: "ASML", user: "Tom H.", time: "Today 10:00", opp: "Renewal + Expansion", outcome: "Renewal confirmed" },
    { id: 3, type: "email", title: "Proposal follow-up", company: "Capgemini NL", user: "Mark D.", time: "Yesterday 09:30", opp: "Advanced Training", outcome: null },
    { id: 4, type: "task", title: "Prepare PoC environment for Rabobank", company: "Rabobank", user: "Sara V.", time: "Due Mar 01", opp: "Studio Pro Bundle", outcome: null },
    { id: 5, type: "note", title: "Internal strategy note — NS Railways", company: "NS Railways", user: "Tom H.", time: "Feb 19", opp: "Platform Migration", outcome: null },
    { id: 6, type: "email", title: "Intro email — Randstad Group", company: "Randstad Group", user: "Sara V.", time: "Feb 18", opp: "Digital Ops Platform", outcome: "Opened and replied" },
  ];

  const types = ["All", "call", "email", "meeting", "task", "note"];
  const filtered = typeFilter === "All" ? all : all.filter(a => a.type === typeFilter);

  const ACT_EXT = { task: { icon: "✅", bg: "rgba(251,191,36,0.12)", color: "#fbbf24" }, ...ACT_STYLES };

  return (
    <div className="content">
      <div style={{ display: "flex", gap: 8, marginBottom: 16, justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {types.map(t => (
            <button key={t} className={`filter-pill ${typeFilter === t ? "active" : ""}`} onClick={() => setTypeFilter(t)}>
              {t === "All" ? "All" : `${ACT_EXT[t]?.icon} ${t[0].toUpperCase()+t.slice(1)}`}
            </button>
          ))}
        </div>
        <button className="btn btn-primary">+ Log Activity</button>
      </div>

      <div className="panel">
        <table className="data-table">
          <thead><tr><th>Activity</th><th>Company</th><th>Opportunity</th><th>Owner</th><th>Time</th><th>Outcome</th></tr></thead>
          <tbody>
            {filtered.map(a => {
              const s = ACT_EXT[a.type] || ACT_STYLES.note;
              return (
                <tr key={a.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>{s.icon}</div>
                      <div className="cell-primary">{a.title}</div>
                    </div>
                  </td>
                  <td>{a.company}</td>
                  <td style={{ fontSize: 12, color: "var(--text-dim)" }}>{a.opp}</td>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 5 }}><Av name={a.user} size={20} /><span style={{ fontSize: 12 }}>{a.user}</span></div></td>
                  <td style={{ fontSize: 12, color: "var(--text-dim)" }}>{a.time}</td>
                  <td>{a.outcome ? <span className="tag" style={{ background: "rgba(34,197,94,0.1)", color: "var(--green)", fontSize: 11 }}>{a.outcome}</span> : <span style={{ fontSize: 12, color: "var(--text-muted)" }}>—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SHELL ────────────────────────────────────────────────────────────────────

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "kanban", label: "Pipeline (Board)", icon: "⊞", group: "Sales" },
  { id: "pipeline", label: "Pipeline (List)", icon: "☰" },
  { id: "contacts", label: "Contacts", icon: "◎" },
  { id: "accounts", label: "Accounts", icon: "🏢" },
  { id: "activities", label: "Activities", icon: "⚡", badge: "3" },
  { id: "reports", label: "Reports", icon: "▲" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [opps, setOpps] = useState(OPPS_INIT);

  return (
    <>
      <style>{styles}</style>
      <div className="shell">
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">🍂</div>
            <div className="logo-text">Orangeleaf<span>CRM Platform</span></div>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-label">Overview</div>
            <div className={`nav-item ${page === "dashboard" ? "active" : ""}`} onClick={() => setPage("dashboard")}><span className="nav-icon">▦</span>Dashboard</div>
            <div className="nav-label">Sales</div>
            <div className={`nav-item ${page === "kanban" ? "active" : ""}`} onClick={() => setPage("kanban")}><span className="nav-icon">⊞</span>Board View</div>
            <div className={`nav-item ${page === "pipeline" ? "active" : ""}`} onClick={() => setPage("pipeline")}><span className="nav-icon">☰</span>List View</div>
            <div className="nav-label">CRM</div>
            <div className={`nav-item ${page === "contacts" ? "active" : ""}`} onClick={() => setPage("contacts")}><span className="nav-icon">◎</span>Contacts</div>
            <div className={`nav-item ${page === "accounts" ? "active" : ""}`} onClick={() => setPage("accounts")}><span className="nav-icon">🏢</span>Accounts</div>
            <div className={`nav-item ${page === "activities" ? "active" : ""}`} onClick={() => setPage("activities")}><span className="nav-icon">⚡</span>Activities<span className="nav-badge">3</span></div>
            <div className="nav-label">Insights</div>
            <div className={`nav-item ${page === "reports" ? "active" : ""}`} onClick={() => setPage("reports")}><span className="nav-icon">▲</span>Reports</div>
          </nav>
          <div className="sidebar-footer">
            <div className="user-pill">
              <Av name="Sara Visser" size={26} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Sara Visser</div>
                <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>Account Executive</div>
              </div>
            </div>
          </div>
        </div>

        <div className="main">
          <div className="topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {page === "kanban" && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-ghost active" style={{ padding: "4px 10px", fontSize: 12 }}>⊞ Board</button>
                  <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => setPage("pipeline")}>☰ List</button>
                </div>
              )}
              {page === "pipeline" && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => setPage("kanban")}>⊞ Board</button>
                  <button className="btn btn-ghost active" style={{ padding: "4px 10px", fontSize: 12 }}>☰ List</button>
                </div>
              )}
              <div className="page-title">{NAV.find(n => n.id === page)?.label || "Dashboard"}</div>
            </div>
            <div className="topbar-right">
              <div className="search-wrap"><span className="search-icon">🔍</span><input className="search-input" style={{ width: 180 }} placeholder="Quick search..." /></div>
              <button className="btn btn-ghost" style={{ padding: "6px 10px" }}>🔔</button>
              <button className="btn btn-ghost" style={{ padding: "6px 10px" }}>⚙️</button>
              <button className="btn btn-primary">+ New</button>
            </div>
          </div>

          {page === "dashboard"  && <Dashboard opps={opps} />}
          {page === "kanban"     && <Kanban opps={opps} setOpps={setOpps} />}
          {page === "pipeline"   && <Pipeline opps={opps} />}
          {page === "contacts"   && <Contacts opps={opps} />}
          {page === "accounts"   && <Accounts opps={opps} />}
          {page === "activities" && <Activities />}
          {page === "reports"    && <Reports opps={opps} />}
        </div>
      </div>
    </>
  );
}
