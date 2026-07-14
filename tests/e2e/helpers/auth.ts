import { Page, expect } from '@playwright/test';

export async function signIn(page: Page, username: string, password: string) {
  await page.goto('/signin');
  await page.getByRole('textbox', { name: 'User Name' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await Promise.all([
    // Wait for the post-login redirect regardless of how many services the
    // login call cascades through. Vite cold-compile + auth cascade can take
    // a while on the first spec of a run.
    page.waitForURL(/\/common\/home/, { timeout: 60_000 }),
    page.getByRole('button', { name: 'Sign In' }).click(),
  ]);
  await expect(page).toHaveURL(/\/common\/home/);
}
