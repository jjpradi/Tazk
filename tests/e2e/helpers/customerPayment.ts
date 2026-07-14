import { Page, expect } from '@playwright/test';

/**
 * Navigate to Customer Receipts via the Sales sidebar menu.
 */
export async function goToCustomerReceipts(page: Page) {
  await expect(page.getByRole('button', { name: 'Sales' })).toBeVisible({ timeout: 30_000 });

  const salesBtn = page.getByRole('button', { name: 'Sales' });
  const receiptsLink = page.getByRole('link', { name: 'Customer Receipts' });

  if (!(await receiptsLink.isVisible().catch(() => false))) {
    await salesBtn.click();
  }
  await expect(receiptsLink).toBeVisible({ timeout: 10_000 });
  await receiptsLink.click();

  await expect(page.getByRole('heading', { name: /Customer Receipts/i })).toBeVisible({ timeout: 20_000 });
}
