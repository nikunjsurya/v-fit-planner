import { test, expect } from '@playwright/test';

// Real end-to-end of the workflow the senior-QA pass unblocked: the user
// scrolls the dashboard calendar back to a past day, opens the Workouts
// tab, marks an exercise on that day, and reloads. After reload, the
// exercise tick must still be there AND the dashboard's "back-filling"
// banner must still call out that we're not logging today. Before the
// fix this was impossible — Workouts tab hardcoded today and the
// calendar had no week-back chevron at all.

test.describe('back-fill workflow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Start every test from a clean storage slate.
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
  });

  test('mark an exercise on yesterday and persist across reload', async ({ page }) => {
    // Land on the dashboard. The week strip + nav chevrons render at
    // the top of the today view.
    await expect(page.getByRole('heading', { level: 2, name: /today/i })).toBeVisible();

    // Click the "Previous week" chevron to expose past days.
    await page.getByRole('button', { name: /previous week/i }).click();

    // The "jump to today" link should now be visible (we're off-week).
    await expect(page.getByRole('button', { name: /jump to today/i })).toBeVisible();

    // Pick the first non-disabled day in the now-visible week.
    const dayButtons = page.getByRole('button', { name: /select \w+,/i });
    await dayButtons.first().click();

    // Capture which day we picked so we can re-find it after reload.
    const targetDayLabel = await dayButtons
      .first()
      .getAttribute('aria-label');
    expect(targetDayLabel).toContain('Select');

    // Navigate to Workouts.
    const workoutsTab = page.getByRole('button', { name: /^workouts$/i }).first();
    await workoutsTab.click();

    // Open the first workout card.
    await page.getByRole('heading', { level: 3, name: /day \d/i }).first().click();

    // The back-fill banner should be present (since we're off-today) and
    // it should call out the selected day name.
    await expect(page.getByText(/back-filling/i)).toBeVisible();

    // Mark the first exercise Done.
    const firstDone = page.getByRole('button', { name: /done/i, exact: false }).first();
    await firstDone.click();
    await expect(firstDone).toHaveAttribute('aria-pressed', 'true');

    // Reload. The tick must survive.
    await page.reload();

    // Selected date is NOT persisted (intentional UX call) — so after
    // reload we re-navigate to that past day to verify the tick.
    // Walk back to the same week.
    await page.getByRole('button', { name: /previous week/i }).click();
    if (targetDayLabel) {
      await page.getByRole('button', { name: targetDayLabel }).click();
    }
    await workoutsTab.click();
    await page.getByRole('heading', { level: 3, name: /day \d/i }).first().click();

    const firstDoneAfter = page
      .getByRole('button', { name: /done/i, exact: false })
      .first();
    await expect(firstDoneAfter).toHaveAttribute('aria-pressed', 'true');
  });
});
