import { test, expect } from "@fixtures/admin";
import {
  gotoProductRoute,
  setLanguage,
  suppressProductOnboarding,
} from "@helpers/product";

test.describe("mtx home page", () => {
  test.beforeEach(async ({ page }) => {
    await setLanguage(page, "en");
    await suppressProductOnboarding(page, "mtx");

    await gotoProductRoute(page, "mtx");
  });

  test("renders stream grid with search and broadcast controls", async ({
    page,
  }) => {
    await expect(page.getByTestId("home-page")).toBeVisible();
    await expect(page.getByTestId("home-loading")).toHaveCount(0);

    await expect(page.getByTestId("stream-search-input")).toBeVisible();
    await expect(page.getByTestId("stream-search-result-count")).toBeVisible();
    await expect(page.getByTestId("start-broadcast-button")).toBeVisible();
  });

  test("opens broadcast wizard from start broadcasting button", async ({
    page,
  }) => {
    await page.getByTestId("start-broadcast-button").click();

    await expect(page.getByTestId("broadcast-dialog")).toBeVisible();
    await expect(page.getByTestId("broadcast-tool-list")).toBeVisible();
    await expect(page.getByTestId("broadcast-tool-opentak_icu")).toBeVisible();
    await expect(page.getByTestId("broadcast-tool-gopro")).toBeVisible();
    await expect(page.getByTestId("broadcast-tool-uastool")).toBeVisible();
    await expect(page.getByTestId("broadcast-tool-advanced")).toBeVisible();
  });

  test("filters streams via search input", async ({ page }) => {
    await expect(page.getByTestId("home-page")).toBeVisible();

    const search = page.getByTestId("stream-search-input");
    await search.fill("__no_such_stream__");

    await expect(page.getByTestId("stream-card")).toHaveCount(0);
  });
});
