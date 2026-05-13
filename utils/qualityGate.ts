import fs from 'fs';
import process from 'process';

const summaryPath = 'reports/execution-summary.json';

if (!fs.existsSync(summaryPath)) {
  console.error('❌ Quality Gate failed: summary not found');
  process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));

if (summary.status !== 'passed') {
  console.error(`❌ Quality Gate failed: status=${summary.status}`);
  process.exit(1);
}

console.log('✅ Quality Gate passed');