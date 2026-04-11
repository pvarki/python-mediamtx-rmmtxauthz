import { useEffect, useMemo, useState } from "react";
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
  DownloadIcon,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Link } from "@tanstack/react-router";
import { TranslatedText } from "@/components/translated-text";
import { copyToClipboard } from "@/lib/clipboard";
import { Trans, useTranslation } from "react-i18next";
import { PRODUCT_SHORTNAME } from "@/App";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import { useStreamPackages } from "@/hooks/useStreamPackages";

interface Userinfo {
  username: string;
  password: string;
}

interface SRTPasswords {
  publish: string;
  read: string;
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
  const [srtPasswords, setSrtPasswords] = useState<SRTPasswords | null>(null);

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isOpenTakIcuOpen, setIsOpenTakIcuOpen] = useState(false);
  const [isGoProAppOpen, setIsGoProAppOpen] = useState(false);
  const [showGoProAppLink, setShowGoProAppLink] = useState(false);
  const [isUasToolOpen, setIsUasToolOpen] = useState(false);

  const [showAdvancedPasswords, setShowAdvancedPasswords] = useState<
    Record<number, boolean>
  >({});

  const currentDomain = window.location.hostname.replace(/^mtls./, "");

  const generateOpenTakIcuUrl = ({
    protocol,
    address,
    port,
    path,
    username,
    password,
  }: {
    protocol: string;
    address: string;
    port?: string;
    path?: string;
    username?: string;
    password?: string;
  }) => {
    const params = new URLSearchParams();

    if (protocol) params.append("protocol", protocol);
    if (address) params.append("address", address);
    if (port) params.append("port", port);
    if (path) params.append("path", path);
    if (username) params.append("username", username);
    if (password) params.append("password", password);

    return `opentakicu://import?${params.toString()}`;
  };

  const openTakIcuUrl = generateOpenTakIcuUrl({
    protocol: "rtmps",
    address: currentDomain,
    port: "1936",
    path: `/live/icu/${user?.username}`,
    username: user?.username,
    password: user?.password,
  });

const uasToolUrl = useMemo(() => {
    if (!user || !srtPasswords) return ""; 

    const callsign = user.username;
    const username = user.username;
    const password = user.password;
    const domain = currentDomain;

    const params: Record<string, string> = {
      key1: "uastool.ROUTES_WAYPOINTS_OVERLAY",
      type1: "boolean",
      value1: "true",
      key2: "uastool.pref_callsign",
      type2: "string",
      value2: `UAS-${callsign}`,
      key3: "uastool.pref_poi_id_template",
      type3: "string",
      value3: "%-POI",
      key4: "uastool.pref_ui_ar_on",
      type4: "boolean",
      value4: "true",
      key5: "uastool.pref_ui_dont_show_warning",
      type5: "boolean",
      value5: "true",
      key6: "uastool.fov_use_dted",
      type6: "boolean",
      value6: "true",
      key7: "uastool.pref_cot_broadcast",
      type7: "boolean",
      value7: "true",
      key8: "uastool.pref_broadcast_ssl",
      type8: "boolean",
      value8: "true",
      key9: "uastool.pref_broadcast_size",
      type9: "string",
      value9: "1920x1080 (high)",
      key10: "uastool.pref_video_broadcast_bitrate",
      type10: "string",
      value10: "10000",
      key11: "uastool.pref_video_broadcast_destination",
      type11: "string",
      value11: "SRT (Video Management System)",
      key12: "uastool.pref_srt_dest_host",
      type12: "string",
      value12: domain,
      key13: "uastool.pref_srt_dest_port",
      type13: "string",
      value13: "8890",
      key14: "uastool.pref_srt_stream_id",
      type14: "string",
      value14: `publish:live/uas/${callsign}:${username}:${password}`,
      key15: "uastool.pref_video_observer_url",
      type15: "string",
      value15: `rtmps://${domain}:1936/live/uas/${callsign}?user=${username}&pass=${password}`,
      key16: "uastool.pref_srt_passphrase",
      type16: "string",
      value16: srtPasswords.publish
    };

    const searchParams = new URLSearchParams(params);
    return `tak://com.atakmap.app/preference?${searchParams.toString()}`;
  }, [user, srtPasswords, currentDomain]);

  const advancedLinks = useMemo<StreamLinks[]>(() => {
    if (!user || !srtPasswords) return [];

    return [
      {
        name: t("stream.rtsps"),
        url: `rtsps://${currentDomain}:8322/live/icu/${user.username}`,
      },
      {
        name: t("stream.rtsps_with_auth"),
        url: `rtsps://${user.username}:${user.password}@${currentDomain}:8322/live/icu/${user.username}`,
        hideCredentials: true,
      },
      {
        name: t("stream.rtmps"),
        url: `rtmps://${currentDomain}:1936/live/icu/${user.username}`,
      },
      {
        name: t("stream.rtmps_with_auth"),
        url: `rtmps://${user.username}:${user.password}@${currentDomain}:1936/live/icu/${user.username}`,
        hideCredentials: true,
      },
      {
        name: t("stream.srt"),
        url: `srt://${currentDomain}:8890?streamid=publish:live/icu/${user.username}&pkt_size=1316`,
      },
      {
        name: t("stream.srt_with_auth"),
        url: `srt://${currentDomain}:8890?streamid=publish:live/icu/${user.username}:${user.username}:${user.password}&passphrase=${srtPasswords.publish}&pkt_size=1316`,
        hideCredentials: true,
      },
    ];
  }, [user, srtPasswords, currentDomain, t]);

