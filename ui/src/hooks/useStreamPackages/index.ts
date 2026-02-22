import { useCallback, useEffect, useMemo, useState } from "react";
import {
  StreamPackageParams,
  getAtakRtmps,
  getBrowserHls,
  getVlcHls,
  getVlcSrt,
} from "./packages";

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function sanitizeFilename(streamPath: string) {
  return streamPath.replace(/^\//, "").replace(/\//g, "_");
}

export function useStreamPackages(streamPath: string) {
  const currentDomain = useMemo(
    () => window.location.hostname.replace(/^mtls./, ""),
    [],
  );
  const [credentials, setCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    async function fetchCredentials() {
      const response = await fetch(
        "/api/v1/product/proxy/mtx/api/v1/proxy/credentials",
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data: { username: string; password: string } =
        await response.json();
      setCredentials(data);
    }

    fetchCredentials();
  }, []);

  const params: StreamPackageParams | null = credentials
    ? {
        streamPath,
        currentDomain,
        username: credentials.username,
        password: credentials.password,
      }
    : null;

  const downloadAtakRtmps = useCallback(() => {
    if (!params) return;
    const content = getAtakRtmps(params);
    const filename = `atak-rtmps-${sanitizeFilename(params.streamPath)}.xml`;
    downloadFile(content, filename, "application/xml");
  }, [params]);

  const downloadBrowserHls = useCallback(() => {
    if (!params) return;
    const content = getBrowserHls(params);
    const filename = `browser-hls-${sanitizeFilename(params.streamPath)}.htm`;
    downloadFile(content, filename, "text/html");
  }, [params]);

  const downloadVlcSrt = useCallback(() => {
    if (!params) return;
    const content = getVlcSrt(params);
    const filename = `vlc-srt-${sanitizeFilename(params.streamPath)}.m3u`;
    downloadFile(content, filename, "application/xml");
  }, [params]);

  const downloadVlcHls = useCallback(() => {
    if (!params) return;
    const content = getVlcHls(params);
    const filename = `vlc-hls-${sanitizeFilename(params.streamPath)}.m3u8`;
    downloadFile(content, filename, "text/html");
  }, [params]);

  return {
    downloadAtakRtmps,
    downloadBrowserHls,
    downloadVlcHls,
    downloadVlcSrt,
    ready: params !== null,
  };
}
