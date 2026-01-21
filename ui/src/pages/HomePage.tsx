import { Book, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { StreamList } from "@/components/stream-list";
import { Button } from "@/components/ui/button";
import { TranslatedText } from "@/components/translated-text";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import { Toaster } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";
import { PRODUCT_SHORTNAME } from "@/App";

export const HomePage = () => {
  const { t } = useTranslation(PRODUCT_SHORTNAME);
  return (
    <div className="space-y-6">
      <div className="flex flex-row gap-4">
        {/*@ts-ignore*/}
        <Link className="flex-1" to="stream">
          <Button
            variant="outline"
            size="lg"
            className="w-full py-6 cursor-pointer"
          >
            <Plus className="size-10 text-primary" />{" "}
            <TranslatedText id="home.add" />
          </Button>
        </Link>
        {/*@ts-ignore*/}
        <Link className="flex-1" to={t("home.documentation_link")}>
          <Button
            variant="outline"
            size="lg"
            className="w-full py-6 cursor-pointer"
          >
            <Book className="size-8 text-primary" />{" "}
            <TranslatedText id="home.documentation" />
          </Button>
        </Link>
      </div>
      <StreamList />
      <Toaster position="top-center" />
      <OnboardingGuide />
    </div>
  );
};
