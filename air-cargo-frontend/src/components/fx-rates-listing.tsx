import DataTable from "@/components/data-table";
import { useEffect } from "react";
import { useFxRates } from "@/services/calls/queries";

import { toast } from "@/components/ui/use-toast";
import DialogWrapper from "@/components/re/dialog";
import { ArrowDown, ArrowUp, ArrowUpDown, PenBox, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteFxRate } from "@/services/calls/mutators";
import { FxRateForm } from "@/components/fx-rate-form";
import { useTranslation } from "react-i18next";
import { useFxRateStore, useSelectedFxRateStore } from "@/utils/store";

export default () => {
  const { t } = useTranslation();
  const fxRateStore = useSelectedFxRateStore();
  const fxRatesStore = useFxRateStore();
  const { mutate: deleteFxRate } = useDeleteFxRate();
  const { isLoading, refetch, isRefetching } = useFxRates(
    fxRatesStore.currentPage!,
    fxRatesStore.perPage!,
    fxRatesStore.sortBy!,
    fxRatesStore.order!,
    fxRatesStore.searchCriteria!
  );

  useEffect(() => {
    const searching = async () => {
      const { data } = await refetch();
      setFxRatesData(data);
    };
    searching();
  }, [
    fxRatesStore.searchCriteria,
    fxRatesStore.perPage,
    fxRatesStore.currentPage,
    fxRatesStore.order,
    fxRatesStore.sortBy,

    t,
  ]);

  const setFxRatesData = (data: any) => {
    if (data) {
      fxRatesStore.put(data);
      fxRatesStore.setColumns([
        {
          header: () => {
            return (
              <Button
                variant="ghost"
                onClick={() => {
                  fxRatesStore.setSortBy("createdAt");
                  fxRatesStore.setOrder();
                }}
                className="flex items-center gap-3"
              >
                <div>{t("date")}</div>
                {fxRatesStore.sortBy === "createdAt" ? (
                  fxRatesStore.order! === "asc" ? (
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
          accessorKey: t("date"),
          cell: ({ row }) => <p>{row.original.createdAt}</p>,
        },
        {
          header: () => {
            return (
              <Button
                variant="ghost"
                onClick={() => {
                  fxRatesStore.setSortBy("destinationCurrency");
                  fxRatesStore.setOrder();
                }}
                className="flex items-center gap-3"
              >
                <div>{t("fxRateModal.currency")}</div>
                {fxRatesStore.sortBy === "destinationCurrency" ? (
                  fxRatesStore.order! === "asc" ? (
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
          accessorKey: t("fxRateModal.currency"),
          cell: ({ row }) => <p>{row.original.destinationCurrency}</p>,
        },

        {
          header: t("fxRateModal.rate"),
          accessorKey: t("fxRateModal.rate"),
          cell: ({ row }) => <p>{row.original.rate}</p>,
        },

        {
          header: t("actions"),
          accessorKey: t("actions"),
          cell: ({ row }) => {
            return (
              <div className="flex">
                <DialogWrapper
                  key={row.original.id}
                  title={t("deleteFxRate")}
                  trigger={
                    <Button variant="ghost" className="p-2">
                      <Trash
                        className="text-destructive cursor-pointer"
                        size={16}
                      />
                    </Button>
                  }
                  footer={
                    <Button
                      variant="destructive"
                      onClick={() => {
                        deleteFxRate(row.original.id, {
                          onSuccess: () => {
                            fxRatesStore.deleteFxRates(row.original.id);
                            toast({
                              title: t("fxRateDeleted"),
                              description: t("fxRateDeletedSuccessfully"),
                            });
                          },
                          onError: () => {
                            toast({
                              title: t("error"),
                              description: t("failedToDeleteFxRate"),
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
                  <p>
                    {t("confirmDeleteFxRate")} {row.original.firstName}{" "}
                    {row.original.lastName}?
                  </p>
                </DialogWrapper>

                <FxRateForm
                  action="update"
                  trigger={
                    <Button
                      variant="ghost"
                      className="p-2"
                      onClick={() => {
                        fxRateStore.setFxRate(row.original);
                      }}
                    >
                      <PenBox
                        className="text-primary cursor-pointer"
                        size={16}
                      />
                    </Button>
                  }
                />
              </div>
            );
          },
        },
      ]);
      fxRatesStore.setTotalPages(data.totalPages);
      fxRatesStore.setTotalElements(data.totalElements);
    }
  };

  return (
    <DataTable
      loading={isLoading}
      refetching={isRefetching}
      columns={fxRatesStore.columns}
      tableData={fxRatesStore.data?.content!}
      headerShown={true}
      pagination={{
        currentPage: fxRatesStore.currentPage!,
        totalPages: fxRatesStore.totalPages!,
        totalElements: fxRatesStore.totalElements!,
        perPage: fxRatesStore.perPage!,
        order: fxRatesStore.order!,
        sortBy: fxRatesStore.sortBy!,
      }}
      setPerPage={fxRatesStore.setPerPage}
      resetPageNo={fxRatesStore.resetPageNo}
      setSearchCriteria={fxRatesStore.setSearchCriteria}
      setPageNo={fxRatesStore.setPageNo}
      setSelected={fxRateStore.setFxRate}
      columnsShown={false}
    />
  );
};
