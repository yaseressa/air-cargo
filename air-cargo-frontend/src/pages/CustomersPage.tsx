import DataTable from "@/components/data-table";
import { useEffect } from "react";
import { fetchCustomer, useCustomers } from "@/services/calls/queries";
import { useCustomersStore, useSelectedCustomerStore } from "@/utils/store";
import { toast } from "@/components/ui/use-toast";
import DialogWrapper from "@/components/re/dialog";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  EyeIcon,
  PenBox,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteCustomer } from "@/services/calls/mutators";
import { CustomerForm } from "@/components/customer-form";
import Header from "@/components/header";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";

export default () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const customerStore = useSelectedCustomerStore();
  const customersStore = useCustomersStore();
  const { mutate: deleteCustomer } = useDeleteCustomer();
  const { isLoading, refetch, isRefetching } = useCustomers(
    customersStore.currentPage!,
    customersStore.perPage!,
    customersStore.sortBy!,
    customersStore.order!,
    customersStore.searchCriteria!,
    customersStore.fromDate,
    customersStore.toDate
  );

  useEffect(() => {
    const searching = async () => {
      const { data } = await refetch();
      setCustomersData(data);
    };
    searching();
  }, [
    customersStore.searchCriteria,
    customersStore.perPage,
    customersStore.currentPage,
    customersStore.order,
    customersStore.sortBy,
    customersStore.fromDate,
    customersStore.toDate,
    t,
  ]);

  const setCustomersData = (data: any) => {
    if (data) {
      customersStore.put(data);
      customersStore.setColumns([
        {
          header: () => {
            return (
              <Button
                variant="ghost"
                onClick={() => {
                  customersStore.setSortBy("createdAt");
                  customersStore.setOrder();
                }}
                className="flex items-center gap-3"
              >
                <div>{t("date")}</div>
                {customersStore.sortBy === "createdAt" ? (
                  customersStore.order! === "asc" ? (
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
                  customersStore.setSortBy("phoneNumber");
                  customersStore.setOrder();
                }}
                className="flex items-center gap-3"
              >
                <div>{t("phoneNumber")}</div>
                {customersStore.sortBy === "phoneNumber" ? (
                  customersStore.order! === "asc" ? (
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
          accessorKey: t("phoneNumber"),
          cell: ({ row }) => <p>{row.original.phoneNumber}</p>,
        },
        {
          header: t("fullName"),
          accessorKey: t("fullName"),
          cell: ({ row }) => (
            <p>
              {row.original.firstName} {row.original.lastName}
            </p>
          ),
        },
        {
          header: t("address"),
          accessorKey: t("address"),
          cell: ({ row }) => {
            return <div>{row.original.address}</div>;
          },
        },
        {
          header: t("actions"),
          accessorKey: t("actions"),
          cell: ({ row }) => {
            return (
              <div className="flex">
                <DialogWrapper
                  key={row.original.id}
                  title={t("deleteCustomer")}
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
                        deleteCustomer(row.original.id, {
                          onSuccess: () => {
                            customersStore.deleteCustomer(row.original.id);
                            toast({
                              title: t("customerDeleted"),
                              description: t("customerDeletedSuccessfully"),
                            });
                          },
                          onError: () => {
                            toast({
                              title: t("error"),
                              description: t("failedToDeleteCustomer"),
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
                    {t("confirmDeleteCustomer")} {row.original.firstName}{" "}
                    {row.original.lastName}?
                  </p>
                </DialogWrapper>

                <CustomerForm
                  action="update"
                  trigger={
                    <Button
                      variant="ghost"
                      className="p-2"
                      onClick={() => {
                        customerStore.setCustomer(row.original);
                      }}
                    >
                      <PenBox
                        className="text-primary cursor-pointer"
                        size={16}
                      />
                    </Button>
                  }
                />
                <Button
                  variant={"ghost"}
                  className="p-2"
                  onMouseEnter={() => {
                    queryClient.prefetchQuery(
                      ["customer", row.original.id],
                      () => fetchCustomer(row.original.id)
                    );
                  }}
                  onClick={() => navigate(`/customers/${row.original.id}`)}
                >
                  <EyeIcon className="text-primary cursor-pointer " size={16} />
                </Button>
              </div>
            );
          },
        },
      ]);
      customersStore.setTotalPages(data.totalPages);
      customersStore.setTotalElements(data.totalElements);
    }
  };

  return (
    <>
      <Header />
      <main className="flex flex-col justify-start gap-4 m-2">
        <DataTable
          loading={isLoading}
          refetching={isRefetching}
          columns={customersStore.columns}
          tableData={customersStore.data?.content!}
          headerShown={true}
          create={2}
          pagination={{
            currentPage: customersStore.currentPage!,
            totalPages: customersStore.totalPages!,
            totalElements: customersStore.totalElements!,
            perPage: customersStore.perPage!,
            order: customersStore.order!,
            sortBy: customersStore.sortBy!,
          }}
          setPerPage={customersStore.setPerPage}
          resetPageNo={customersStore.resetPageNo}
          setSearchCriteria={customersStore.setSearchCriteria}
          setFromDate={customersStore.setFromDate}
          setToDate={customersStore.setToDate}
          setPageNo={customersStore.setPageNo}
          setSelected={customerStore.setCustomer}
          report="customers"
        />
      </main>
    </>
  );
};
