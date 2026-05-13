import type { Page } from '@playwright/test';

export interface DomSnapshot {
  label: string;
  url: string;
  title: string;
  timestamp: string;
  headings: { tag: string; text: string }[];
  navigation: { text: string; href: string }[];
  buttons: { text: string }[];
  links: { text: string; href: string }[];
}

export async function extractSmartDom(page: Page, label: string): Promise<DomSnapshot> {
  const url = page.url();
  const title = await page.title();
  const timestamp = new Date().toISOString();

  const headings = await page.$$eval('h1, h2, h3, h4', (els) =>
    els
      .map((el) => ({ tag: el.tagName.toLowerCase(), text: (el.textContent ?? '').trim() }))
      .filter((h) => h.text.length > 0),
  );

  const navigation = await page.$$eval('nav a, header a', (els) =>
    (els as HTMLAnchorElement[])
      .map((el) => ({ text: (el.textContent ?? '').trim(), href: el.href }))
      .filter((n) => n.text.length > 0),
  );

  const buttons = await page.$$eval('button, [role="button"]', (els) =>
    (els as HTMLElement[])
      .map((el) => ({ text: (el.textContent ?? '').trim() }))
      .filter((b) => b.text.length > 0)
      .slice(0, 50),
  );

  const links = await page.$$eval('main a, section a, article a', (els) =>
    (els as HTMLAnchorElement[])
      .map((el) => ({ text: (el.textContent ?? '').trim(), href: el.href }))
      .filter((l) => l.text.length > 0 && l.href.length > 0)
      .slice(0, 60),
  );

  return { label, url, title, timestamp, headings, navigation, buttons, links };
}
