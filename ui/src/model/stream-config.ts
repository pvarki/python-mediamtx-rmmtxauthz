export type StreamConfig = {
  path: string;
  urls: {
    hls: string;
    webrtc: string;
    rtsps: string;
    rtmps: string;
    srt: string;
  };
};