useEffect(() => {
    async function fetchAllData() {
      try {
        const [credentialsRes, srtRes] = await Promise.all([
          fetch("/api/v1/product/proxy/mtx/api/v1/proxy/credentials"),
          fetch("/api/v1/product/proxy/mtx/api/v1/proxy/srt_default")
        ]);

        if (!credentialsRes.ok) throw new Error(`Credentials HTTP error: ${credentialsRes.status}`);
        if (!srtRes.ok) throw new Error(`SRT HTTP error: ${srtRes.status}`);

        const userData: Userinfo = await credentialsRes.json();
        const srtData: SRTPasswords = await srtRes.json();

        setUser(userData);
        setSrtPasswords(srtData);
        
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message ?? "Failed to load credentials");
      }
    }

    fetchAllData();
  }, []);

  return (
    <div className="flex justify-center text-center">
      <div className="w-full max-w-xl space-y-4">
        <div className="flex flex-row items-center gap-4">
          <Link to="/">
            <ArrowLeftCircle className="size-8" />
          </Link>
          <p className="text-2xl font-bold">
            <TranslatedText id="stream.title" />
          </p>
        </div>

        {error && <p className="text-red-500">Error: {error}</p>}

        {user && srtPasswords && (
          <div>
            {/* User Info */}
            <div className="mt-6 space-y-6">
              <div className="text-left">
                <Label className="font-semibold">
                  <TranslatedText id="stream.username" />
                </Label>
                <div className="flex flex-col md:flex-row gap-2 mt-1">
                  <Input readOnly value={user.username} />
                  <div>
                    <Button
                      className="cursor-pointer"
                      onClick={() =>
                        copyToClipboard(user.username, t("common.copied"))
                      }
                    >
                      <TranslatedText id="common.copy" /> <Copy />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="text-left">
                <Label className="font-semibold">
                  <TranslatedText id="stream.passw" />
                </Label>
                <div className="flex flex-col md:flex-row gap-2 mt-1">
                  <Input
                    readOnly
                    type={showPassword ? "text" : "password"}
                    value={user.password}
                  />
                  <div className="flex flex-row gap-2 mt-1">
                    <Button
                      className="cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <TranslatedText id="common.hide" />
                      ) : (
                        <TranslatedText id="common.show" />
                      )}
                      {showPassword ? <EyeClosed /> : <Eye />}
                    </Button>
                    <Button
                      className="cursor-pointer"
                      onClick={() =>
                        copyToClipboard(user.password, t("common.copied"))
                      }
                    >
                      <TranslatedText id="common.copy" /> <Copy />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <p className="font-semibold text-xl text-left">
                <TranslatedText id="stream.tools" />
              </p>

              {/* Tools */}
              <div className="items-center justify-between mt-8 border rounded-lg text-left">
                <div
                  className="flex flex-row items-center justify-between border-0 m-0 rounded-lg p-4 cursor-pointer"
                  onClick={() => setIsOpenTakIcuOpen(!isOpenTakIcuOpen)}
                >
                  <TranslatedText
                    id="stream.opentak_icu"
                    className="text-left font-bold"
                  />
                  <Button
                    variant="ghost"
                    className="flex items-center font-semibold text-lg cursor-pointer p-0 w-9"
                    onClick={() => setIsOpenTakIcuOpen(!isOpenTakIcuOpen)}
                  >
                    {isOpenTakIcuOpen ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </div>
                {isOpenTakIcuOpen && (
                  <div className="space-y-4 p-4 pt-0">
                    <div className="flex flex-col gap-4">
                      <a href={openTakIcuUrl} target="_blank">
                        <Button className="cursor-pointer w-full h-auto py-2 whitespace-normal wrap-break-word">
                          <TranslatedText id="stream.import.auto" />
                        </Button>
                      </a>

                      <TranslatedText
                        id="stream.import.warning"
                        className="text-sm text-muted-foreground"
                      />

                      <TranslatedText id="stream.import.manual" />
                    </div>

                    <div className="text-left space-y-1">
                      <TranslatedText
                        id="stream.protocol"
                        className="font-bold text-gray-800"
                      />
                      <div className="flex flex-col md:flex-row gap-2 mt-1">
                        <p>RTMPS</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <TranslatedText
                        id="stream.address"
                        className="font-bold text-gray-800"
                      />
                      <div className="flex flex-col md:flex-row gap-2 mt-1">
                        <Input
                          readOnly
                          value={currentDomain}
                          className="flex-1"
                        />
                        <div>
                          <Button
                            className="cursor-pointer"
                            onClick={() =>
                              copyToClipboard(currentDomain, t("common.copied"))
                            }
                          >
                            <TranslatedText id="common.copy" /> <Copy />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <TranslatedText
                        id="stream.port"
                        className="font-bold text-gray-800"
                      />
                      <div className="flex flex-col md:flex-row gap-2 mt-1">
                        <Input readOnly value={"1936"} className="flex-1" />
                        <div>
                          <Button
                            className="cursor-pointer"
                            onClick={() =>
                              copyToClipboard("1936", t("common.copied"))
                            }
                          >
                            <TranslatedText id="common.copy" /> <Copy />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <TranslatedText
                        id="stream.path"
                        className="font-bold text-gray-800"
                      />
                      <div className="flex flex-col md:flex-row gap-2 mt-1">
                        <Input
                          readOnly
                          value={`/live/icu/${user.username}`}
                          className="flex-1"
                        />
                        <div>
                          <Button
                            className="cursor-pointer"
                            onClick={() =>
                              copyToClipboard(
                                `/live/icu/${user.username}`,
                                t("common.copied"),
                              )
                            }
                          >
                            <TranslatedText id="common.copy" /> <Copy />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="items-center justify-between font-semibold mt-8 border rounded-lg text-left">
                <div
                  className="flex flex-row items-center justify-between border-0 m-0 rounded-lg p-4 cursor-pointer"
                  onClick={() => setIsGoProAppOpen(!isGoProAppOpen)}
                >
                  <TranslatedText id="stream.gopro_app" className="text-left" />
                  <Button
                    variant="ghost"
                    className="flex items-center font-semibold text-lg cursor-pointer p-0 w-9"
                    onClick={() => setIsGoProAppOpen(!isGoProAppOpen)}
                  >
                    {isGoProAppOpen ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </div>
                {isGoProAppOpen && (
                  <div className="space-y-4 p-4">
                    <div className="text-left">
                      <Label className="font-semibold">
                        <TranslatedText id="stream.address" />
                      </Label>
                      <div className="flex flex-col md:flex-row gap-2 mt-1">
                        <Input
                          readOnly
                          type={showGoProAppLink ? "text" : "password"}
                          value={`rtmps://${currentDomain}:1936/live/gopro/${user.username}?user=${user.username}&pass=${user.password}`}
                        />
                        <div className="flex flex-row gap-2 mt-1">
                          <Button
                            className="cursor-pointer"
                            onClick={() =>
                              setShowGoProAppLink(!showGoProAppLink)
                            }
                          >
                            {showGoProAppLink ? (
                              <TranslatedText id="common.hide" />
                            ) : (
                              <TranslatedText id="common.show" />
                            )}
                            {showGoProAppLink ? <EyeClosed /> : <Eye />}
                          </Button>
                          <Button
                            className="cursor-pointer"
                            onClick={() =>
                              copyToClipboard(
                                `rtmps://${currentDomain}:1936/live/gopro/${user.username}?user=${user.username}&pass=${user.password}`,
                                t("common.copied"),
                              )
                            }
                          >
                            <TranslatedText id="common.copy" /> <Copy />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="items-center justify-between font-semibold mt-8 border rounded-lg text-left">
                <div
                  className="flex flex-row items-center justify-between border-0 m-0 rounded-lg p-4 cursor-pointer"
                  onClick={() => setIsUasToolOpen(!isUasToolOpen)}
                >
                  <TranslatedText id="stream.uastool" className="text-left" />
                  <Button
                    variant="ghost"
                    className="flex items-center font-semibold text-lg cursor-pointer p-0 w-9"
                    onClick={() => setIsUasToolOpen(!isUasToolOpen)}
                  >
                    {isUasToolOpen ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </div>
                {isUasToolOpen && (
                  <div className="space-y-4 p-4 pt-0">
                    <div className="flex flex-col gap-4">
                      <a href={uasToolUrl}>
                        <Button className="cursor-pointer w-full h-auto py-2 whitespace-normal wrap-break-word">
                          <TranslatedText id="stream.uastool_import" />
                        </Button>
                      </a>
                    </div>
                  </div>
                )}
              </div>
              {/* Advanced */}
              <div className="items-center justify-between font-semibold mt-8 border rounded-lg text-left">
                <div
                  className="flex flex-row items-center justify-between border-0 m-0 rounded-lg p-4 cursor-pointer"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                >
                  <TranslatedText
                    id="stream.advanced_links"
                    className="text-left"
                  />
                  <Button
                    variant="ghost"
                    className="flex items-center font-semibold text-lg cursor-pointer p-0 w-9"
                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  >
                    {isAdvancedOpen ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </div>
                {isAdvancedOpen && (
                  <div className="space-y-4 p-4">
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
                                className="cursor-pointer"
                                onClick={() =>
                                  setShowAdvancedPasswords((prev) => ({
                                    ...prev,
                                    [idx]: !prev[idx],
                                  }))
                                }
                              >
                                {showAdvancedPasswords[idx] ? (
                                  <TranslatedText id="common.hide" />
                                ) : (
                                  <TranslatedText id="common.show" />
                                )}{" "}
                                {showAdvancedPasswords[idx] ? (
                                  <EyeClosed />
                                ) : (
                                  <Eye />
                                )}
                              </Button>
                            )}
                            <Button
                              className="cursor-pointer"
                              onClick={() =>
                                copyToClipboard(link.url, t("common.copied"))
                              }
                            >
                              <TranslatedText id="common.copy" /> <Copy />
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
      <OnboardingGuide />
    </div>
  );
};
