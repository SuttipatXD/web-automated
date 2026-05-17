#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const RESULTS = path.join(ROOT, 'test-results', 'results.json');
const OUTPUT = path.join(ROOT, 'dashboard.html');

// ── Read & parse ──────────────────────────────────────────────────────────────
if (!fs.existsSync(RESULTS)) {
  console.error('\x1b[31m✗\x1b[0m test-results/results.json not found.');
  console.error('  Run \x1b[33mnpm test\x1b[0m first to generate results.');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(RESULTS, 'utf-8'));
const { stats, suites: rawSuites, config = {} } = raw;

// ── Extract all tests recursively ─────────────────────────────────────────────
function extractTests(suiteList, fileName) {
  const tests = [];
  for (const suite of suiteList) {
    const file = fileName || suite.file || suite.title;
    if (suite.specs) {
      for (const spec of suite.specs) {
        for (const test of spec.tests) {
          const last = test.results[test.results.length - 1] || {};
          tests.push({
            file,
            title: spec.title,
            ok: spec.ok,
            status: last.status || 'unknown',
            duration: last.duration || 0,
            project: test.projectName || '',
            retry: last.retry || 0,
            errors: (last.errors || [])
              .map(e => (e.message || String(e)).split('\n')[0])
              .slice(0, 2),
          });
        }
      }
    }
    if (suite.suites && suite.suites.length) {
      tests.push(...extractTests(suite.suites, file));
    }
  }
  return tests;
}

const allTests = extractTests(rawSuites);

// ── Group by file ─────────────────────────────────────────────────────────────
const suiteMap = new Map();
for (const t of allTests) {
  if (!suiteMap.has(t.file)) suiteMap.set(t.file, []);
  suiteMap.get(t.file).push(t);
}

// ── Compute stats ─────────────────────────────────────────────────────────────
const total = allTests.length;
const passed = allTests.filter(t => t.status === 'passed').length;
const failed = allTests.filter(t => t.status === 'failed').length;
const skipped = allTests.filter(t => t.status === 'skipped').length;
const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
const overallOk = failed === 0 && total > 0;

const startTime = new Date(stats.startTime);
const durationSec = (stats.duration / 1000).toFixed(1);
const formattedDate = startTime.toLocaleString('th-TH', {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
});
const browsers = [...new Set(allTests.map(t => t.project))].filter(Boolean);

