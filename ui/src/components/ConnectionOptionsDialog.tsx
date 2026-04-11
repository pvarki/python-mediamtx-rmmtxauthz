import { useState } from "react";
import {
  Copy,
  Eye,
  EyeClosed,
  ChevronDown,
  ChevronUp,
  Globe,
  MonitorPlay,
  Crosshair,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PRODUCT_SHORTNAME } from "@/App";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copyToClipboard } from "@/lib/clipboard";
import { StreamConfig, Credentials } from "@/model/stream-config";
import { useStreamPackages } from "@/hooks/useStreamPackages";
import { useIsMobile } from "@/hooks/use-mobile";

interface ConnectionOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stream: StreamConfig;
  credentials: Credentials | null;
  credentialsError: boolean;
}

export function ConnectionOptionsDialog({
  open,
  onOpenChange,
  stream,
  credentials,
  credentialsError,
}: ConnectionOptionsDialogProps) {
  const isMobile = useIsMobile();
  const { t } = useTranslation(PRODUCT_SHORTNAME);
  const [showSecrets, setShowSecrets] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const {
    downloadAtakRtmps,
    downloadBrowserHls,
    downloadVlcSrt,
    ready: packagesReady,
  } = useStreamPackages(stream.path);

  const protocols = Object.entries(stream.urls).filter(([, url]) => url);

  const content = (
    <>
      <DialogHeader className="pb-2">
        <DialogTitle>{t("video.connectionOptions")}</DialogTitle>
      </DialogHeader>

      {/* Credentials */}
      {credentialsError ? (
        <div
          className="bg-destructive/10 text-destructive text-sm p-3 rounded-md"
          role="alert"
        >
          {t("video.credentialsError")}
        </div>
      ) : credentials ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
            {t("video.credentials")}
          </p>
          <div>
            <Label className="text-xs text-muted-foreground">
              {t("stream.username")}
            </Label>
            <div className="flex gap-2 mt-1">
              <Input readOnly value={credentials.username} className="flex-1" />
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={`${t("common.copy")} ${t("stream.username")}`}
                onClick={() =>
                  copyToClipboard(credentials.username, t("common.copied"))
                }
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              {t("stream.passw")}
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                readOnly
                type={showSecrets ? "text" : "password"}
                value={credentials.password}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={showSecrets ? t("common.hide") : t("common.show")}
                onClick={() => setShowSecrets(!showSecrets)}
              >
                {showSecrets ? (
                  <EyeClosed className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={`${t("common.copy")} ${t("stream.passw")}`}
                onClick={() =>
                  copyToClipboard(credentials.password, t("common.copied"))
                }
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Download Packages */}
      {packagesReady && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">
            {t("video.downloadPackages")}
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={downloadBrowserHls}>
              <Globe className="w-4 h-4 mr-2" />
              {t("video.downloadBrowser")}
            </Button>
            <Button variant="outline" size="sm" onClick={downloadVlcSrt}>
              <MonitorPlay className="w-4 h-4 mr-2" />
              {t("video.downloadVlc")}
            </Button>
            <Button variant="outline" size="sm" onClick={downloadAtakRtmps}>
              <Crosshair className="w-4 h-4 mr-2" />
              {t("video.downloadTak")}
            </Button>
          </div>
        </div>
      )}

      {/* Advanced Links */}
      {protocols.length > 0 && (
        <div className="border border-border rounded-lg">
          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="w-full flex items-center justify-between p-3 text-sm font-semibold text-foreground hover:bg-muted/50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("video.advancedLinks")}
            {advancedOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {advancedOpen && (
            <div className="px-3 pb-3 space-y-2">
              {protocols.map(([protocol, url]) => (
                <div
                  key={protocol}
                  className="flex items-center justify-between gap-2 p-2 bg-muted rounded-md"
                >
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-foreground">
                      {protocol.toUpperCase()}
                    </span>
                    <p className="text-xs text-muted-foreground font-mono break-all mt-0.5">
                      {showSecrets ? url : url.replace(/\/\/[^@]+@/, "//***@")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0"
                    aria-label={`${t("common.copy")} ${protocol.toUpperCase()}`}
                    onClick={() => copyToClipboard(url, t("common.copied"))}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85dvh] overflow-y-auto p-4">
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85dvh] overflow-y-auto">
        {content}
      </DialogContent>
    </Dialog>
  );
}
