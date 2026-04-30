import path from "node:path";
import { test, expect } from "@fixtures/admin";
import type { TestInfo } from "@playwright/test";
import {
  SCREENSHOTS_ENABLED,
  THEME,
  SCREENSHOT_LANGUAGES,
  SCREENSHOT_DIR,
  captureFullPage,
} from "@helpers/screenshots";
import {
  gotoProductRoute,
  setLanguage,
  suppressProductOnboarding,
} from "@helpers/product";
import { mockMtxStreams } from "./helpers/mocks";
import { FAKE_STREAM_PATH, FAKE_STREAMS } from "./fixtures/fake-streams";

const screenshotPath = (testInfo: TestInfo, lang: string, name: string) =>
  path.join(SCREENSHOT_DIR, THEME, testInfo.project.name, lang, `${name}.png`);

test.describe("screenshots (mocked)", () => {
  test.skip(!SCREENSHOTS_ENABLED, "set SCREENSHOTS=1 to capture screenshots");

  for (const lang of SCREENSHOT_LANGUAGES) {
    test.describe(`language: ${lang}`, () => {
      test("stream page screenshots", async ({ page }, testInfo) => {
        await setLanguage(page, lang);
        await suppressProductOnboarding(page, "mtx");
        await mockMtxStreams(page, { streams: FAKE_STREAMS });

        await gotoProductRoute(page, "mtx");
        await expect(page.getByTestId("home-page")).toBeVisible();
        await expect(page.getByTestId("stream-card")).toHaveCount(1);

        await captureFullPage(
          page,
          screenshotPath(testInfo, lang, "home-mocked"),
        );

        await page.locator(`[data-stream-path="${FAKE_STREAM_PATH}"]`).click();
        await expect(page.getByTestId("video-page")).toBeVisible();
        await expect(page.getByTestId("video-play-button")).toBeVisible();

        await captureFullPage(
          page,
          screenshotPath(testInfo, lang, "video-live-idle"),
        );

        await page.getByTestId("connection-options-trigger").click();
        await expect(
          page.getByTestId("connection-options-dialog"),
        ).toBeVisible();

        await captureFullPage(
          page,
          screenshotPath(testInfo, lang, "video-connection-options"),
        );
      });
    });
  }
});
