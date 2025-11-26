import { useTranslation } from "react-i18next";
import { PRODUCT_SHORTNAME } from "@/App";
import { useRouteContext } from "@tanstack/react-router";
import { useEffect } from "react";

export const StreamPage = () => {
  const { t, i18n } = useTranslation(PRODUCT_SHORTNAME);

  return (
    <div>
      <p className="text-2xl font-bold">Create a stream</p>
    </div>
  );
};
