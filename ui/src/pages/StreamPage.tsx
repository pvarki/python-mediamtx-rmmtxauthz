import { useTranslation } from "react-i18next";
import { PRODUCT_SHORTNAME } from "@/App";
import { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Eye, EyeClosed, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Link } from "@tanstack/react-router";

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
            name: "Opentak ICU",
            url: `rtmps://${currentDomain}:1936/live/icu/${data.username}`,
          },
          {
            name: "GoPro App",
            url: `rtmps://${currentDomain}:1936/live/gopro/${data.username}?user=${data.username}&pass=${data.password}`,
            hideCredentials: true,
          },
          {
            name: "UASTool",
            url: `rtsp://${currentDomain}:8554/live/uas/${data.username}`,
          },
        ];

        const advLinks: StreamLinks[] = [
          {
            name: "RTSPS",
            url: `rtsps://${currentDomain}:8322/live/icu/${data.username}`,
          },
          {
            name: "RTSPS (with authentication)",
            url: `rtsps://${data.username}:${data.password}@${currentDomain}:8322/live/icu/${data.username}`,
            hideCredentials: true,
          },
          {
            name: "RTMPS",
            url: `rtmps://${currentDomain}:1936/live/icu/${data.username}`,
          },
          {
            name: "RTMPS (with authentication)",
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

  const copyToClipboard = (value: string) => {
    toast.success("Copied to clipboard!");
    navigator.clipboard.writeText(value);
  };

  return (
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

        <p className="text-2xl font-bold">Create a stream</p>

        {error && <p className="text-red-500">Error: {error}</p>}

        {user && (
          <div>
            {/* User Info */}
            <div className="mt-6 space-y-6">
              <div className="text-left">
                <Label className="font-semibold">Username</Label>
                <div className="flex gap-2 mt-1">
                  <Input readOnly value={user.username} />
                  <Button onClick={() => copyToClipboard(user.username)}>
                    Copy
                    <Copy />
                  </Button>
                </div>
              </div>

              <div className="text-left">
                <Label className="font-semibold">Password</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    readOnly
                    type={showPassword ? "text" : "password"}
                    value={user.password}
                  />
                  <Button onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "Hide" : "Show"}
                    {showPassword ? <EyeClosed /> : <Eye />}
                  </Button>
                  <Button onClick={() => copyToClipboard(user.password)}>
                    Copy
                    <Copy />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <p className="font-semibold text-xl text-left">Tools</p>

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
                        {showToolPasswords[idx] ? "Hide" : "Show"}{" "}
                        {showToolPasswords[idx] ? <EyeClosed /> : <Eye />}
                      </Button>
                    )}

                    <Button onClick={() => copyToClipboard(link.url)}>
                      Copy <Copy />
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
                  <span className="text-left">{`Advanced Links`}</span>
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
                              {showAdvancedPasswords[idx] ? "Hide" : "Show"}{" "}
                              {showAdvancedPasswords[idx] ? (
                                <EyeClosed />
                              ) : (
                                <Eye />
                              )}
                            </Button>
                          )}

                          <Button onClick={() => copyToClipboard(link.url)}>
                            Copy <Copy />
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
