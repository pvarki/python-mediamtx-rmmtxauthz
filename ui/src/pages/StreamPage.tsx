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
  const [advancedLinks, setAdvancedLinks] = useState<StreamLinks[]>([]);

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isOpenTakIcuOpen, setIsOpenTakIcuOpen] = useState(false);
  const [isGoProAppOpen, setIsGoProAppOpen] = useState(false);
  const [showGoProAppLink, setShowGoProAppLink] = useState(false);
  const [isUasToolOpen, setIsUasToolOpen] = useState(false);
  const [showToolPasswords, setShowToolPasswords] = useState<
    Record<number, boolean>
  >({});
  const [showAdvancedPasswords, setShowAdvancedPasswords] = useState<
    Record<number, boolean>
  >({});

  const currentDomain = window.location.hostname.replace(/^mtls./, "");

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
                <div className="flex flex-col md:flex-row gap-2 mt-1">
                  <Input readOnly value={user.username} />
                  <div>
                    <Button onClick={() => copyToClipboard(user.username, t("common.copied"))}>
                      <TranslatedText id="common.copy"/> <Copy />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="text-left">
                <Label className="font-semibold"><TranslatedText id="stream.username"/></Label>
                <div className="flex flex-col md:flex-row gap-2 mt-1">
                  <Input
                    readOnly
                    type={showPassword ? "text" : "password"}
                    value={user.password}
                  />
                  <div className="flex flex-row gap-2 mt-1">
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
            </div>

            <div className="mt-12">
              <p className="font-semibold text-xl text-left"><TranslatedText id="stream.tools"/></p>

              {/* Tools */}
              <div className="mt-8 border rounded-lg p-4 text-left">
                <button
                  className="flex items-center justify-between w-full font-semibold text-lg"
                  onClick={() => setIsOpenTakIcuOpen(!isOpenTakIcuOpen)}
                >
                  <TranslatedText id="stream.opentak_icu" className="text-left"/>
                  {isOpenTakIcuOpen ? <ChevronUp /> : <ChevronDown />}
                </button>

                {isOpenTakIcuOpen && (
                  <div className="mt-4 space-y-4">
                    <div className="text-left">
                      <TranslatedText id="stream.protocol" className="font-bold text-gray-800"/>
                      <div className="flex flex-col md:flex-row gap-2 mt-1">
                        <Input readOnly value={"RTMPS"} className="flex-1"/>
                        <div>
                          <Button onClick={() => copyToClipboard("RTMPS", t("common.copied"))}>
                            <TranslatedText id="common.copy"/> <Copy />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <TranslatedText id="stream.address" className="font-bold text-gray-800"/>
                      <div className="flex flex-col md:flex-row gap-2 mt-1">
                        <Input readOnly value={currentDomain} className="flex-1"/>
                        <div>
                          <Button onClick={() => copyToClipboard(currentDomain, t("common.copied"))}>
                            <TranslatedText id="common.copy"/> <Copy />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <TranslatedText id="stream.port" className="font-bold text-gray-800"/>
                      <div className="flex flex-col md:flex-row gap-2 mt-1">
                        <Input readOnly value={"1936"} className="flex-1"/>
                        <div>
                          <Button onClick={() => copyToClipboard("1936", t("common.copied"))}>
                            <TranslatedText id="common.copy"/> <Copy />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <TranslatedText id="stream.path" className="font-bold text-gray-800"/>
                      <div className="flex flex-col md:flex-row gap-2 mt-1">
                        <Input readOnly value={`/live/icu/${user.username}`} className="flex-1"/>
                        <div>
                          <Button onClick={() => copyToClipboard(`/live/icu/${user.username}`, t("common.copied"))}>
                            <TranslatedText id="common.copy"/> <Copy />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-8 border rounded-lg p-4 text-left">
                <button
                  className="flex items-center justify-between w-full font-semibold text-lg"
                  onClick={() => setIsGoProAppOpen(!isGoProAppOpen)}
                >
                  <TranslatedText id="stream.gopro_app" className="text-left"/>
                  {isOpenTakIcuOpen ? <ChevronUp /> : <ChevronDown />}
                </button>
                {isGoProAppOpen && (
                  <div className="mt-4 space-y-4">
                    <div className="text-left">
                      <Label className="font-semibold"><TranslatedText id="stream.address"/></Label>
                      <div className="flex flex-col md:flex-row gap-2 mt-1">
                        <Input
                          readOnly
                          type={showGoProAppLink ? "text" : "password"}
                          value={`rtmps://${currentDomain}:1936/live/gopro/${user.username}?user=${user.username}&pass=${user.password}`}
                        />
                        <div className="flex flex-row gap-2 mt-1">
                          <Button onClick={() => setShowGoProAppLink(!showGoProAppLink)}>
                            {showGoProAppLink ? <TranslatedText id="common.hide"/> : <TranslatedText id="common.show"/>}
                            {showGoProAppLink ? <EyeClosed /> : <Eye />}
                          </Button>
                          <Button onClick={() => copyToClipboard(`rtmps://${currentDomain}:1936/live/gopro/${user.username}?user=${user.username}&pass=${user.password}`, t("common.copied"))}>
                            <TranslatedText id="common.copy"/> <Copy />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-8 border rounded-lg p-4 text-left">
                <button
                  className="flex items-center justify-between w-full font-semibold text-lg"
                  onClick={() => setIsUasToolOpen(!isUasToolOpen)}
                >
                  <TranslatedText id="stream.uastool" className="text-left"/>
                  {isUasToolOpen ? <ChevronUp /> : <ChevronDown />}
                </button>
                {isUasToolOpen && (
                  <div className="mt-4 space-y-4">
                    <div className="text-left">
                      <TranslatedText id="stream.address" className="font-bold text-gray-800"/>
                      <div className="flex flex-col md:flex-row gap-2 mt-1">
                        <Input readOnly value={`rtsp://${currentDomain}:8554/live/uas/${user.username}`} className="flex-1"/>
                        <div>
                          <Button onClick={() => copyToClipboard(`rtsp://${currentDomain}:8554/live/uas/${user.username}`, t("common.copied"))}>
                            <TranslatedText id="common.copy"/> <Copy />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
                        <div className="flex flex-col md:flex-row gap-2 mt-1">
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
                          <div className="flex flex-row gap-2 mt-1">
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
