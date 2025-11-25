import { useTranslation } from "react-i18next";
import { PRODUCT_SHORTNAME } from "@/App";
import { useRouteContext } from "@tanstack/react-router";

export const StreamPage = () => {
  const { t, i18n } = useTranslation(PRODUCT_SHORTNAME);

  // @ts-ignore just really hates
  const { api_url } = useRouteContext({from: `product/${PRODUCT_SHORTNAME}/`, });

  return (
    <div>
      Stream Page
      {api_url}
      something
    </div>
  );
};
