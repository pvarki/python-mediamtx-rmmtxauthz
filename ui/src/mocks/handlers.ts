import { http, HttpResponse } from "msw";

const MOCK_DOMAIN = "demo.pvarki.fi";
const RICKROLL_HLS = "https://www.youtube.com/watch?v=xvFZjo5PgG0";

const mockStreams = [
  {
    path: "/live/hls/fighter420",
    urls: {
      hls: RICKROLL_HLS,
      webrtc: `wss://${MOCK_DOMAIN}/live/webrtc/fighter420`,
      rtsps: `rtsps://${MOCK_DOMAIN}:8322/live/hls/fighter420`,
      rtmps: `rtmps://${MOCK_DOMAIN}:1936/live/hls/fighter420`,
      srt: `srt://${MOCK_DOMAIN}:8890?streamid=read:live/hls/fighter420`,
    },
  },
  {
    path: "/live/hls/drone-recon",
    urls: {
      hls: RICKROLL_HLS,
      webrtc: `wss://${MOCK_DOMAIN}/live/webrtc/drone-recon`,
      rtsps: `rtsps://${MOCK_DOMAIN}:8322/live/hls/drone-recon`,
      rtmps: `rtmps://${MOCK_DOMAIN}:1936/live/hls/drone-recon`,
      srt: `srt://${MOCK_DOMAIN}:8890?streamid=read:live/hls/drone-recon`,
    },
  },
];

export const handlers = [
  // Stream listing — matched by the proxy path used in production
  http.get("/api/v1/product/proxy/mtx/api/v1/proxy/streams", () => {
    return HttpResponse.json(mockStreams);
  }),

  // Credentials — matched by the proxy path used in production
  http.get("/api/v1/product/proxy/mtx/api/v1/proxy/credentials", () => {
    return HttpResponse.json({
      username: "mokkamasteri",
      password: "M0ck_P4ssw0rd!",
    });
  }),

  // Also handle legacy/direct paths (used when running standalone)
  http.get("/api/v1/mediamtx/streams", () => {
    return HttpResponse.json(mockStreams);
  }),

  http.get("/api/v1/direct/*", () => {
    return HttpResponse.json({
      username: "mokkamasteri",
      password: "M0ck_P4ssw0rd!",
    });
  }),

  http.get("/api/v1/proxy/*", () => {
    return HttpResponse.json({
      username: "mokkamasteri",
      password: "M0ck_P4ssw0rd!",
    });
  }),

  // Product description
  http.get("/api/v2/descriptions/:language", ({ params }) => {
    const lang = (params.language as string) || "en";
    const descriptions: Record<string, object> = {
      en: {
        shortname: "mtx",
        title: "MTX: MediaMTX",
        description: "Video streaming service",
        component: { type: "component", ref: "mtx" },
      },
      fi: {
        shortname: "mtx",
        title: "MTX: MediaMTX",
        description: "Videon suoratoistopalvelu",
        component: { type: "component", ref: "mtx" },
      },
      sv: {
        shortname: "mtx",
        title: "MTX: MediaMTX",
        description: "Videoströmningstjänst",
        component: { type: "component", ref: "mtx" },
      },
    };
    return HttpResponse.json(descriptions[lang] || descriptions["en"]);
  }),

  // Instructions data
  http.get("/api/v2/instructions/data/mtx", () => {
    return HttpResponse.json({
      streams: mockStreams,
    });
  }),

  // Health check
  http.get("/api/v1/healthcheck", () => {
    return HttpResponse.json({
      dns: MOCK_DOMAIN,
      version: "mock-2.0.0",
      deployment: "MOCK DEMO",
    });
  }),
];
