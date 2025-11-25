import { useEffect, useState } from "react";

export function useUrlTab(defaultTab: string, allowedTabs: string[]) {
  const [tab, setTab] = useState(defaultTab);

  useEffect(() => {

    const syncTabFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");

      if (!tabParam || !allowedTabs.includes(tabParam)) {
        params.set("tab", defaultTab);
        window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
        setTab(defaultTab);
      } else {
        setTab(tabParam);
      }
    };

    syncTabFromUrl();

    window.addEventListener("popstate", syncTabFromUrl);
    return () => window.removeEventListener("popstate", syncTabFromUrl);
  }, [defaultTab, allowedTabs]);

  const changeTab = (nextTab: string) => {
    if (!allowedTabs.includes(nextTab)) return;

    const params = new URLSearchParams(window.location.search);
    params.set("tab", nextTab);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
    setTab(nextTab);
  };

  return { tab, changeTab };
}
