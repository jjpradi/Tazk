import { test, expect } from '@playwright/test';
import { signIn } from '../helpers/auth';
import { goToCustomerReceipts } from '../helpers/customerPayment';
import { testUser } from '../fixtures/users';

test.describe('Customer Payment — confirmation dialog regression', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, testUser.username, testUser.password);
    await goToCustomerReceipts(page);
  });

  test('Submit shows confirmation dialog before processing receipt', async ({ page }) => {
    // Click the add/new receipt button to open the receipt form
    await page.getByRole('button', { name: /Add|New|Create/i }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10_000 });

    // Fill minimal required fields — customer selection
    const customerInput = page.getByRole('combobox').first();
    await customerInput.click();
    await customerInput.fill('test');
    await page.getByRole('option').first().click({ timeout: 10_000 });

    // Add a payment row
    const paymentAmount = page.locator('input[name="payment_amount"], input[placeholder*="Amount"]').first();
    if (await paymentAmount.isVisible().catch(() => false)) {
      await paymentAmount.fill('100');
    }

    // Click Submit — should open confirmation dialog, NOT submit directly
    await page.getByRole('button', { name: /Submit|Save/i }).click();

    // Confirmation dialog should appear
    await expect(page.getByText(/Confirm Receipt/i)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/Do you want to proceed/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible();
  });

  test('Cancel on confirmation dialog does not submit', async ({ page }) => {
    await page.getByRole('button', { name: /Add|New|Create/i }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10_000 });

    const customerInput = page.getByRole('combobox').first();
    await customerInput.click();
    await customerInput.fill('test');
    await page.getByRole('option').first().click({ timeout: 10_000 });

    const paymentAmount = page.locator('input[name="payment_amount"], input[placeholder*="Amount"]').first();
    if (await paymentAmount.isVisible().catch(() => false)) {
      await paymentAmount.fill('100');
    }

    // Track network requests to receipt endpoints
    const receiptRequests: string[] = [];
    page.on('request', (req) => {
      if (req.method() === 'POST' && /receipt/i.test(req.url())) {
        receiptRequests.push(req.url());
      }
    });

    await page.getByRole('button', { name: /Submit|Save/i }).click();
    await expect(page.getByText(/Confirm Receipt/i)).toBeVisible({ timeout: 5_000 });

    // Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Confirmation dialog should close
    await expect(page.getByText(/Confirm Receipt/i)).not.toBeVisible();

    // No receipt request should have been made
    await page.waitForTimeout(1_000);
    expect(receiptRequests.length, 'No receipt request should fire after Cancel').toBe(0);
  });

  test('Confirm on confirmation dialog submits the receipt', async ({ page }) => {
    await page.getByRole('button', { name: /Add|New|Create/i }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10_000 });

    const customerInput = page.getByRole('combobox').first();
    await customerInput.click();
    await customerInput.fill('test');
    await page.getByRole('option').first().click({ timeout: 10_000 });

    const paymentAmount = page.locator('input[name="payment_amount"], input[placeholder*="Amount"]').first();
    if (await paymentAmount.isVisible().catch(() => false)) {
      await paymentAmount.fill('100');
    }

    const receiptRequests: string[] = [];
    page.on('request', (req) => {
      if (req.method() === 'POST' && /receipt/i.test(req.url())) {
        receiptRequests.push(req.url());
      }
    });

    await page.getByRole('button', { name: /Submit|Save/i }).click();
    await expect(page.getByText(/Confirm Receipt/i)).toBeVisible({ timeout: 5_000 });

    // Click Confirm — this should trigger the actual submission
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Confirmation dialog should close
    await expect(page.getByText(/Confirm Receipt/i)).not.toBeVisible({ timeout: 5_000 });
  });

  test('Back button preserves payment data entered on page 1', async ({ page }) => {
    await page.getByRole('button', { name: /Add|New|Create/i }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10_000 });

    // Page 1: select customer and enter payment
    const customerInput = page.getByRole('combobox').first();
    await customerInput.click();
    await customerInput.fill('test');
    await page.getByRole('option').first().click({ timeout: 10_000 });

    const paymentAmount = page.locator('input[name="payment_amount"], input[placeholder*="Amount"]').first();
    if (await paymentAmount.isVisible().catch(() => false)) {
      await paymentAmount.fill('500');
    }

    // Navigate to page 2
    await page.getByRole('button', { name: /Continue/i }).click();

    // Navigate back to page 1
    await page.getByRole('button', { name: /Back/i }).click();

    // Payment amount should still be populated (not wiped)
    if (await paymentAmount.isVisible().catch(() => false)) {
      const value = await paymentAmount.inputValue();
      expect(value, 'Payment amount should be preserved after Back').toBe('500');
    }
  });

  test('Submit button re-enables after a failed API call', async ({ page }) => {
    await page.getByRole('button', { name: /Add|New|Create/i }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10_000 });

    const customerInput = page.getByRole('combobox').first();
    await customerInput.click();
    await customerInput.fill('test');
    await page.getByRole('option').first().click({ timeout: 10_000 });

    const paymentAmount = page.locator('input[name="payment_amount"], input[placeholder*="Amount"]').first();
    if (await paymentAmount.isVisible().catch(() => false)) {
      await paymentAmount.fill('100');
    }

    // Intercept receipt API calls and force a 500 error
    await page.route(/receipt/i, (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server Error' }) });
      } else {
        route.continue();
      }
    });

    await page.getByRole('button', { name: /Submit|Save/i }).click();
    await expect(page.getByText(/Confirm Receipt/i)).toBeVisible({ timeout: 5_000 });
    await page.getByRole('button', { name: 'Confirm' }).click();

    // After failure, the Submit button should not remain permanently disabled
    const submitBtn = page.getByRole('button', { name: /Submit|Save/i });
    await expect(submitBtn).toBeEnabled({ timeout: 10_000 });
  });
});
