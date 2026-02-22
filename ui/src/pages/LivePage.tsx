import { useTranslation } from "react-i18next";
import { PRODUCT_SHORTNAME } from "@/App";
import { useQuery } from "@tanstack/react-query";
import { StreamConfig } from "@/model/stream-config";
import { watchRoute } from "@/App";
import {
  ArrowLeftCircle,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Globe,
  LucideCopy,
  LucideGlobe,
  LucidePlay,
  MonitorPlay,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MouseEventHandler, useState } from "react";
import { copyToClipboard } from "@/lib/clipboard";
import { Toaster } from "@/components/ui/sonner";
import { TFunction } from "i18next";
import { TranslatedText } from "@/components/translated-text";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import { useStreamPackages } from "@/hooks/useStreamPackages";

function getIconForProtocol(protocol: string): JSX.Element {
  switch (protocol) {
    case "browser":
      return <LucidePlay />;
    default:
      return <LucideCopy />;
  }
}

function getMouseEventHandlerForProtocol(
  protocol: string,
  url: string,
  t: TFunction,
): MouseEventHandler {
  switch (protocol) {
    case "browser":
      return () => window.open(url);
    default:
      return () => copyToClipboard(url, t("common.copied"));
  }
}

export const LivePage = () => {
  const { t } = useTranslation(PRODUCT_SHORTNAME);
  const STREAMS_URL = "/api/v1/product/proxy/mtx/api/v1/proxy/streams";

  const { protocol, callsign } = watchRoute.useParams();
  const streamPath = `/live/${protocol}/${callsign}`;

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const {
    data: streams = [],
    isLoading,
    error,
  } = useQuery<StreamConfig[]>({
    queryKey: ["streams"],
    queryFn: async () => {
      const resp = await fetch(STREAMS_URL);
      if (!resp.ok) throw new Error("Fetching Streams Failed");
      return resp.json();
    },
  });

  console.log(JSON.stringify(streams));
  var protocols: JSX.Element[] = [];
  var mediaPlayers: JSX.Element = <></>;
  const stream = streams.find((item) => item.path === streamPath);
  console.log(JSON.stringify(stream));
  if (stream) {
    mediaPlayers = (
      <>
        <Card className="p-4">
          <div className="flex flex-row justify-between items-center">
            <CardTitle className="gap-2 px-2 flex items-center">
              <LucideGlobe />
              <TranslatedText id="live.open_in_browser" />
            </CardTitle>
            <Button
              className="cursor-pointer"
              onClick={getMouseEventHandlerForProtocol(
                "browser",
                stream.urls.hls,
                t,
              )}
            >
              {getIconForProtocol("browser")}
            </Button>
          </div>
        </Card>
      </>
    );

    protocols = Object.entries(stream.urls).map(([protocol, url]) => (
      <div className="p-2 flex flex-row justify-between items-center">
        <p>{protocol.toUpperCase()}</p>
        <Button
          className="cursor-pointer"
          onClick={getMouseEventHandlerForProtocol(protocol, url, t)}
          size="icon-sm"
        >
          {getIconForProtocol(protocol)}
        </Button>
      </div>
    ));
  }

  return (
    <div className="flex justify-center text-center">
      <div className="w-full max-w-xl space-y-4">
        <div className="flex flex-row items-center gap-4">
          <Link to="/">
            <ArrowLeftCircle className="size-8" />
          </Link>
          <p className="text-2xl font-bold">{streamPath}</p>
        </div>
        {mediaPlayers}
        {/*<StreamPackageDropdown streamPath={streamPath} />*/}

        <div className="items-center justify-between font-semibold mt-8 border rounded-lg text-left">
          <div
            className="flex flex-row items-center justify-between border-0 m-0 rounded-lg p-4 cursor-pointer"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          >
            <TranslatedText id="stream.advanced_links" className="text-left" />
            <Button
              variant="ghost"
              className="flex items-center font-semibold text-lg cursor-pointer p-0 w-9"
              onClick={(e) => {
                e.stopPropagation();
                setIsAdvancedOpen(!isAdvancedOpen);
              }}
            >
              {isAdvancedOpen ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </div>
          {isAdvancedOpen && <div className="p-4">{protocols}</div>}
        </div>
      </div>
      <Toaster position="top-center" />
      <OnboardingGuide />
    </div>
  );
};

interface StreamPackageDropdownProps {
  streamPath: string;
}

function StreamPackageDropdown({ streamPath }: StreamPackageDropdownProps) {
  const [isStreamPackagesOpen, setIsStreamPackagesOpen] = useState(false);

  const {
    downloadAtakRtmps,
    downloadBrowserHls,
    downloadVlcSrt,
    downloadVlcHls,
  } = useStreamPackages(streamPath);

  return (
    <div className="items-center justify-between font-semibold mt-8 border rounded-lg text-left">
      <div
        className="flex flex-row items-center justify-between border-0 m-0 rounded-lg p-4 cursor-pointer"
        onClick={() => setIsStreamPackagesOpen(!isStreamPackagesOpen)}
      >
        <TranslatedText id="stream.stream_packages" className="text-left" />
        <Button
          variant="ghost"
          className="flex items-center font-semibold text-lg cursor-pointer p-0 w-9"
          onClick={(e) => {
            e.stopPropagation();
            setIsStreamPackagesOpen(!isStreamPackagesOpen);
          }}
        >
          {isStreamPackagesOpen ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </div>
      {isStreamPackagesOpen && (
        <div className="grid grid-cols-2 gap-4 p-4 pt-0">
          <Button
            className="cursor-pointer h-auto py-4 whitespace-normal wrap-break-word flex flex-col items-center gap-2"
            onClick={downloadAtakRtmps}
          >
            <Crosshair className="size-6" />
            <TranslatedText id="stream.download_atak_rtmps" />
          </Button>
          <Button
            className="cursor-pointer h-auto py-4 whitespace-normal wrap-break-word flex flex-col items-center gap-2"
            onClick={downloadBrowserHls}
          >
            <Globe className="size-6" />
            <TranslatedText id="stream.download_browser_hls" />
          </Button>
          <Button
            className="cursor-pointer h-auto py-4 whitespace-normal wrap-break-word flex flex-col items-center gap-2"
            onClick={downloadVlcSrt}
          >
            <MonitorPlay className="size-6" />
            <TranslatedText id="stream.download_vlc_srt" />
          </Button>
          <Button
            className="cursor-pointer h-auto py-4 whitespace-normal wrap-break-word flex flex-col items-center gap-2"
            onClick={downloadVlcHls}
          >
            <MonitorPlay className="size-6" />
            <TranslatedText id="stream.download_vlc_hls" />
          </Button>
        </div>
      )}
    </div>
  );
}
