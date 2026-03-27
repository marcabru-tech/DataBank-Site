import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("shows hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Dados que");
    await expect(page.getByText("Solicitar acesso antecipado")).toBeVisible();
  });

  test("shows feature grid", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Tudo que você precisa para decidir melhor")).toBeVisible();
    await expect(page.getByText("Tempo real")).toBeVisible();
  });

  test("lead form submits successfully", async ({ page }) => {
    await page.goto("/");
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="email"]', "test@e2e.com");
    await page.fill('textarea[name="use_case"]', "Testing the form");
    await page.route("/api/lead", (route) =>
      route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) })
    );
    await page.click('button[type="submit"]');
    await expect(page.getByRole("status")).toBeVisible({ timeout: 5000 });
  });
});
