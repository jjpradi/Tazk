import { Page, expect } from '@playwright/test';

/**
 * Select a vendor in the Purchase Return form. MUI Autocomplete needs a
 * click-to-focus + fill-to-filter + option click.
 */
export async function selectVendor(page: Page, query: string, optionName: string) {
  const vendor = page.getByRole('combobox', { name: 'Vendor *' });
  await vendor.click();
  await vendor.fill(query);
  await page.getByRole('option', { name: optionName }).click();
  await expect(vendor).toHaveValue(optionName);
}

/**
 * Add a single opening-stock item to the return table. Clicks "+", opens the
 * product combobox, picks the first product in the list.
 */
export async function addOpeningStockItem(page: Page) {
  await page.getByRole('button', { name: 'Add item manually' }).click();
  const productCombo = page.getByRole('combobox', { name: 'Opening stock product' }).last();
  await productCombo.click();
  // Keyboard trigger is the most reliable way to force MUI Autocomplete to
  // open its listbox — a bare click on the input sometimes keeps it closed.
  await productCombo.press('ArrowDown');
  await page.getByRole('option').first().click();
  await expect(productCombo).not.toHaveValue('');
}
