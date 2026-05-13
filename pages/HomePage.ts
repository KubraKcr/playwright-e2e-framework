import { type Page, expect } from '@playwright/test';

export class HomePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/');
  }
async acceptCookiesIfVisible(): Promise<void> {
  try {
    const acceptButton = this.page.getByRole('button', {
      name: /accept/i
    });

    if (await acceptButton.isVisible({ timeout: 3000 })) {
      await acceptButton.click();
      console.log('[cookie] accepted');
    }
  } catch {
    console.log('[cookie] not shown');
  }
}
  async verifyLoaded(): Promise<void> {
    await expect(this.page).toHaveTitle(/Insider/);
    await expect(this.page.locator('h1')).toContainText('Customer Engagement');
    await expect(this.page.locator('nav')).toBeVisible();
  }
}
