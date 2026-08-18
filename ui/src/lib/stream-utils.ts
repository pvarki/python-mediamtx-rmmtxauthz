import { StreamConfig } from "@/model/stream-config";

export function isStreamLive(urls: StreamConfig["urls"]): boolean {
  return Object.values(urls).some((url) => url);
}

export function parseStreamPath(path: string) {
  const segments = path.split("/").filter(Boolean);
  return {
    name: segments[segments.length - 1] ?? path,
    category: segments.length > 1 ? segments.slice(0, -1).join(" / ") : null,
  };
}

export function streamPathToSlug(path: string): string {
  return path.replaceAll("/", "-");
}

const MTX_HOST_PREFIX = "mtx";

export function getStreamDomain(): string {
  const host = window.location.hostname.replace(/^mtls\./, "");
  return host.startsWith(`${MTX_HOST_PREFIX}.`)
    ? host
    : `${MTX_HOST_PREFIX}.${host}`;
}

export function maskStreamUrl(
  url: string,
  password: string,
  passphrase?: string,
): string {
  let masked = url.replaceAll(password, "***");
  if (passphrase) masked = masked.replaceAll(passphrase, "***");
  return masked;
}
