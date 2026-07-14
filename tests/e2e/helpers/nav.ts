import { Page, expect } from '@playwright/test';

/**
 * Navigate to Debit Notes. A direct `page.goto('/sales/DebitNotes')` races
 * auth bootstrap and gets redirected to /common/home, so we expand the
 * Purchases submenu from the sidebar and click the Debit Notes link — same
 * path a real user takes.
 */
export async function goToDebitNotes(page: Page) {
  // Wait for the app shell (login just landed us on /common/home).
  await expect(page.getByRole('button', { name: 'Purchases' })).toBeVisible({ timeout: 30_000 });

  // Purchases is collapsible. Click it until the Debit Notes link is in the DOM.
  const purchasesBtn = page.getByRole('button', { name: 'Purchases' });
  const debitNotesLink = page.getByRole('link', { name: 'Debit Notes' });

  if (!(await debitNotesLink.isVisible().catch(() => false))) {
    await purchasesBtn.click();
  }
  await expect(debitNotesLink).toBeVisible({ timeout: 10_000 });
  await debitNotesLink.click();

  await expect(page).toHaveURL(/\/sales\/DebitNotes/);
  await expect(page.getByRole('heading', { name: 'Debit Notes' })).toBeVisible({ timeout: 20_000 });
}
