import { test, expect } from '@playwright/test';
import { signIn } from '../helpers/auth';
import { goToDebitNotes } from '../helpers/nav';
import { selectVendor, addOpeningStockItem } from '../helpers/purchaseReturn';
import { testUser } from '../fixtures/users';

test.describe('Purchase Return — regression', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, testUser.username, testUser.password);
    await goToDebitNotes(page);
    await page.getByRole('button', { name: 'Add Purchase Return' }).click();
    await expect(page.getByRole('heading', { name: 'Purchase Return' })).toBeVisible();
  });

  test('happy path: opening-stock return creates a debit note + PDF', async ({ page }) => {
    await selectVendor(page, 'Fangs', 'Fangs Technology Pvt Ltd');
    await page.getByRole('textbox', { name: 'Reference' }).fill('E2E-SPEC-REF');
    await page.getByRole('textbox', { name: 'Comments' }).fill('Automated regression spec');
    await addOpeningStockItem(page);

    await page.getByRole('button', { name: 'Return', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Confirm Purchase Return' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirm Return' }).click();

    // Success: PDF preview dialog renders
    await expect(page.locator('[role="dialog"] iframe').first()).toBeVisible({ timeout: 30_000 });
  });

  test('validation: Return button disabled until an item row is added', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Return', exact: true })).toBeDisabled();
  });

  test('validation: future return date is rejected', async ({ page }) => {
    await selectVendor(page, 'Fangs', 'Fangs Technology Pvt Ltd');
    await addOpeningStockItem(page);

    const dateInput = page.getByRole('textbox', { name: 'Return Date' });
    await dateInput.fill('12/31/2099');
    await dateInput.blur();

    await page.getByRole('button', { name: 'Return', exact: true }).click();
    await expect(page.getByText(/Return Date cannot be in the future/i)).toBeVisible();
  });

  test('race-safety: rapid triple-click on Confirm Return creates only one DN', async ({ page }) => {
    await selectVendor(page, 'Fangs', 'Fangs Technology Pvt Ltd');
    await page.getByRole('textbox', { name: 'Reference' }).fill('E2E-RACE-TEST');
    await addOpeningStockItem(page);

    await page.getByRole('button', { name: 'Return', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Confirm Purchase Return' })).toBeVisible();

    // Count PUTs to the purchase-return endpoint.
    const returnRequests: string[] = [];
    page.on('request', (req) => {
      if (req.method() === 'PUT' && /\/purchase\/return\//.test(req.url())) {
        returnRequests.push(req.url());
      }
    });

    // Fire three synchronous clicks through the DOM — tighter than dblclick().
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find((b) => b.textContent?.trim() === 'Confirm Return') as HTMLButtonElement | undefined;
      btn?.click();
      btn?.click();
      btn?.click();
    });

    // Let the request settle.
    await page.waitForTimeout(3_000);
    expect(returnRequests.length, 'Exactly one purchase-return POST should reach the backend').toBe(1);
  });
});
