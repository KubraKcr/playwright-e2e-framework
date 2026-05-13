import { chromium, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { extractSmartDom, type DomSnapshot } from '../utils/smartDomExtractor';

const SCREENSHOTS = path.join(__dirname, '../evidence/screenshots');
const OUTPUT = path.join(__dirname, '../explore-output');

async function capture(page: Page, label: string, url: string): Promise<DomSnapshot> {
  console.log(`[explore] ${label} → ${url}`);

  await page.goto(url, { waitUntil: 'load', timeout: 30_000 });
  await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});

  const snapshot = await extractSmartDom(page, label);
  fs.writeFileSync(path.join(OUTPUT, `${label}-dom.json`), JSON.stringify(snapshot, null, 2));
  await page.screenshot({ path: path.join(SCREENSHOTS, `${label}-page.png`), fullPage: true });

  console.log(`  → ${label}-dom.json, ${label}-page.png`);
  return snapshot;
}

async function main(): Promise<void> {
  fs.mkdirSync(SCREENSHOTS, { recursive: true });
  fs.mkdirSync(OUTPUT, { recursive: true });

  const browser = await chromium.launch({ headless: false , slowMo: 300 });
  
  const page = await browser.newPage();

  try {
    const home = await capture(page, 'home', 'https://insiderone.com/');
    const careers = await capture(page, 'careers', 'https://insiderone.com/careers/#open-roles');

    const metadata = {
      visitedUrls: [home.url, careers.url],
      screenshots: ['home-page.png', 'careers-page.png'],
      jsonOutputs: ['home-dom.json', 'careers-dom.json'],
      totalHeadings: home.headings.length + careers.headings.length,
      totalButtons: home.buttons.length + careers.buttons.length,
      totalLinks: home.links.length + careers.links.length,
      createdAt: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(OUTPUT, 'metadata.json'), JSON.stringify(metadata, null, 2));
    console.log('  → metadata.json');

    console.log('[explore] Done.');
  } catch (err) {
    console.error('[explore] Failed:', err);
    await page.screenshot({ path: path.join(SCREENSHOTS, 'explore-error.png') }).catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
