import { test, expect } from '@playwright/test'

test.describe('Side Panel UI', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to sidepanel
    await page.goto('chrome-extension://test-id/sidepanel.html')
  })

  test('should display search bar', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]')
    await expect(searchInput).toBeVisible()
  })

  test('should create new memo', async ({ page }) => {
    const addButton = page.locator('[data-testid="add-memo-button"]')
    await addButton.click()

    const editor = page.locator('[data-testid="memo-editor"]')
    await expect(editor).toBeVisible()

    await editor.fill('Test memo content')

    const saveButton = page.locator('[data-testid="save-button"]')
    await saveButton.click()

    const memoCard = page.locator('[data-testid="memo-card"]')
    await expect(memoCard).toContainText('Test memo content')
  })
})
