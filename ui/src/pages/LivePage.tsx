import { useTranslation } from "react-i18next";
import { PRODUCT_SHORTNAME } from "@/App";
import { useQuery } from "@tanstack/react-query";
import { StreamConfig } from "@/model/stream-config";
import { watchRoute } from "@/App";
import { ArrowLeftCircle, LucideCopy, LucideLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MouseEventHandler } from "react";
import { copyToClipboard } from "@/lib/clipboard";
import { Toaster } from "@/components/ui/sonner";
import { TFunction } from "i18next";

function getIconForProtocol(protocol: string): JSX.Element {
  switch (protocol) {
    case "hls":
      return <LucideLink />;
    case "webrtc":
      return <LucideLink />;
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
    case "hls":
      return () => window.open(url);
    case "webrtc":
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
  const stream = streams.find((item) => item.path === streamPath);
  console.log(JSON.stringify(stream));
  if (stream) {
    protocols = Object.entries(stream.urls).map(([protocol, url]) => (
      <Card className="p-4">
        <div className="flex flex-row justify-between items-center">
          <CardTitle>{protocol.toUpperCase()}</CardTitle>
          <Button
            onClick={getMouseEventHandlerForProtocol(protocol, url, t)}
            size="icon-lg"
          >
            {getIconForProtocol(protocol)}
          </Button>
        </div>
      </Card>
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
        <div className="w-full max-w-xl space-y-4"> {protocols} </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};
