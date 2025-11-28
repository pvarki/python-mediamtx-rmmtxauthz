import { Book, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PRODUCT_SHORTNAME } from "@/App";
import { Link } from "@tanstack/react-router";
import { StreamList } from "@/components/stream-list";
import { Button } from "@/components/ui/button";

export const HomePage = () => {
  const { t, i18n } = useTranslation(PRODUCT_SHORTNAME);

  return (
    <div className="space-y-6">
      <div className="flex flex-row gap-4">
        {/*@ts-ignore*/}
        <Link className="flex-1" to="stream">
          <Button variant="outline" size="lg" className="w-full py-6">
            <Plus className="size-10 text-primary" /> Add
          </Button>
        </Link>
        {/*@ts-ignore*/}
        <Link className="flex-1" to="">
          <Button variant="outline" size="lg" className="w-full py-6">
            <Book className="size-8 text-primary" /> Documentation
          </Button>
        </Link>
      </div>
      <StreamList />
    </div>
  );
};
