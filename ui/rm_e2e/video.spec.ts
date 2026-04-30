import { test, expect } from "@fixtures/admin";
import {
  gotoProductRoute,
  setLanguage,
  suppressProductOnboarding,
} from "@helpers/product";
import { mockMtxStreams } from "./helpers/mocks";
import {
  FAKE_STREAM_NAME,
  FAKE_STREAM_PATH,
  FAKE_STREAM_SLUG,
  FAKE_STREAMS,
} from "./fixtures/fake-streams";

test.describe("mtx video page (mocked streams)", () => {
  test.beforeEach(async ({ page }) => {
    await setLanguage(page, "en");
    await suppressProductOnboarding(page, "mtx");
    await mockMtxStreams(page, { streams: FAKE_STREAMS });
    await gotoProductRoute(page, "mtx");
  });

  test("grid renders the fake stream card", async ({ page }) => {
    const card = page.locator(`[data-stream-path="${FAKE_STREAM_PATH}"]`);
    await expect(page.getByTestId("stream-card")).toHaveCount(1);
    await expect(card).toBeVisible();
    await expect(page.getByTestId("stream-search-result-count")).toContainText(
      "1",
    );
  });

  test("clicking the card opens the video page for the fake stream", async ({
    page,
  }) => {
    await page.locator(`[data-stream-path="${FAKE_STREAM_PATH}"]`).click();

    await expect(page).toHaveURL(new RegExp(`/${FAKE_STREAM_SLUG}$`));
    await expect(page.getByTestId("video-page")).toBeVisible();
    await expect(page.getByTestId("video-stream-name")).toHaveText(
      FAKE_STREAM_NAME,
    );
    await expect(page.getByTestId("video-play-button")).toBeVisible();
    await expect(page.getByTestId("video-stream-offline")).toHaveCount(0);
  });

  test("back button returns to the grid", async ({ page }) => {
    await page.locator(`[data-stream-path="${FAKE_STREAM_PATH}"]`).click();
    await page.getByTestId("video-back-button").click();

    await expect(page.getByTestId("home-page")).toBeVisible();
  });

  test("connection options trigger opens the dialog", async ({ page }) => {
    await page.locator(`[data-stream-path="${FAKE_STREAM_PATH}"]`).click();
    await page.getByTestId("connection-options-trigger").click();

    await expect(page.getByTestId("connection-options-dialog")).toBeVisible();
  });
});
