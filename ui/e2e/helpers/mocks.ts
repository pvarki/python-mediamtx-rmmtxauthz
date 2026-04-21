import type { Page, Route } from "@playwright/test";

export type JsonMock = {
  url: string | RegExp;
  body: unknown;
  status?: number;
};

async function installJsonMocks(page: Page, mocks: JsonMock[]): Promise<void> {
  for (const mock of mocks) {
    await page.route(mock.url, async (route: Route) => {
      await route.fulfill({
        status: mock.status ?? 200,
        contentType: "application/json",
        body: JSON.stringify(mock.body),
      });
    });
  }
}

export type MtxMockOptions = {
  streams: unknown;
  credentials?: unknown;
  srtPasswords?: unknown;
};

const DEFAULT_CREDENTIALS = {
  username: "demo-user",
  password: "demo-pass", // pragma: allowlist secret
  stream_ro_password: "demo-ro", // pragma: allowlist secret
};

const DEFAULT_SRT_PASSWORDS = { publish: "demo-pub", read: "demo-read" };

export async function mockMtxStreams(
  page: Page,
  opts: MtxMockOptions,
): Promise<void> {
  await installJsonMocks(page, [
    { url: /\/proxy\/mtx\/api\/v1\/proxy\/streams$/, body: opts.streams },
    {
      url: /\/proxy\/mtx\/api\/v1\/proxy\/credentials$/,
      body: opts.credentials ?? DEFAULT_CREDENTIALS,
    },
    {
      url: /\/proxy\/mtx\/api\/v1\/proxy\/srt_default$/,
      body: opts.srtPasswords ?? DEFAULT_SRT_PASSWORDS,
    },
  ]);
}
