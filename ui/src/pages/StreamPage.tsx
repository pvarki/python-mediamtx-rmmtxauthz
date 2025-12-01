import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Eye,
  EyeClosed,
  ChevronDown,
  ChevronUp,
  ArrowLeftCircle,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Link } from "@tanstack/react-router";
import { TranslatedText } from "@/components/translated-text";
import { copyToClipboard } from "@/lib/clipboard";
import { useTranslation } from "react-i18next";
import { PRODUCT_SHORTNAME } from "@/App";

interface Userinfo {
  username: string;
  password: string;
}

interface StreamLinks {
  name: string;
  url: string;
  hideCredentials?: boolean;
}

export const StreamPage = () => {
  const { t } = useTranslation(PRODUCT_SHORTNAME);

  const [user, setUser] = useState<Userinfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [toolLinks, setToolLinks] = useState<StreamLinks[]>([]);
  const [advancedLinks, setAdvancedLinks] = useState<StreamLinks[]>([]);

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [showToolPasswords, setShowToolPasswords] = useState<
    Record<number, boolean>
  >({});
  const [showAdvancedPasswords, setShowAdvancedPasswords] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    async function fetchCredentials() {
      try {
        const response = await fetch(
          "/api/v1/product/proxy/mtx/api/v1/proxy/credentials",
        );

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data: Userinfo = await response.json();
        setUser(data);

        const currentDomain = window.location.hostname.replace(/^mtls./, "");

        const links: StreamLinks[] = [
          {
            name: t("stream.opentak_icu"),
            url: `rtmps://${currentDomain}:1936/live/icu/${data.username}`,
          },
          {
            name: t("stream.gopro_app"),
            url: `rtmps://${currentDomain}:1936/live/gopro/${data.username}?user=${data.username}&pass=${data.password}`,
            hideCredentials: true,
          },
          {
            name: t("stream.uastool"),
            url: `rtsp://${currentDomain}:8554/live/uas/${data.username}`,
          },
        ];

        const advLinks: StreamLinks[] = [
          {
            name: t("stream.rtsps"),
            url: `rtsps://${currentDomain}:8322/live/icu/${data.username}`,
          },
          {
            name: t("stream.rtsps_with_auth"),
            url: `rtsps://${data.username}:${data.password}@${currentDomain}:8322/live/icu/${data.username}`,
            hideCredentials: true,
          },
          {
            name: t("stream.rtmps"),
            url: `rtmps://${currentDomain}:1936/live/icu/${data.username}`,
          },
          {
            name: t("stream.rtmps_with_auth"),
            url: `rtmps://${data.username}:${data.password}@${currentDomain}:1936/live/icu/${data.username}`,
            hideCredentials: true,
          },
        ];

        setToolLinks(links);
        setAdvancedLinks(advLinks);
      } catch (err: any) {
        console.error("Error fetching credentials:", err);
        setError(err.message ?? "Failed to load credentials");
      }
    }

    fetchCredentials();
  }, []);

  return (
    <div className="flex justify-center text-center">
      <div className="w-full max-w-xl space-y-4">
        <div className="flex flex-row items-center gap-4">
          <Link to="/">
            <ArrowLeftCircle className="size-8" />
          </Link>
          <p className="text-2xl font-bold"><TranslatedText id="stream.title"/></p>
        </div>

        {error && <p className="text-red-500">Error: {error}</p>}

        {user && (
          <div>
            {/* User Info */}
            <div className="mt-6 space-y-6">
              <div className="text-left">
                <Label className="font-semibold"><TranslatedText id="stream.passw"/></Label>
                <div className="flex gap-2 mt-1">
                  <Input readOnly value={user.username} />
                  <Button onClick={() => copyToClipboard(user.username, t("common.copied"))}>
                    <TranslatedText id="common.copy"/> <Copy />
                  </Button>
                </div>
              </div>

              <div className="text-left">
                <Label className="font-semibold"><TranslatedText id="stream.username"/></Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    readOnly
                    type={showPassword ? "text" : "password"}
                    value={user.password}
                  />
                  <Button onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <TranslatedText id="common.hide"/> : <TranslatedText id="common.show"/>}
                    {showPassword ? <EyeClosed /> : <Eye />}
                  </Button>
                  <Button onClick={() => copyToClipboard(user.password, t("common.copied"))}>
                    <TranslatedText id="common.copy"/> <Copy />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <p className="font-semibold text-xl text-left"><TranslatedText id="stream.tools"/></p>

              {/* Tools */}
              {toolLinks.map((link, idx) => (
                <div key={idx} className="pt-4 text-left">
                  <p className="font-bold text-gray-800">{link.name}</p>
                  <div className="flex gap-2 mt-2">
                    <Input
                      readOnly
                      type={
                        link.hideCredentials && !showToolPasswords[idx]
                          ? "password"
                          : "text"
                      }
                      value={link.url}
                      className="flex-1"
                    />

                    {link.hideCredentials && (
                      <Button
                        onClick={() =>
                          setShowToolPasswords((prev) => ({
                            ...prev,
                            [idx]: !prev[idx],
                          }))
                        }
                      >
                        {showToolPasswords[idx] ? <TranslatedText id="common.hide"/> : <TranslatedText id="common.show"/>}{" "}
                        {showToolPasswords[idx] ? <EyeClosed /> : <Eye />}
                      </Button>
                    )}

                    <Button onClick={() => copyToClipboard(link.url, t("common.copied"))}>
                      <TranslatedText id="common.copy"/> <Copy />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Advanced */}
              <div className="mt-8 border rounded-lg p-4 text-left">
                <button
                  className="flex items-center justify-between w-full font-semibold text-lg"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                >
                  <TranslatedText id="stream.advanced_links" className="text-left"/>
                  {isAdvancedOpen ? <ChevronUp /> : <ChevronDown />}
                </button>

                {isAdvancedOpen && (
                  <div className="mt-4 space-y-4">
                    {advancedLinks.map((link, idx) => (
                      <div key={idx} className="text-left">
                        <p className="font-bold text-gray-800">{link.name}</p>
                        <div className="flex gap-2 mt-2">
                          <Input
                            readOnly
                            type={
                              link.hideCredentials &&
                              !showAdvancedPasswords[idx]
                                ? "password"
                                : "text"
                            }
                            value={link.url}
                            className="flex-1"
                          />

                          {link.hideCredentials && (
                            <Button
                              onClick={() =>
                                setShowAdvancedPasswords((prev) => ({
                                  ...prev,
                                  [idx]: !prev[idx],
                                }))
                              }
                            >
                              {showAdvancedPasswords[idx] ? <TranslatedText id="common.hide"/> : <TranslatedText id="common.show"/>}{" "}
                              {showAdvancedPasswords[idx] ? (
                                <EyeClosed />
                              ) : (
                                <Eye />
                              )}
                            </Button>
                          )}

                          <Button onClick={() => copyToClipboard(link.url, t("common.copied"))}>
                            <TranslatedText id="common.copy"/> <Copy />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Toaster position="top-center" />
    </div>
  );
};
