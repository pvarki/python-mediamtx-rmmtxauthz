import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "../components/ui/card";
import { Book, Tv, Video } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PRODUCT_SHORTNAME } from "@/App";
import { Link } from "@tanstack/react-router";

export const HomePage = () => {
  const { t, i18n } = useTranslation(PRODUCT_SHORTNAME);

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold text-center tracking-tight text-foreground">
          {t("intro.title")}
        </h1>
        <p className="text-center text-muted-foreground mt-2">
          {t("intro.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/*@ts-ignore*/ }
        <Link to="watch">
          <Card className="hover:border-primary hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-card transition-all duration-300">
            <CardHeader className="flex flex-col items-center text-center">
              <Tv className="w-10 h-10 mb-4 text-primary" />
              <CardTitle className="text-lg font-semibold">
                {t("cards.watch.title")}
              </CardTitle>
              <CardDescription>{t("cards.watch.description")}</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/*@ts-ignore*/ }
        <Link to="stream">
          <Card className="hover:border-primary hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-card transition-all duration-300">
            <CardHeader className="flex flex-col items-center text-center">
              <Video className="w-10 h-10 mb-4 text-primary" />
              <CardTitle className="text-lg font-semibold">
                {t("cards.broadcast.title")}
              </CardTitle>
              <CardDescription>
                {t("cards.broadcast.description")}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/*@ts-ignore*/ }
        <Link to="">
          <Card className="hover:border-primary hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-card transition-all duration-300">
            <CardHeader className="flex flex-col items-center text-center">
              <Book className="w-10 h-10 mb-4 text-primary" />
              <CardTitle className="text-lg font-semibold">
                {t("cards.docs.title")}
              </CardTitle>
              <CardDescription>{t("cards.docs.description")}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
};
