import fs from 'fs';
import path from 'path';

const JSON_REPORT = 'reports/playwright-results.json';
const OUTPUT = path.join(__dirname, '../reports/execution-summary.json');

if (!fs.existsSync(JSON_REPORT)) {
  throw new Error(`Playwright JSON report not found: ${JSON_REPORT}`);
}

const report = JSON.parse(fs.readFileSync(JSON_REPORT, 'utf-8'));
const { stats } = report;

const status = stats.unexpected === 0 ? 'passed' : 'failed';
const durationMs = Math.round(stats.duration);

const summary = {
  scenarioName: 'Insider Careers – TC-01 to TC-08',
  status,
  timestamp: new Date().toISOString(),
  durationMs,
  evidence: {
    playwrightReport: 'playwright-report/index.html',
    testResults: 'test-results/',
  },
  qualityGate: status === 'passed' ? 'passed' : 'failed',
};

fs.writeFileSync(OUTPUT, JSON.stringify(summary, null, 2));
console.log(`[summary] status=${status} durationMs=${durationMs}`);
console.log(`[summary] Written to ${OUTPUT}`);
