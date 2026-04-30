import { test, expect } from "@fixtures/admin";
import {
  gotoProductRoute,
  setLanguage,
  suppressProductOnboarding,
} from "@helpers/product";

test.describe("broadcast wizard", () => {
  test.beforeEach(async ({ page }) => {
    await setLanguage(page, "en");
    await suppressProductOnboarding(page, "mtx");

    await gotoProductRoute(page, "mtx");
    await page.getByTestId("start-broadcast-button").click();
    await expect(page.getByTestId("broadcast-dialog")).toBeVisible();
  });

  test("selecting a tool shows its guide and back returns to the list", async ({
    page,
  }) => {
    await page.getByTestId("broadcast-tool-opentak_icu").click();

    const back = page.getByTestId("broadcast-wizard-back");
    await expect(back).toBeVisible();
    await expect(page.getByTestId("broadcast-tool-list")).toHaveCount(0);

    await back.click();

    await expect(page.getByTestId("broadcast-tool-list")).toBeVisible();
    await expect(page.getByTestId("broadcast-tool-opentak_icu")).toBeVisible();
  });
});
