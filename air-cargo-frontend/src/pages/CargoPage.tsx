import DataTable from "@/components/data-table";
import { useEffect, useState } from "react";
import {
  useCargos,
  fetchCargoPhotos,
  useLocations,
} from "@/services/calls/queries";
import { useAllCargoStore, useSelectedCargoStore } from "@/utils/store";
import { toast } from "@/components/ui/use-toast";
import DialogWrapper from "@/components/re/dialog";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  SquarePen,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteCargo } from "@/services/calls/mutators";
import Header from "@/components/header";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";
import { addDays, format } from "date-fns";
import { SelectWrapper } from "@/components/re/select";
import { Input } from "@/components/ui/input";
import { FilteredReportGenerator } from "@/components/report-generators";
import { Location } from "@/utils/types";

export default () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const cargoStore = useSelectedCargoStore();
  const cargosStore = useAllCargoStore();
  const { mutate: deleteCargo } = useDeleteCargo();
  const { data: locations, isLoading: _ } = useLocations();

  const { isLoading, refetch, isRefetching } = useCargos(
    cargosStore.currentPage!,
    cargosStore.perPage!,
    cargosStore.sortBy!,
    cargosStore.order!,
    cargosStore.searchCriteria!,
    cargosStore.fromDate,
    cargosStore.toDate,
    cargosStore.pickupLocation,
    cargosStore.destination
  );

  useEffect(() => {
    const searching = async () => {
      const { data } = await refetch();
      setCargosData(data);
    };
    searching();
  }, [
    cargosStore.searchCriteria,
    cargosStore.perPage,
    cargosStore.currentPage,
    cargosStore.order,
    cargosStore.sortBy,
    cargosStore.fromDate,
    cargosStore.toDate,
    cargosStore.pickupLocation,
    cargosStore.destination,
    t,
  ]);

  const setCargosData = (data: any) => {
    cargosStore.put(data);
    cargosStore.setColumns([
      {
        accessorKey: t("date"),
        header: () => {
          return (
            <Button
              variant="ghost"
              onClick={() => {
                cargosStore.setSortBy("createdAt");
                cargosStore.setOrder();
              }}
              className="flex items-center gap-3"
            >
              <div>{t("date")}</div>
              {cargosStore.sortBy === "createdAt" ? (
                cargosStore.order! === "asc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : (
                  <ArrowUp className="h-3 w-3" />
                )
              ) : (
                <ArrowUpDown className="h-3 w-3" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => <p>{row.original.createdAt}</p>,
      },
      {
        header: t("sender"),
        accessorKey: t("sender"),
        cell: ({ row }) => (
          <Button variant={"link"}>
            <Link to={"/customers/" + row.original.sender.id}>
              {row.original.sender.firstName} {row.original.sender.lastName}
            </Link>
          </Button>
        ),
      },
      {
        header: t("receiver"),
        accessorKey: t("receiver"),
        cell: ({ row }) => (
          <Button variant={"link"}>
            <Link to={"/customers/" + row.original.receiver.id}>
              {row.original.receiver.firstName} {row.original.receiver.lastName}
            </Link>
          </Button>
        ),
      },
      {
        header: t("pickupLocation"),
        accessorKey: t("pickupLocation"),
        cell: ({ row }) => <p>{row.original.pickupLocation}</p>,
      },
      {
        header: t("destination"),
        accessorKey: t("destination"),
        cell: ({ row }) => <p>{row.original.destination}</p>,
      },
      {
        header: t("cargoType"),
        accessorKey: t("cargoType"),
        cell: ({ row }) => <p>{row.original.cargoType}</p>,
      },
      {
        header: () => {
          return (
            <Button
              variant="ghost"
              onClick={() => {
                cargosStore.setSortBy("quantity");
                cargosStore.setOrder();
              }}
              className="flex items-center gap-3"
            >
              <div>{t("quantity")}</div>
              {cargosStore.sortBy === "quantity" ? (
                cargosStore.order! === "asc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : (
                  <ArrowUp className="h-3 w-3" />
                )
              ) : (
                <ArrowUpDown className="h-3 w-3" />
              )}
            </Button>
          );
        },
        accessorKey: t("quantity"),
        cell: ({ row }) => <p>{row.original.quantity}</p>,
      },
      {
        header: t("totalWeight"),
        accessorKey: t("totalWeight"),
        cell: ({ row }) => <p>{row.original.weight}</p>,
      },
      {
        header: t("actions"),
        accessorKey: t("actions"),
        cell: ({ row }) => (
          <div className="flex">
            <Button
              variant={"ghost"}
              className="p-2"
              onMouseEnter={() => {
                queryClient.prefetchQuery(
                  ["cargoPhotos", row.original.id],
                  () => fetchCargoPhotos(row.original.id)
                );
              }}
              onClick={() => {
                cargoStore.setCargo(row.original);
                navigate(
                  "/cargo/" + row.original.sender.id + "/" + row.original.id
                );
              }}
            >
              <SquarePen size={16} className="text-primary" />
            </Button>
            <DialogWrapper
              key={row.original.id}
              title={t("deleteCargo")}
              trigger={
                <Button variant={"ghost"}>
                  <Trash size={16} className="text-destructive" />
                </Button>
              }
              footer={
                <Button
                  className="p-2"
                  onClick={() => {
                    deleteCargo(row.original.id, {
                      onSuccess: () => {
                        cargosStore.deleteCargo(row.original.id);
                        toast({
                          title: t("cargoDeleted"),
                          description: t("cargoDeletedSuccessfully"),
                        });
                      },
                      onError: () => {
                        toast({
                          title: t("error"),
                          description: t("failedToDeleteCargo"),
                          variant: "destructive",
                        });
                      },
                    });
                  }}
                >
                  {t("delete")}
                </Button>
              }
            >
              {t("confirmDeleteCargo")}
            </DialogWrapper>
          </div>
        ),
      },
    ]);
    cargosStore.setTotalPages(data.totalPages);
    cargosStore.setTotalElements(data.totalElements);
  };

  return (
    <>
      <Header />
      <main className="flex flex-col justify-start items-end gap-2 m-2">
        <AdvancedReports />
        <div className="w-full">
          <DataTable
            loading={isLoading}
            refetching={isRefetching}
            columns={cargosStore.columns}
            tableData={cargosStore.data?.content!}
            headerShown={true}
            pagination={{
              currentPage: cargosStore.currentPage!,
              totalPages: cargosStore.totalPages!,
              totalElements: cargosStore.totalElements!,
              perPage: cargosStore.perPage!,
              order: cargosStore.order!,
              sortBy: cargosStore.sortBy!,
            }}
            selectables={
              <>
                <SelectWrapper
                  className="text-xs text-primary"
                  placeholder={t("pickupLocation")}
                  data={locations?.map((location: Location) => ({
                    label: location.name,
                    value: location.name,
                  }))}
                  onValueChange={cargosStore.setPickupLocation}
                  value={cargosStore.pickupLocation}
                />
                <SelectWrapper
                  className="text-xs text-primary"
                  placeholder={t("destination")}
                  data={locations?.map((location: Location) => ({
                    label: location.name,
                    value: location.name,
                  }))}
                  onValueChange={cargosStore.setDestination}
                  value={cargosStore.destination}
                />
              </>
            }
            setPerPage={cargosStore.setPerPage}
            resetPageNo={cargosStore.resetPageNo}
            setSearchCriteria={cargosStore.setSearchCriteria}
            setFromDate={cargosStore.setFromDate}
            setToDate={cargosStore.setToDate}
            setPageNo={cargosStore.setPageNo}
            report="cargos"
          />
        </div>
      </main>
    </>
  );
};
const AdvancedReports = () => {
  const { t } = useTranslation();
  const cargosStore = useAllCargoStore();
  const [dateRange, setDateRange] = useState({
    from: format(addDays(new Date(), -1), "yyyy-MM-dd'T'HH:mm"),
    to: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });

  const [report, setReport] = useState("cargos/pickup-city-revenue");

  return (
    <DialogWrapper
      title={t("advancedReports")}
      trigger={<Button variant={"outline"}>{t("advancedReports")}</Button>}
    >
      <SelectWrapper
        data={[
          { value: "cargos/pickup-city-revenue", label: t("revenueByCity") },
        ]}
        value={report}
        onValueChange={(value) => setReport(value)}
      />
      <div className="flex gap-1 items-center flex-row ">
        <Input
          type="datetime-local"
          value={dateRange.from! as string}
          className="rounded placeholder:text-primary/40 text-primary/90"
          onChange={(e) =>
            setDateRange((v) => ({
              ...v,
              from: e.target.value,
            }))
          }
        />
        <Input
          type="datetime-local"
          value={dateRange.to! as string}
          className="rounded placeholder:text-primary/40 text-primary/90"
          onChange={(e) =>
            setDateRange((v) => ({
              ...v,
              to: e.target.value,
            }))
          }
        />
      </div>

      <FilteredReportGenerator
        reportPath={report}
        dateRange={{
          from: new Date(dateRange.from as string),
          to: new Date(dateRange.to as string),
        }}
        searchCriteria={cargosStore.searchCriteria!}
      />
    </DialogWrapper>
  );
};
