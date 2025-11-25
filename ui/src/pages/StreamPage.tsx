import { useTranslation } from "react-i18next";
import { PRODUCT_SHORTNAME } from "@/App";

export const StreamPage = () => {
  const { t, i18n } = useTranslation(PRODUCT_SHORTNAME);

  return (
    <div>
      Stream Page
    </div>
  );
};