// ── Helpers ───────────────────────────────────────────────────────────────────
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtDur(ms) {
  if (ms >= 60000) return `${(ms / 60000).toFixed(1)}m`;
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

// ── SVG Donut chart ───────────────────────────────────────────────────────────
function buildDonut() {
  const r = 52, cx = 68, cy = 68, sw = 18;
  const circ = 2 * Math.PI * r;

  if (total === 0) {
    return `<svg viewBox="0 0 136 136" class="donut-svg">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e2e8f0" stroke-width="${sw}"/>
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" class="donut-pct">0%</text>
    </svg>`;
  }

  const segments = [
    { val: passed, color: '#22c55e' },
    { val: failed, color: '#ef4444' },
    { val: skipped, color: '#f59e0b' },
  ].filter(s => s.val > 0);

  let cumArc = 0;
  const circles = segments.map(s => {
    const arc = (s.val / total) * circ;
    const offset = -cumArc;
    cumArc += arc;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}"
      stroke-width="${sw}" stroke-dasharray="${arc.toFixed(2)} ${(circ - arc).toFixed(2)}"
      stroke-dashoffset="${offset.toFixed(2)}" stroke-linecap="butt"/>`;
  });

  return `<svg viewBox="0 0 136 136" class="donut-svg" style="transform:rotate(-90deg)">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#f1f5f9" stroke-width="${sw}"/>
    ${circles.join('\n    ')}
    <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" class="donut-pct"
      style="transform:rotate(90deg);transform-origin:${cx}px ${cy}px">${passRate}%</text>
  </svg>`;
}

// ── Build suites HTML ─────────────────────────────────────────────────────────
function buildSuitesHTML() {
  let html = '';
  for (const [file, tests] of suiteMap) {
    const sp = tests.filter(t => t.status === 'passed').length;
    const sf = tests.filter(t => t.status === 'failed').length;
    const ss = tests.filter(t => t.status === 'skipped').length;
    const maxDur = Math.max(...tests.map(t => t.duration), 1);

    const rows = tests.map(t => {
      const barW = Math.max(Math.round((t.duration / maxDur) * 100), 3);
      const retryBadge = t.retry > 0
        ? `<span class="badge-retry">↺ retry ${t.retry}</span>` : '';
      const errBlock = t.errors.length
        ? `<div class="test-error">${t.errors.map(e => esc(e)).join('<br>')}</div>` : '';
      return `
        <div class="test-row status-${t.status}">
          <span class="test-dot"></span>
          <div class="test-body">
            <div class="test-title-row">
              <span class="test-name">${esc(t.title)}</span>
              <div class="test-tags">
                <span class="tag-browser">${esc(t.project)}</span>
                ${retryBadge}
                <span class="tag-dur">${fmtDur(t.duration)}</span>
              </div>
            </div>
            ${errBlock}
            <div class="dur-bar-wrap">
              <div class="dur-bar status-${t.status}" style="width:${barW}%"></div>
            </div>
          </div>
        </div>`;
    }).join('');

    html += `
      <div class="suite-card">
        <div class="suite-head">
          <div class="suite-name-wrap">
            <svg class="suite-file-icon" viewBox="0 0 16 16" fill="none">
              <path d="M3 2h7l3 3v9H3V2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
              <path d="M10 2v3h3" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
            </svg>
            <span class="suite-file">${esc(file)}</span>
          </div>
          <div class="suite-badges">
            ${sp ? `<span class="pill pill-pass">${sp} passed</span>` : ''}
            ${sf ? `<span class="pill pill-fail">${sf} failed</span>` : ''}
            ${ss ? `<span class="pill pill-skip">${ss} skipped</span>` : ''}
            <span class="pill pill-total">${tests.length} tests</span>
          </div>
        </div>
        <div class="suite-tests">${rows}</div>
      </div>`;
  }
  return html;
}

// ── Compose final HTML ────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Test Dashboard · BeWallet</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:        #f1f5f9;
    --surface:   #ffffff;
    --border:    #e2e8f0;
    --text:      #0f172a;
    --muted:     #64748b;
    --pass:      #16a34a;
    --pass-bg:   #dcfce7;
    --pass-ring: #22c55e;
    --fail:      #dc2626;
    --fail-bg:   #fee2e2;
    --fail-ring: #ef4444;
    --skip:      #b45309;
    --skip-bg:   #fef9c3;
    --skip-ring: #f59e0b;
    --total:     #1d4ed8;
    --total-bg:  #dbeafe;
    --radius:    12px;
    --shadow:    0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    --shadow-md: 0 4px 12px rgba(0,0,0,.08);
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    padding-bottom: 48px;
  }

  /* ── Header ── */
  .header {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
    color: #fff;
    padding: 28px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }
  .header-brand { display: flex; align-items: center; gap: 14px; }
  .header-logo {
    width: 44px; height: 44px;
    background: rgba(255,255,255,.12);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
  }
  .header-title { font-size: 22px; font-weight: 700; letter-spacing: -.3px; }
  .header-sub { font-size: 13px; color: rgba(255,255,255,.55); margin-top: 2px; }
  .header-meta { text-align: right; }
  .overall-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px; border-radius: 20px;
    font-size: 14px; font-weight: 600; letter-spacing: .3px;
  }
  .overall-badge.pass { background: #16a34a; }
  .overall-badge.fail { background: #dc2626; }
  .header-time { font-size: 12px; color: rgba(255,255,255,.5); margin-top: 6px; }

  /* ── Main layout ── */
  .main { max-width: 1100px; margin: 0 auto; padding: 32px 24px 0; }

  /* ── Stat cards ── */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  @media (max-width: 700px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }

  .stat-card {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 22px 20px;
    box-shadow: var(--shadow);
    display: flex; align-items: center; gap: 16px;
    position: relative; overflow: hidden;
  }
  .stat-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    border-radius: 99px 99px 0 0;
  }
  .stat-card.total::before  { background: var(--total); }
  .stat-card.passed::before { background: var(--pass-ring); }
  .stat-card.failed::before { background: var(--fail-ring); }
  .stat-card.skipped::before{ background: var(--skip-ring); }

  .stat-icon {
    width: 44px; height: 44px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .total  .stat-icon { background: var(--total-bg); }
  .passed .stat-icon { background: var(--pass-bg); }
  .failed .stat-icon { background: var(--fail-bg); }
  .skipped.stat-icon { background: var(--skip-bg); }

  .stat-info { flex: 1; min-width: 0; }
  .stat-num {
    font-size: 32px; font-weight: 800; line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .total  .stat-num { color: var(--total); }
  .passed .stat-num { color: var(--pass); }
  .failed .stat-num { color: var(--fail); }
  .skipped .stat-num { color: var(--skip); }

  .stat-label { font-size: 12px; color: var(--muted); font-weight: 500; margin-top: 4px; text-transform: uppercase; letter-spacing: .6px; }
  .stat-pct   { font-size: 12px; color: var(--muted); margin-top: 2px; }

  /* ── Overview row ── */
  .overview-row {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 16px;
    margin-bottom: 28px;
    align-items: center;
  }
  @media (max-width: 600px) { .overview-row { grid-template-columns: 1fr; } }

  .donut-wrap {
    background: var(--surface);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 20px;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
  }
  .donut-svg { width: 136px; height: 136px; }
  .donut-pct { font-size: 20px; font-weight: 800; fill: #0f172a; }
  .donut-legend { display: flex; flex-direction: column; gap: 6px; width: 100%; }
  .legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
  .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

  .stats-detail {
    background: var(--surface);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 24px 28px;
    display: flex; flex-direction: column; justify-content: center; gap: 16px;
  }
  .pass-rate-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .pass-rate-label { font-size: 14px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; }
  .pass-rate-pct { font-size: 28px; font-weight: 800; color: ${overallOk ? 'var(--pass)' : 'var(--fail)'}; }
  .progress-track {
    height: 10px; background: var(--border); border-radius: 99px; overflow: hidden;
  }
  .progress-fill {
    height: 100%; border-radius: 99px;
    background: ${overallOk ? 'linear-gradient(90deg,#4ade80,#16a34a)' : 'linear-gradient(90deg,#fca5a5,#dc2626)'};
    width: 0%;
    transition: width 1.2s cubic-bezier(.22,1,.36,1);
  }
  .meta-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 6px;
  }
  .meta-item { }
  .meta-key { font-size: 11px; text-transform: uppercase; letter-spacing: .6px; color: var(--muted); font-weight: 600; }
  .meta-val { font-size: 16px; font-weight: 700; margin-top: 2px; }

  /* ── Section header ── */
  .section-title {
    font-size: 13px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .8px; color: var(--muted);
    margin-bottom: 14px; padding-left: 2px;
  }

  /* ── Suite cards ── */
  .suite-card {
    background: var(--surface);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    margin-bottom: 16px;
    overflow: hidden;
  }
  .suite-head {
    padding: 16px 20px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px;
    border-bottom: 1px solid var(--border);
    background: #fafbfc;
  }
  .suite-name-wrap { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .suite-file-icon { width: 16px; height: 16px; color: var(--muted); flex-shrink: 0; }
  .suite-file { font-size: 14px; font-weight: 600; color: var(--text); font-family: 'SF Mono', 'Fira Code', monospace; }
  .suite-badges { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

  .pill {
    font-size: 11px; font-weight: 600; padding: 3px 9px;
    border-radius: 99px; white-space: nowrap;
  }
  .pill-pass  { background: var(--pass-bg);  color: var(--pass);  }
  .pill-fail  { background: var(--fail-bg);  color: var(--fail);  }
  .pill-skip  { background: var(--skip-bg);  color: var(--skip);  }
  .pill-total { background: #f1f5f9; color: var(--muted); }

  /* ── Test rows ── */
  .suite-tests { padding: 4px 0; }
  .test-row {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 20px;
    transition: background .1s;
  }
  .test-row:hover { background: #f8fafc; }
  .test-row + .test-row { border-top: 1px solid #f8fafc; }

  .test-dot {
    width: 8px; height: 8px; border-radius: 50%;
    margin-top: 6px; flex-shrink: 0;
  }
  .status-passed  .test-dot { background: var(--pass-ring); }
  .status-failed  .test-dot { background: var(--fail-ring); }
  .status-skipped .test-dot { background: var(--skip-ring); }
  .status-unknown .test-dot { background: #94a3b8; }

  .test-body { flex: 1; min-width: 0; }
  .test-title-row {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; flex-wrap: wrap;
  }
  .test-name { font-size: 14px; font-weight: 500; color: var(--text); }
  .status-failed .test-name { color: var(--fail); }

  .test-tags { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .tag-browser {
    font-size: 11px; font-weight: 600; padding: 2px 8px;
    background: #f1f5f9; color: var(--muted); border-radius: 6px;
    font-family: 'SF Mono', monospace;
  }
  .tag-dur { font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; }
  .badge-retry {
    font-size: 11px; font-weight: 600; padding: 2px 7px;
    background: #fef9c3; color: #b45309; border-radius: 6px;
  }

  .test-error {
    font-size: 12px; color: var(--fail); background: var(--fail-bg);
    padding: 6px 10px; border-radius: 6px; margin-top: 6px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    border-left: 3px solid var(--fail-ring);
  }
  .dur-bar-wrap { height: 3px; background: #f1f5f9; border-radius: 99px; margin-top: 8px; }
  .dur-bar { height: 100%; border-radius: 99px; }
  .dur-bar.status-passed  { background: var(--pass-ring); }
  .dur-bar.status-failed  { background: var(--fail-ring); }
  .dur-bar.status-skipped { background: var(--skip-ring); }
  .dur-bar.status-unknown { background: #94a3b8; }

  /* ── Footer ── */
  .footer {
    max-width: 1100px; margin: 32px auto 0; padding: 0 24px;
    text-align: center; font-size: 12px; color: var(--muted);
  }

  /* ── Count-up animation ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .stat-card { animation: fadeUp .4s ease both; }
  .stat-card:nth-child(1) { animation-delay: .05s; }
  .stat-card:nth-child(2) { animation-delay: .10s; }
  .stat-card:nth-child(3) { animation-delay: .15s; }
  .stat-card:nth-child(4) { animation-delay: .20s; }
  .suite-card { animation: fadeUp .4s ease both; animation-delay: .3s; }
</style>
</head>
<body>

<!-- Header -->
<header class="header">
  <div class="header-brand">
    <div class="header-logo">🧪</div>
    <div>
      <div class="header-title">BeWallet · Test Dashboard</div>
      <div class="header-sub">Playwright Automated Test Results</div>
    </div>
  </div>
  <div class="header-meta">
    <div class="overall-badge ${overallOk ? 'pass' : 'fail'}">
      ${overallOk ? '✓ ALL PASSED' : '✗ TESTS FAILED'}
    </div>
    <div class="header-time">${esc(formattedDate)} &nbsp;·&nbsp; ${esc(durationSec)}s</div>
  </div>
</header>

<main class="main">

  <!-- Stat Cards -->
  <div class="stats-grid">
    <div class="stat-card total">
      <div class="stat-icon total">📊</div>
      <div class="stat-info">
        <div class="stat-num" data-target="${total}">0</div>
        <div class="stat-label">Total Tests</div>
      </div>
    </div>
    <div class="stat-card passed">
      <div class="stat-icon passed">✅</div>
      <div class="stat-info">
        <div class="stat-num" data-target="${passed}">0</div>
        <div class="stat-label">Passed</div>
        <div class="stat-pct">${total > 0 ? Math.round(passed/total*100) : 0}% of total</div>
      </div>
    </div>
    <div class="stat-card failed">
      <div class="stat-icon failed">❌</div>
      <div class="stat-info">
        <div class="stat-num" data-target="${failed}">0</div>
        <div class="stat-label">Failed</div>
        <div class="stat-pct">${total > 0 ? Math.round(failed/total*100) : 0}% of total</div>
      </div>
    </div>
    <div class="stat-card skipped">
      <div class="stat-icon skipped">⏭️</div>
      <div class="stat-info">
        <div class="stat-num" data-target="${skipped}">0</div>
        <div class="stat-label">Skipped</div>
        <div class="stat-pct">${total > 0 ? Math.round(skipped/total*100) : 0}% of total</div>
      </div>
    </div>
  </div>

  <!-- Overview -->
  <div class="overview-row">
    <div class="donut-wrap">
      ${buildDonut()}
      <div class="donut-legend">
        <div class="legend-item"><div class="legend-dot" style="background:#22c55e"></div><span>${passed} Passed</span></div>
        ${failed  > 0 ? `<div class="legend-item"><div class="legend-dot" style="background:#ef4444"></div><span>${failed} Failed</span></div>` : ''}
        ${skipped > 0 ? `<div class="legend-item"><div class="legend-dot" style="background:#f59e0b"></div><span>${skipped} Skipped</span></div>` : ''}
      </div>
    </div>
    <div class="stats-detail">
      <div>
        <div class="pass-rate-row">
          <span class="pass-rate-label">Pass Rate</span>
          <span class="pass-rate-pct">${passRate}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" id="progress-fill" data-width="${passRate}"></div>
        </div>
      </div>
      <div class="meta-grid">
        <div class="meta-item">
          <div class="meta-key">Duration</div>
          <div class="meta-val">${esc(durationSec)}s</div>
        </div>
        <div class="meta-item">
          <div class="meta-key">Browser</div>
          <div class="meta-val">${esc(browsers.join(', ') || '—')}</div>
        </div>
        <div class="meta-item">
          <div class="meta-key">Suites</div>
          <div class="meta-val">${suiteMap.size}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Test Suites -->
  <div class="section-title">Test Suites · ${suiteMap.size} files</div>
  ${buildSuitesHTML()}

</main>

<footer class="footer">
  Generated ${esc(formattedDate)} &nbsp;·&nbsp;
  Playwright ${esc(config.version || '')} &nbsp;·&nbsp;
  BeWallet Test Dashboard
</footer>

<script>
  // Count-up animation
  function countUp(el, target, duration) {
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    setTimeout(() => countUp(el, target, 900), 200);
  });

  // Progress bar animation
  const fill = document.getElementById('progress-fill');
  if (fill) {
    setTimeout(() => { fill.style.width = fill.dataset.width + '%'; }, 300);
  }
</script>
</body>
</html>`;

// ── Write output ──────────────────────────────────────────────────────────────
fs.writeFileSync(OUTPUT, html, 'utf-8');
console.log('\x1b[32m✓\x1b[0m Dashboard generated: \x1b[36m' + OUTPUT + '\x1b[0m');

// Open in browser
const opener =
  process.platform === 'darwin' ? 'open' :
  process.platform === 'win32'  ? 'start' : 'xdg-open';

exec(`${opener} "${OUTPUT}"`, err => {
  if (err) console.log('  To open: open dashboard.html');
});
