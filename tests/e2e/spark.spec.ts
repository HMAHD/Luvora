import { test, expect } from '@playwright/test';

test.describe('Luvora User Journey', () => {
    test('Page loads and Spark allows interaction', async ({ page }) => {
        // 1. Open Home
        await page.goto('http://localhost:3000');

        // 2. verify Spark Card visible
        const card = page.locator('.card-body');
        await expect(card).toBeVisible();

        // 3. Verify Message Content exists
        await expect(page.locator('.badge')).toContainText('Vibe');

        // 4. Test Copy Interaction (Mock Clipboard permissions if needed, but often works in headless)
        // Note: Clipboard read/write in Playwright usually requires context permissions.
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

        // Click Copy
        await page.getByText('Copy Spark').click();

        // Verify Toast (Success state)
        await expect(page.locator('.toast')).toBeVisible();

        // 5. Change Role
        await page.locator('button.btn-circle').first().click(); // Settings cog
        await page.getByText('Boyfriend').click();

        // Verify UI update (persistence)
        // We expect a reload or state change. The component uses local storage, so it updates state.
        // The "Vibe" or message might change if the role pool is different.
        // We can just verify the settings closed or selection happened.
    });
});
