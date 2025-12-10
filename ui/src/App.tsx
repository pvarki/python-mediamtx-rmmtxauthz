import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";

import { HomePage } from "./pages/HomePage";
import { WatchPage } from "./pages/watch/WatchPage";
import { StreamPage } from "./pages/StreamPage";

import enLang from "./locales/en.json";
import fiLang from "./locales/fi.json";
import svLang from "./locales/sv.json";

const RootLayoutComponent = () => (
  <div className="max-w-5xl mx-auto p-6">
    <Outlet />
  </div>
);

const rootRoute = createRootRoute({
  component: RootLayoutComponent,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const watchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "watch",
  component: WatchPage,
});

const streamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "stream",
  component: StreamPage,
});

const routeTree = rootRoute.addChildren([homeRoute, watchRoute, streamRoute]);

interface Props {
  data: {};
}

export const PRODUCT_SHORTNAME = "mtx";

export default ({ data }: Props) => {
  const [ready, setReady] = useState(false);
  const { t, i18n } = useTranslation(PRODUCT_SHORTNAME);

  const router = createRouter({ routeTree, basepath: "/product/mtx" });

  useEffect(() => {
    console.log("Registering");

    async function load() {
      i18n.addResourceBundle("en", PRODUCT_SHORTNAME, enLang);
      i18n.addResourceBundle("fi", PRODUCT_SHORTNAME, fiLang);
      i18n.addResourceBundle("sv", PRODUCT_SHORTNAME, svLang);

      await i18n.loadNamespaces(PRODUCT_SHORTNAME);
      setReady(true);
    }

    load();
  }, [i18n]);

  if (!ready) return null;

  return <RouterProvider router={router} />;
};
