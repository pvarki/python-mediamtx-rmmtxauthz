import { useTranslation } from "react-i18next";
import { PRODUCT_SHORTNAME } from "@/App";
import { useMemo, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link as LucideLink, Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { StreamConfig } from "@/model/stream-config";
import { TranslatedText } from "./translated-text";

export const StreamList = () => {
  // TODO: Add Pagination
  const { t } = useTranslation(PRODUCT_SHORTNAME);
  const STREAMS_URL = "/api/v1/product/proxy/mtx/api/v1/proxy/streams";
  const [search, setSearch] = useState("");

  const {
    data: streams = [],
    isLoading,
    error,
  } = useQuery<StreamConfig[]>({
    queryKey: ["streams"],
    queryFn: async () => {
      const resp = await fetch(STREAMS_URL);
      if (!resp.ok) throw new Error("Network response was not ok");
      return resp.json();
    },
  });

  const filteredData = useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return streams;
    return streams.filter((item) => {
      const pathMatch = item.path.toLowerCase().includes(s);
      return pathMatch;
    });
  }, [search, streams]);

  if (isLoading)
    return (
      <div className="text-center">
        <TranslatedText id="home.loading" />
      </div>
    );
  if (error)
    return (
      <div className="text-center">
        <TranslatedText id="home.error_loading_streams" className="" />
      </div>
    );

  const streamListComponents = filteredData.map((item) => {
    const callsign = item.path.split("/")[3] ?? "unknown";
    return (
      <Link className="flex-1" to={item.path}>
        <Card
          key={item.path}
          className="flex flex-col gap-3 p-4 hover:border-primary hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-card transition-all duration-300"
        >
          <CardTitle className="text-lg">{item.path}</CardTitle>
          <div className="flex flex-row space-x-4 justify-between">
            <CardDescription>{t("home.started_by") + callsign}</CardDescription>
            {item.urls.hls && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  window.open(item.urls.hls);
                }}
                size="icon-lg"
              >
                <LucideLink />
              </Button>
            )}
          </div>
        </Card>
      </Link>
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-row gap-4 items-center">
        <InputGroup>
          <InputGroupInput
            placeholder={t("home.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            {filteredData.length}{" "}
            {filteredData.length == 1 ? t("home.result") : t("home.results")}
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="flex flex-col space-y-4">{streamListComponents}</div>
    </div>
  );
};
