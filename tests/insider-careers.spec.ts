import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { CareersPage } from '../pages/CareersPage';

test.describe('Insider Careers', () => {
  test('TC-01 to TC-08: full careers flow', async ({ page }) => {
    const home = new HomePage(page);
    const careers = new CareersPage(page);

    let leverJobsPage = page;
    let applicationPage = page;

    await test.step('Open home page', async () => {
      await home.goto();
      await home.acceptCookiesIfVisible();
      await home.verifyLoaded();
    });

    await test.step('Open careers page', async () => {
      await careers.goto();
      await home.acceptCookiesIfVisible();
      await careers.verifyLoaded();
    });

    await test.step('Select QA team and open Lever job list', async () => {
      await careers.clickSeeAllTeams();
      leverJobsPage = await careers.selectQualityAssurance();
    });

    await test.step('Validate QA job listings', async () => {
      await careers.waitForJobListings(leverJobsPage);
      await careers.verifyQualityAssuranceJobs(leverJobsPage);
    });

    await test.step('Apply and verify Lever application form', async () => {
      applicationPage = await careers.clickApply(leverJobsPage);

      await expect(applicationPage).toHaveURL(/jobs\.lever\.co\/insiderone\/.+/i);

      await expect(applicationPage.locator('body')).toContainText(
        /Apply|Submit application|Senior Software QA Engineer|Software Quality Assurance Engineer/i
      );
    });
  });

  test('Handles QA job list availability gracefully', async ({ page }) => {
    const home = new HomePage(page);
    const careers = new CareersPage(page);

    await home.goto();
    await home.acceptCookiesIfVisible();

    await careers.goto();
    await careers.clickSeeAllTeams();

    const leverJobsPage = await careers.selectQualityAssurance();
    const jobCards = leverJobsPage.locator('.posting');
    const count = await jobCards.count();

    if (count === 0) {
      console.warn('[edge-case] No QA jobs found');
      await expect(jobCards).toHaveCount(0);
      return;
    }

    console.log(`[edge-case] QA jobs found: ${count}`);
    await expect(jobCards.first()).toBeVisible();
  });
  
});