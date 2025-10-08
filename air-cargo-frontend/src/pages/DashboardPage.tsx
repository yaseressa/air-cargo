import Header from "@/components/header";
import { Item, SelectWrapper } from "@/components/re/select";
import { useDashboardNumberOfMonthsStore } from "@/utils/store";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default () => {
  const { t } = useTranslation();
  const numberOfMonths = useDashboardNumberOfMonthsStore();

  const dateOptions: Item[] = [
    { label: t("timePeriods.lastWeek"), value: `${7 / 30}` },
    { label: t("timePeriods.lastMonth"), value: "1" },
    { label: t("timePeriods.last3Months"), value: "3" },
    { label: t("timePeriods.last6Months"), value: "6" },
    { label: t("timePeriods.lastYear"), value: "12" },
    { label: t("timePeriods.allTime"), value: "all" },
  ];

  return (
    <>
      <Header />
      <main className="flex flex-col justify-start items-stretch gap-3 sm:py-0 md:gap-3 m-2">
        <div className="flex justify-between items-center">
          <SelectWrapper
            className="max-w-[220px]"
            data={dateOptions}
            onValueChange={(v) => numberOfMonths.setNumberOfMonths(v)}
            value={numberOfMonths.numberOfMonths.toString()}
            placeholder={t("selectTimePeriod")}
          />
        </div>
        <Outlet />
      </main>
    </>
  );
};
