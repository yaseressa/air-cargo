import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { RectangleEllipsis, BarChart, PieChart, Users } from "lucide-react";
import { useCargoStore, useDashboardNumberOfMonthsStore } from "@/utils/store";
import {
  useCargoCount,
  useCargoCustomerCount,
  useCargoGraph,
  useCargoCustomerGraph,
} from "@/services/calls/queries";
import { toast } from "./ui/use-toast";
import { CategoryChartType } from "@/utils/types";
import { Item, SelectWrapper } from "./re/select";
import IconLabel from "./icon-label";
import { Barchart } from "./bar-chart";
import { Piechart } from "./pie-chart";
import { Linechart } from "./line-chart";

export function CargoDashboard() {
  const { t } = useTranslation();
  const [cargoGraphType, setCargoGraphType] =
    useState<CategoryChartType>("BAR");
  const month = useDashboardNumberOfMonthsStore(
    (state) => state.numberOfMonths
  );
  const {
    cargoCount,
    setCargoCount,
    cargoCustomerCount,
    setCargoCustomerCount,
    cargoGraph,
    setCargoGraph,
    cargoCustomerGraph,
    setCargoCustomerGraph,
  } = useCargoStore();

  const { refetch: refetchCargoCount } = useCargoCount(month);
  const { refetch: refetchCargoCustomerCount } = useCargoCustomerCount(month);
  const { refetch: refetchCargoGraph } = useCargoGraph(month);
  const { refetch: refetchCargoCustomerGraph } = useCargoCustomerGraph(month);

  useEffect(() => {
    refetchCargoCount().then((data) => {
      if (data.isError) {
        toast({
          title: t("error"),
          description: t("failedToFetchCargoCount"),
          variant: "destructive",
        });
        return;
      }
      setCargoCount(data.data!);
    });

    refetchCargoCustomerCount().then((data) => {
      if (data.isError) {
        toast({
          title: t("error"),
          description: t("failedToFetchCargoCustomerCount"),
          variant: "destructive",
        });
        return;
      }
      setCargoCustomerCount(data.data!);
    });

    refetchCargoGraph().then((data) => {
      if (data.isError) {
        toast({
          title: t("error"),
          description: t("failedToFetchCargoGraph"),
          variant: "destructive",
        });
        return;
      }
      setCargoGraph(data.data!);
    });

    refetchCargoCustomerGraph().then((data) => {
      if (data.isError) {
        toast({
          title: t("error"),
          description: t("failedToFetchCargoCustomerGraph"),
          variant: "destructive",
        });
        return;
      }
      setCargoCustomerGraph(data.data!);
    });
  }, [month, t]);

  return (
    <main className="grid flex-1 items-start gap-4 md:gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("totalCargo")}</CardTitle>
            <RectangleEllipsis className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{cargoCount}</div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("totalCustomers")}</CardTitle>
            <Users className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{cargoCustomerCount}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="h-fit">
          <CardHeader>
            <div className="flex flex-row items-center justify-between">
              <CardTitle>{t("cargoOverTime")}</CardTitle>
              <SelectWrapper
                className=" w-[100px]"
                data={
                  [
                    {
                      label: <IconLabel Icon={BarChart} label={t("bar")} />,
                      value: "BAR",
                    },
                    {
                      label: <IconLabel Icon={PieChart} label={t("pie")} />,
                      value: "PIE",
                    },
                  ] as Item[]
                }
                onValueChange={(value) =>
                  setCargoGraphType(value as CategoryChartType)
                }
                defaultValue="BAR"
                value={cargoGraphType}
              />
            </div>
          </CardHeader>
          <CardContent>
            {cargoGraphType === "BAR" ? (
              <Barchart
                className="aspect-[9/4]"
                data={cargoGraph!}
                label={t("month")}
                value={t("cargo")}
              />
            ) : (
              <Piechart
                className="aspect-[9/4]"
                data={cargoGraph!}
                label={t("month")}
                value={t("cargo")}
              />
            )}
          </CardContent>
        </Card>
        <Card className="h-fit md:col-span-2">
          <CardHeader>
            <CardTitle>{t("cargoCustomerTrends")}</CardTitle>
            <CardDescription>
              {t("cargoCustomerTrendsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Linechart
              className="aspect-[15/4]"
              data={cargoCustomerGraph!}
              label={t("month")}
              value={t("customers")}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
