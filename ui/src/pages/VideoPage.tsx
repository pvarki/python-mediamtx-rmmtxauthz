import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Monitor, Play, Settings, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PRODUCT_SHORTNAME } from "@/App";
import { Button } from "@/components/ui/button";
import { ConnectionOptionsDialog } from "@/components/ConnectionOptionsDialog";
import { useStreams } from "@/hooks/useStreams";
import { useCredentials } from "@/hooks/useCredentials";
import {
  isStreamLive,
  parseStreamPath,
  streamPathToSlug,
} from "@/lib/stream-utils";

interface VideoPageProps {
  streamSlug: string;
}

export function VideoPage({ streamSlug }: VideoPageProps) {
  const { t } = useTranslation(PRODUCT_SHORTNAME);
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: streams = [], isLoading: streamsLoading } = useStreams();
  const { data: credentials, error: credentialsError } = useCredentials();

  const stream = useMemo(
    () => streams.find((s) => streamPathToSlug(s.path) === streamSlug),
    [streams, streamSlug],
  );

  const live = stream ? isStreamLive(stream.urls) : false;
  const streamPath = stream?.path ?? streamSlug.replaceAll("-", "/");
  const { name: streamName } = parseStreamPath(streamPath);

  const goBack = () => navigate({ to: "/" });

  const BackLink = () => (
    <button
      onClick={goBack}
      aria-label={t("video.backToStreams")}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      {t("video.backToStreams")}
    </button>
  );

  if (streamsLoading) {
    return (
      <div className="space-y-6" role="status" aria-busy="true">
        <div className="h-5 w-32 bg-muted animate-pulse rounded" />
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="aspect-video bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="space-y-6">
        <BackLink />
        <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center space-y-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground" />
          <p className="text-lg font-semibold text-foreground">
            {t("video.streamNotFound")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("video.streamNotFoundHint")}
          </p>
          <Button onClick={goBack}>{t("video.backToStreams")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={goBack}
        aria-label={t("video.backToStreams")}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("video.backToStreams")}
      </button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            {streamName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{streamPath}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
          <Settings className="w-4 h-4 mr-2" />
          {t("video.connectionOptions")}
        </Button>
      </div>

      <div
        className="w-full bg-muted rounded-lg overflow-hidden"
        style={{
          aspectRatio: "16/9",
          minHeight: "200px",
          maxHeight: "calc(100dvh - 14rem)",
        }}
      >
        {playing && stream.urls.hls ? (
          <iframe
            className="w-full h-full border-0 bg-black"
            src={stream.urls.hls}
            title={streamName}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : !live ? (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
            <Monitor className="w-12 h-12 text-muted-foreground" />
            <p className="text-foreground font-semibold">
              {t("video.streamOffline")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("video.streamOfflineHint")}
            </p>
          </div>
        ) : (
          <button
            onClick={() => setPlaying(true)}
            aria-label={t("video.play")}
            className="w-full h-full flex flex-col items-center justify-center space-y-3 cursor-pointer hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset transition-colors"
          >
            <Monitor className="w-12 h-12 text-muted-foreground" />
            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="w-8 h-8 text-primary-foreground ml-1" />
            </div>
            <p className="text-sm text-muted-foreground">{t("video.play")}</p>
          </button>
        )}
      </div>

      <ConnectionOptionsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        stream={stream}
        credentials={credentials ?? null}
        credentialsError={!!credentialsError}
      />
    </div>
  );
}
