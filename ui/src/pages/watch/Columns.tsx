import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, Video, Link, TrafficCone, Copy, SquareArrowOutUpRight } from "lucide-react";
import { JSX, useState } from "react";
import { TFunction } from "i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type StreamItem = {
  path: string
  url: { protocol: string; url: unknown; }[];
};

export const getColumns = (t: TFunction): ColumnDef<StreamItem>[] => [
  {
    accessorKey: "path",
    header: ({ column }): JSX.Element => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Path
        {column.getIsSorted() === "asc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
  },
  {
    accessorKey: "url",
    header: "Protocol",
    cell: ({ getValue }) => {
      const urls = getValue() as { protocol: string; url: string; }[];
      const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
      const [copyMessage, setCopyMessage] = useState<string | null>(null);

      const selectedUrlObj = urls.find(u => u.protocol === selectedProtocol);

      const handleClick = () => {
        if (!selectedUrlObj) return;

        if (selectedUrlObj.protocol === "hls" || selectedUrlObj.protocol === "webrtc") {
          window.open(selectedUrlObj.url as string, "_blank");
        } else {
          // TODO: Add display label when copying
          navigator.clipboard.writeText(selectedUrlObj.url as string)
            .then(() => {
              setCopyMessage("Copied!");
              setTimeout(() => setCopyMessage(null), 1500); // auto-hide after 1.5s
            })
            .catch(() => {
              setCopyMessage("Failed to copy");
              setTimeout(() => setCopyMessage(null), 1500);
            });

        }
      };

      return (
        <div className="flex flex-col space-y-1">
          <Select onValueChange={setSelectedProtocol}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Protocol" />
            </SelectTrigger>
            <SelectContent>
              {urls.map(item => (
                <SelectItem key={item.protocol} value={item.protocol}>
                  {item.protocol === "hls" && <Link />}
                  {item.protocol === "webrtc" && <Link />}
                  {item.protocol === "rtsps" && <Video />}
                  {item.protocol === "rtmps" && <Video />}
                  {item.protocol === "srt" && <TrafficCone />}
                  {item.protocol.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleClick}
            disabled={!selectedProtocol}
          >
            {selectedProtocol === "hls" && <SquareArrowOutUpRight />}
            {selectedProtocol === "webrtc" && <SquareArrowOutUpRight />}
            {selectedProtocol === "rtsps" && <Copy />}
            {selectedProtocol === "rtmps" && <Copy />}
            {selectedProtocol === "srt" && <Copy />}
          </Button>
        </div>
      );
    },
  }
];
