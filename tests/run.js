// Test runner: node tests/run.js [--engine] [--ui] [--fast]
// Engine tests need only Node. UI tests need Playwright + Chromium (npx playwright install chromium).
const { spawnSync } = require('child_process'); const fs = require('fs'); const path = require('path');
const args = process.argv.slice(2); const fast = args.includes('--fast');
const wantUi = args.includes('--ui') || (!args.includes('--engine') && !args.includes('--ui') && hasPlaywright());
const wantEngine = args.includes('--engine') || !args.includes('--ui');
function hasPlaywright() { try { require.resolve('playwright'); return true; } catch (e) { return false; } }
const env = { ...process.env }; if (fast) { env.SIMS = env.SIMS || '30'; env.REPS = env.REPS || '2'; }
// Output that means "something is wrong" even when the process exits 0 (most older tests only print results).
const BAD = /\berrors [1-9]|\berrors \[\s*["{]|\bERR\b|\bFAIL\b|Uncaught|TypeError|ReferenceError|SyntaxError|\bSMALL starter|\bMISSING\b|issues \{\s*"|fnDropped [1-9]/;
const dirs = []; if (wantEngine) dirs.push('engine'); if (wantUi) dirs.push('ui');
let failed = 0, total = 0;
for (const d of dirs) for (const f of fs.readdirSync(path.join(__dirname, d)).filter(x => x.endsWith('.js')).sort()) {
  total++; const t0 = Date.now();
  const r = spawnSync(process.execPath, [path.join(__dirname, d, f)], { env, encoding: 'utf8', timeout: d === 'ui' ? 240000 : 600000, maxBuffer: 1 << 26 });
  const out = (r.stdout || '') + (r.stderr || ''); const hit = out.split('\n').find(l => BAD.test(l));
  const ok = r.status === 0 && !hit; if (!ok) failed++;
  console.log((ok ? 'ok   ' : 'FAIL ') + d + '/' + f + ' (' + ((Date.now() - t0) / 1000).toFixed(1) + 's)' + (ok ? '' : '\n     ' + (hit || ('exit ' + r.status + (r.error ? ' ' + r.error.message : ''))).slice(0, 220)));
}
console.log(failed ? `\n${failed} of ${total} failed` : `\nall ${total} passed`); process.exit(failed ? 1 : 0);
