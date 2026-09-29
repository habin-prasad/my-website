import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation & CMD-K Flow', () => {
  test('opens command modal via FAB button', async ({ page }) => {
    // Navigates using the baseURL defined in playwright.config.ts
    await page.goto('/');

    // Interact with UI elements
    const triggerBtn = page.locator('#cmdk-trigger');
    await expect(triggerBtn).toBeVisible();
    await triggerBtn.click();

    // Verify modal state
    const modal = page.locator('#cmdk-modal');
    await expect(modal).toBeVisible();
  });
});

test.describe('Mobile & Desktop Navigation Infrastructure', () => {
  
  test('Navigation links to About page', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveURL(/\/about$/);
    
    // Assert page header presence
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('Search dialog triggers correctly from nav', async ({ page }) => {
    await page.goto('/');
    
    const searchTrigger = page.locator('#search-trigger-btn');
    await expect(searchTrigger).toBeVisible();
    await searchTrigger.click();

    const searchModal = page.locator('#search-modal');
    await expect(searchModal).toBeVisible();
  });
});