import { useTranslation } from "react-i18next";
import { PRODUCT_SHORTNAME } from "@/App";
import { useEffect, useMemo, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { DataTable } from "@/components/data-table";
import { getColumns, StreamItem } from "./Columns";
import { Link } from "@tanstack/react-router";

export const WatchPage = () => {
  const { t, i18n } = useTranslation(PRODUCT_SHORTNAME);

  const streamsUrl = "/api/v1/product/proxy/mtx/api/v1/proxy/streams";
  const [streams, setStreams] = useState([]);
  useEffect(() => {
    async function getStuff() {
      console.log(`Fetching streams from ${streamsUrl}`);
      const resp = await fetch(streamsUrl);
      setStreams(await resp.json());
    }
    getStuff();
  }, []);

  const cachedTableData: StreamItem[] = useMemo(
    () =>
      streams.map((stream: any) => ({
        path: stream["path"],
        url: Object.entries(stream["urls"]).map(([protocol, url]) => ({
          protocol,
          url,
        })),
      })),
    [streams],
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-center text-center">
        <div className="w-full max-w-xl space-y-4">
          <div>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    {/* @ts-ignore */}
                    <Link to="../">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Stream</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <p className="text-2xl font-bold">Watch Streams</p>
        </div>
      </div>
      <DataTable
        data={cachedTableData}
        columns={getColumns(t)}
        defaultSortKey="path"
      />
    </div>
  );
};
