export type FakeStreamConfig = {
  path: string;
  urls: {
    hls: string;
    webrtc: string;
    rtsps: string;
    rtmps: string;
    srt: string;
  };
};

export const FAKE_STREAM_PATH = "live/icu/alpha";
export const FAKE_STREAM_SLUG = "live-icu-alpha";
export const FAKE_STREAM_NAME = "alpha";
export const FAKE_HLS_URL = `https://fake.hls.local/${FAKE_STREAM_PATH}/index.m3u8`;

export const FAKE_STREAMS: FakeStreamConfig[] = [
  {
    path: FAKE_STREAM_PATH,
    urls: {
      hls: FAKE_HLS_URL,
      webrtc: `https://fake.webrtc.local/${FAKE_STREAM_PATH}`,
      rtsps: `rtsps://fake.rtsps.local:8322/${FAKE_STREAM_PATH}`,
      rtmps: `rtmps://fake.rtmps.local:1937/${FAKE_STREAM_PATH}`,
      srt: `srt://fake.srt.local:8890?streamid=read:${FAKE_STREAM_PATH}`,
    },
  },
];
