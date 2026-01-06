import { useTranslation } from "react-i18next";
import { PRODUCT_SHORTNAME } from "@/App";
import { useQuery } from "@tanstack/react-query";
import { StreamConfig } from "@/model/stream-config";
import { watchRoute } from "@/App";
import {
  ArrowLeftCircle,
  ChevronDown,
  ChevronUp,
  LucideCopy,
  LucideGlobe,
  LucideLink,
  LucidePlay
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MouseEventHandler, useState } from "react";
import { copyToClipboard } from "@/lib/clipboard";
import { Toaster } from "@/components/ui/sonner";
import { TFunction } from "i18next";
import { TranslatedText } from "@/components/translated-text";

function getIconForProtocol(protocol: string): JSX.Element {
  switch (protocol) {
    case "browser":
      return <LucidePlay/>
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

  const [isAdvancedOpen,setIsAdvancedOpen] = useState(false);

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
            <CardTitle className="gap-2 px-2 flex items-center"><LucideGlobe/> Open in Browser</CardTitle>
            <Button className="cursor-pointer" onClick={getMouseEventHandlerForProtocol("browser", stream.urls.hls, t)}
              >{getIconForProtocol("browser")}</Button>
          </div>
          </Card>
      </>
 
    )

    protocols = Object.entries(stream.urls).map(([protocol, url]) => (
        <div className="p-2 flex flex-row justify-between items-center">
          <p>{protocol.toUpperCase()}</p>
          <Button
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
        <div className="mt-8 border rounded-lg p-4 text-left">
                <button
                  className="flex items-center justify-between w-full font-semibold text-lg"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                >
                  <TranslatedText id="stream.advanced_links" className="text-left"/>
                  {isAdvancedOpen ? <ChevronUp /> : <ChevronDown />}
                </button>

                {isAdvancedOpen && (
                    protocols
                  )
                }
              </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};
