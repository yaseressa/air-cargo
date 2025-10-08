import { Scroll } from "lucide-react";
import { Button } from "./ui/button";
import { DateRange } from "./data-table";
import { useTranslation } from "react-i18next";
import { toast } from "./ui/use-toast";
import { useGlobalLoadingStore } from "@/utils/store";

type FilteredReportGeneratorProps = {
  reportPath: string;
  searchCriteria: string;
  dateRange: DateRange;
  trigger?: React.ReactNode;
};

export const FilteredReportGenerator = ({
  reportPath,
  searchCriteria,
  dateRange,
  trigger,
}: FilteredReportGeneratorProps) => {
  const { t } = useTranslation();
  const globalLoading = useGlobalLoadingStore();
  const downloadFile = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast({
        title: t("error"),
        description: t("selectDateRange"),
        variant: "destructive",
      });
      return;
    }

    const apiUrl =
      import.meta.env.VITE_BACKEND_API_URL +
      `/api/reports/${reportPath}?search=${encodeURIComponent(
        searchCriteria.replace("+", "")
      )}&startDate=${(dateRange.from as Date).toISOString()}&endDate=${(
        dateRange.to as Date
      ).toISOString()}`;

    const headers = new Headers();
    headers.append("Authorization", `Bearer ${localStorage.getItem("token")}`);

    try {
      globalLoading.setGlobalLoading(true);
      const response = await fetch(apiUrl, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? t("unauthorizedAccess")
            : t("downloadFailed", { status: response.status })
        );
      }

      const blob = await response.blob();
      const contentType = response.headers.get("content-type");

      if (!blob.size || !contentType?.includes("application")) {
        throw new Error(t("invalidFileFormat"));
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${t(reportPath.split(" ")[0])} ${t("reports")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      globalLoading.setGlobalLoading(false);
      toast({
        title: t("success"),
        description: t("downloadSuccessful"),
      });
    } catch (error) {
      console.error(t("downloadError"), error);
      toast({
        title: t("error"),
        description:
          error instanceof Error ? error.message : t("downloadFailedGeneric"),
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {trigger ? (
        trigger
      ) : (
        <Button
          variant={"outline"}
          className="shadow-none flex gap-x-3"
          onClick={downloadFile}
          aria-label={t("downloadExcel")}
        >
          <Scroll className="h-4 w-4" />
          <span>{t("downloadExcel")}</span>
        </Button>
      )}
    </>
  );
};
