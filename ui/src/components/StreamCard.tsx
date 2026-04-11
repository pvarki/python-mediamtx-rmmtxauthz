import { Monitor } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StreamConfig } from "@/model/stream-config";
import { parseStreamPath } from "@/lib/stream-utils";

interface StreamCardProps {
  stream: StreamConfig;
  onClick: () => void;
}

export function StreamCard({ stream, onClick }: StreamCardProps) {
  const { name, category } = parseStreamPath(stream.path);
  const availableProtocols = Object.entries(stream.urls)
    .filter(([, url]) => url)
    .map(([protocol]) => protocol.toUpperCase());

  return (
    <button
      onClick={onClick}
      className="text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
    >
      <Card className="overflow-hidden hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300 py-0">
        <div className="aspect-video bg-muted flex items-center justify-center">
          <Monitor className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="px-3 py-2">
          <p className="font-semibold text-foreground text-sm truncate">
            {name}
          </p>
          {category && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {category}
            </p>
          )}
          <div className="flex gap-1 mt-2 flex-wrap">
            {availableProtocols.map((protocol) => (
              <span
                key={protocol}
                className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
              >
                {protocol}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </button>
  );
}
