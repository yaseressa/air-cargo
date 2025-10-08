import { Frown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useTranslation } from "react-i18next";

export default () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <Frown width={300} height={300} className="mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">{t("pageNotFoundMessage")}</p>
        <div className="mt-6">
          <Link to={"/customers"}>
            <Button>{t("goBack")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
