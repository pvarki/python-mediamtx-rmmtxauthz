import { HomePage } from "@/pages/HomePage";
import { useTab } from "./TabProvider";
import { WatchPage } from "@/pages/WatchPage";
import { StreamPage } from "@/pages/StreamPage";

export const PageRenderer = () => {
  const { tab } = useTab();

  return (
    <div className="max-w-5xl mx-auto p-6">
      {tab === "home" && <HomePage />}
      {tab === "watch" && <WatchPage />}
      {tab === "stream" && <StreamPage />}
    </div>
  );
};
