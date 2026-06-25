#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RESULTS = path.join(ROOT, 'test-results', 'results.json');

if (!fs.existsSync(RESULTS) || !process.env.GITHUB_STEP_SUMMARY) process.exit(0);

const r = JSON.parse(fs.readFileSync(RESULTS, 'utf-8'));
const { expected = 0, unexpected: failed = 0, skipped = 0, flaky = 0, duration = 0, startTime } = r.stats || {};
const passed = expected;
const total = passed + failed + skipped + flaky;

const STATUS_ICON = { expected: '✅', unexpected: '❌', skipped: '⏭️', flaky: '⚠️' };

function formatDuration(ms) {
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
}

function extractTests(suites) {
  const tests = [];
  for (const suite of suites || []) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const last = test.results?.[test.results.length - 1] || {};
        tests.push({
          title: spec.title,
          status: test.status,
          duration: last.duration || 0,
          error: last.error?.message,
        });
      }
    }
    tests.push(...extractTests(suite.suites));
  }
  return tests;
}

const tests = extractTests(r.suites);

const overallStatus =
  failed > 0 ? '❌ Tests Failed' : flaky > 0 ? '⚠️ Passed with flaky tests' : '✅ All Tests Passed';
const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

const lines = [];
lines.push(`## ${overallStatus}`, '');
lines.push(
  `**${passed}/${total}** passed (${passRate}%)` +
    (failed ? ` · **${failed}** failed` : '') +
    (flaky ? ` · **${flaky}** flaky` : '') +
    (skipped ? ` · **${skipped}** skipped` : '')
);
lines.push('');
lines.push(
  `⏱️ ${formatDuration(duration)}` +
    (startTime
      ? ` · 🗓️ ${new Date(startTime).toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' })} ICT`
      : '')
);
lines.push('', '| Status | Test | Duration |', '| --- | --- | --- |');
for (const t of tests) {
  lines.push(`| ${STATUS_ICON[t.status] ?? '❔'} | ${t.title} | ${formatDuration(t.duration)} |`);
}

const failures = tests.filter((t) => t.status === 'unexpected' && t.error);
if (failures.length) {
  lines.push('', `<details>`, `<summary>❌ Failure details (${failures.length})</summary>`, '');
  for (const f of failures) {
    lines.push(`**${f.title}**`, '', '```', f.error, '```', '');
  }
  lines.push('</details>');
}

fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
