import { useTranslation } from "react-i18next";
import { PRODUCT_SHORTNAME } from "@/App";
import { useRouteContext } from "@tanstack/react-router";

export const WatchPage = () => {
  const { t, i18n } = useTranslation(PRODUCT_SHORTNAME);

  return (
    <div>
      Watch Page
    </div>
  );
};
