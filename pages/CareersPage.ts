import { type Page, type BrowserContext, type Locator, expect } from '@playwright/test';

export class CareersPage {
  readonly jobCards: Locator;

  constructor(private readonly page: Page) {
    this.jobCards = page.locator('.posting');
  }

  async goto(): Promise<void> {
    await this.page.goto('/careers/#open-roles');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyLoaded(): Promise<void> {
    await expect(this.page).toHaveTitle(/Careers/i);
    await expect(this.page.locator('h1')).toContainText('Ready to disrupt');
    await expect(
      this.page.getByRole('heading', { name: /Explore open roles/i })
    ).toBeVisible();
  }

async clickSeeAllTeams(): Promise<void> {
  await this.page.getByRole('heading', { name: /Explore open roles/i }).scrollIntoViewIfNeeded();

  const seeMoreCandidates = [
    this.page.getByRole('link', { name: /See all teams /i }),
    this.page.getByRole('button', { name: /See all teams /i }),
    this.page.getByText(/See all teams /i)
  ];

  for (const candidate of seeMoreCandidates) {
    if (await candidate.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await candidate.first().scrollIntoViewIfNeeded();
      await candidate.first().click();
      console.log('[success] See More clicked');
      return;
    }
  }

  console.log('[info] See More not found');
}

 async selectQualityAssurance(): Promise<Page> {
  console.log('[step] Selecting Quality Assurance');

  const qaOpenPositionsLink = this.page
    .locator('a[href*="team=Quality%20Assurance"]')
    .first();

  await qaOpenPositionsLink.scrollIntoViewIfNeeded();
  await expect(qaOpenPositionsLink).toBeVisible({ timeout: 10000 });

  const href = await qaOpenPositionsLink.getAttribute('href');

  if (!href) {
    throw new Error('Quality Assurance open positions link href not found');
  }

  await this.page.goto(href);
  await this.page.waitForLoadState('domcontentloaded');
  await this.dismissLeverCookiesIfVisible(this.page);

  return this.page;
}
  async dismissLeverCookiesIfVisible(targetPage: Page = this.page): Promise<void> {
    const dismissButton = targetPage.getByRole('button', { name: /dismiss/i });

    if (await dismissButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dismissButton.click();
      console.log('[cookie] Lever cookie dismissed');
    }
  }

  async waitForJobListings(targetPage: Page = this.page): Promise<void> {
    await targetPage.locator('.posting').first().waitFor({
      state: 'visible',
      timeout: 15000
    });
  }

  async verifyQualityAssuranceJobs(targetPage: Page = this.page): Promise<void> {
    const jobCards = targetPage.locator('.posting');

    await expect(
      targetPage.getByRole('button', { name: /Quality Assurance/i })
    ).toBeVisible();

    const count = await jobCards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const card = jobCards.nth(i);
      const title = await card.locator('h5').innerText();

      expect(title).toMatch(/QA|Quality Assurance/i);
    }

    const istanbulJobs = await jobCards.filter({ hasText: /Istanbul/i }).count();
    expect(istanbulJobs).toBeGreaterThan(0);
  }

async clickApply(targetPage: Page): Promise<Page> {
  const qaIstanbulJob = targetPage
    .locator('.posting')
    .filter({
      hasText: /Quality Assurance|QA/i
    })
    .filter({
      hasText: /Istanbul/i
    })
    .first();

  const applyLink = qaIstanbulJob.getByRole('link', { name: /^Apply$/i });

  await expect(applyLink).toBeVisible();

  const href = await applyLink.getAttribute('href');
  if (!href) throw new Error('Apply link not found');

  await targetPage.goto(href);
  return targetPage;
}
}