import { createContext, useContext } from "react";
import { useUrlTab } from "../lib/useUrlTab";

const TabContext = createContext({
  tab: "home",
  changeTab: (tab: string) => {},
});

export const TabProvider = ({ children }: { children: React.ReactNode }) => {
  const { tab, changeTab } = useUrlTab("home", ["home", "watch", "stream"]);

  return (
    <TabContext.Provider value={{ tab, changeTab }}>
      {children}
    </TabContext.Provider>
  );
};

export const useTab = () => useContext(TabContext);
