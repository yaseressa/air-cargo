import DataTable, { ColumnDef } from "@/components/data-table";
import Header from "@/components/header";
import { Listing, VerticalListing } from "@/components/listing";
import DialogWrapper from "@/components/re/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { TitleWrapper } from "@/components/wrapper";
import { useDeleteCargo, useDeleteCustomer } from "@/services/calls/mutators";
import {
  useCustomer,
  useCustomerReceivedCargos,
  useCustomerSentCargos,
} from "@/services/calls/queries";
import {
  useCustomerReceivedCargoTableStore,
  useCustomerSentCargoTableStore,
  useSelectedCustomerStore,
} from "@/utils/store";
import {
  ArrowDown,
  ArrowLeftSquare,
  ArrowUp,
  ArrowUpDown,
  SquarePen,
  Trash,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { mutate: deleteCargo } = useDeleteCargo();
  const customerStore = useSelectedCustomerStore();
  const {
    data: sentTableData,
    columns: sentColumns,
    currentPage: sentCurrentPage,
    perPage: sentPerPage,
    totalElements: sentTotalElements,
    totalPages: sentTotalPages,
    sortBy: sentSortBy,
    order: sentOrder,
    searchCriteria: sentSearchCriteria,
    setColumns: setSentColumns,
    setSortBy: setSentSortBy,
    setOrder: toggleSentOrder,
    setTotalElements: setSentTotalElements,
    setTotalPages: setSentTotalPages,
    setPerPage: setSentPerPage,
    setSearchCriteria: setSentSearchCriteria,
    setPageNo: setSentPageNo,
    resetPageNo: resetSentPageNo,
    put: putSentCargo,
    clear: clearSentCargo,
  } = useCustomerSentCargoTableStore();
  const {
    data: receivedTableData,
    columns: receivedColumns,
    currentPage: receivedCurrentPage,
    perPage: receivedPerPage,
    totalElements: receivedTotalElements,
    totalPages: receivedTotalPages,
    sortBy: receivedSortBy,
    order: receivedOrder,
    searchCriteria: receivedSearchCriteria,
    setColumns: setReceivedColumns,
    setSortBy: setReceivedSortBy,
    setOrder: toggleReceivedOrder,
    setTotalElements: setReceivedTotalElements,
    setTotalPages: setReceivedTotalPages,
    setPerPage: setReceivedPerPage,
    setSearchCriteria: setReceivedSearchCriteria,
    setPageNo: setReceivedPageNo,
    resetPageNo: resetReceivedPageNo,
    put: putReceivedCargo,
    clear: clearReceivedCargo,
  } = useCustomerReceivedCargoTableStore();
  const { data: customerData, isLoading: customerLoading } = useCustomer(id!);
  const { mutate: deleteCustomer } = useDeleteCustomer();
  const [verifyName, setVerifyName] = useState("");
  const [loading, setLoading] = useState(true);

  const {
    data: sentCargoPage,
    isLoading: sentLoading,
    isFetching: isFetchingSent,
    refetch: refetchSent,
  } = useCustomerSentCargos(
    id,
    sentCurrentPage,
    sentPerPage,
    sentSortBy,
    sentOrder,
    sentSearchCriteria
  );

  const {
    data: receivedCargoPage,
    isLoading: receivedLoading,
    isFetching: isFetchingReceived,
    refetch: refetchReceived,
  } = useCustomerReceivedCargos(
    id,
    receivedCurrentPage,
    receivedPerPage,
    receivedSortBy,
    receivedOrder,
    receivedSearchCriteria
  );

  useEffect(() => {
    if (!customerLoading && customerData) {
      customerStore.setCustomer(customerData);
      setLoading(false);
    }
  }, [customerLoading, customerData]);

  useEffect(() => {
    clearSentCargo();
    clearReceivedCargo();
    resetSentPageNo();
    resetReceivedPageNo();
  }, [
    id,
    clearSentCargo,
    clearReceivedCargo,
    resetSentPageNo,
    resetReceivedPageNo,
  ]);

  useEffect(() => {
    if (sentCargoPage) {
      putSentCargo(sentCargoPage);
      setSentTotalElements(sentCargoPage.totalElements ?? 0);
      setSentTotalPages(sentCargoPage.totalPages ?? 0);
    }
  }, [sentCargoPage, putSentCargo, setSentTotalElements, setSentTotalPages]);

  useEffect(() => {
    if (receivedCargoPage) {
      putReceivedCargo(receivedCargoPage);
      setReceivedTotalElements(receivedCargoPage.totalElements ?? 0);
      setReceivedTotalPages(receivedCargoPage.totalPages ?? 0);
    }
  }, [
    receivedCargoPage,
    putReceivedCargo,
    setReceivedTotalElements,
    setReceivedTotalPages,
  ]);

  useEffect(() => {
    if (!id) return;
    refetchSent();
  }, [
    id,
    sentCurrentPage,
    sentPerPage,
    sentOrder,
    sentSortBy,
    sentSearchCriteria,
    refetchSent,
  ]);

  useEffect(() => {
    if (!id) return;
    refetchReceived();
  }, [
    id,
    receivedCurrentPage,
    receivedPerPage,
    receivedOrder,
    receivedSortBy,
    receivedSearchCriteria,
    refetchReceived,
  ]);

  useEffect(() => {
    setSentColumns([
      {
        header: () => (
          <Button
            variant="ghost"
            onClick={() => {
              setSentSortBy("createdAt");
              toggleSentOrder();
            }}
            className="flex items-center gap-2"
          >
            <span>{t("createdAt")}</span>
            {sentSortBy === "createdAt" ? (
              sentOrder === "asc" ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUp className="h-3 w-3" />
              )
            ) : (
              <ArrowUpDown className="h-3 w-3" />
            )}
          </Button>
        ),
        accessorKey: "createdAt",
        cell: ({ row }) => <p>{row.original.createdAt}</p>,
      },
      {
        header: t("receiver"),
        accessorKey: "receiver",
        cell: ({ row }) => (
          <Button variant="link">
            <Link to={`/customers/${row.original.receiver?.id}`}>
              {row.original.receiver?.firstName}{" "}
              {row.original.receiver?.lastName}
            </Link>
          </Button>
        ),
      },
      {
        header: t("pickupLocation"),
        accessorKey: "pickupLocation",
        cell: ({ row }) => <p>{row.original.pickupLocation}</p>,
      },
      {
        header: t("destination"),
        accessorKey: "destination",
        cell: ({ row }) => <p>{row.original.destination}</p>,
      },
      {
        header: t("cargoType"),
        accessorKey: "cargoType",
        cell: ({ row }) => <p>{row.original.cargoType}</p>,
      },
      {
        header: () => (
          <Button
            variant="ghost"
            onClick={() => {
              setSentSortBy("quantity");
              toggleSentOrder();
            }}
            className="flex items-center gap-2"
          >
            <span>{t("quantity")}</span>
            {sentSortBy === "quantity" ? (
              sentOrder === "asc" ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUp className="h-3 w-3" />
              )
            ) : (
              <ArrowUpDown className="h-3 w-3" />
            )}
          </Button>
        ),
        accessorKey: "quantity",
        cell: ({ row }) => <p>{row.original.quantity}</p>,
      },
      {
        header: t("totalWeight"),
        accessorKey: "totalWeight",
        cell: ({ row }) => (
          <p>{row.original.totalWeight ?? row.original.weight}</p>
        ),
      },
      {
        header: t("actions"),
        accessorKey: "actions",
        cell: ({ row }) => (
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() =>
                navigate(
                  `/cargo/${customerStore.customer?.id}/${row.original.id}`
                )
              }
            >
              <SquarePen size={16} className="text-primary" />
            </Button>
            <DialogWrapper
              title={t("deleteCargo")}
              key={row.original.id}
              trigger={
                <Button variant="ghost">
                  <Trash size={16} className="text-destructive" />
                </Button>
              }
              footer={
                <Button
                  onClick={() => {
                    deleteCargo(row.original.id, {
                      onSuccess: () => {
                        toast({
                          title: t("cargoDeleted"),
                          description: t("cargoDeletedSuccessfully"),
                        });
                        void refetchSent();
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
    ] as ColumnDef[]);
  }, [
    t,
    setSentColumns,
    setSentSortBy,
    toggleSentOrder,
    sentSortBy,
    sentOrder,
    navigate,
    customerStore.customer?.id,
  ]);

  useEffect(() => {
    setReceivedColumns([
      {
        header: () => (
          <Button
            variant="ghost"
            onClick={() => {
              setReceivedSortBy("createdAt");
              toggleReceivedOrder();
            }}
            className="flex items-center gap-2"
          >
            <span>{t("createdAt")}</span>
            {receivedSortBy === "createdAt" ? (
              receivedOrder === "asc" ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUp className="h-3 w-3" />
              )
            ) : (
              <ArrowUpDown className="h-3 w-3" />
            )}
          </Button>
        ),
        accessorKey: "createdAt",
        cell: ({ row }) => <p>{row.original.createdAt}</p>,
      },
      {
        header: t("sender"),
        accessorKey: "sender",
        cell: ({ row }) => (
          <Button variant="link">
            <Link to={`/customers/${row.original.sender?.id}`}>
              {row.original.sender?.firstName} {row.original.sender?.lastName}
            </Link>
          </Button>
        ),
      },
      {
        header: t("pickupLocation"),
        accessorKey: "pickupLocation",
        cell: ({ row }) => <p>{row.original.pickupLocation}</p>,
      },
      {
        header: t("destination"),
        accessorKey: "destination",
        cell: ({ row }) => <p>{row.original.destination}</p>,
      },
      {
        header: t("cargoType"),
        accessorKey: "cargoType",
        cell: ({ row }) => <p>{row.original.cargoType}</p>,
      },
      {
        header: () => (
          <Button
            variant="ghost"
            onClick={() => {
              setReceivedSortBy("quantity");
              toggleReceivedOrder();
            }}
            className="flex items-center gap-2"
          >
            <span>{t("quantity")}</span>
            {receivedSortBy === "quantity" ? (
              receivedOrder === "asc" ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUp className="h-3 w-3" />
              )
            ) : (
              <ArrowUpDown className="h-3 w-3" />
            )}
          </Button>
        ),
        accessorKey: "quantity",
        cell: ({ row }) => <p>{row.original.quantity}</p>,
      },
      {
        header: t("totalWeight"),
        accessorKey: "totalWeight",
        cell: ({ row }) => (
          <p>{row.original.totalWeight ?? row.original.weight}</p>
        ),
      },
      {
        header: t("actions"),
        accessorKey: "actions",
        cell: ({ row }) => (
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() =>
                navigate(`/cargo/${row.original.sender?.id}/${row.original.id}`)
              }
            >
              <SquarePen size={16} className="text-primary" />
            </Button>
          </div>
        ),
      },
    ] as ColumnDef[]);
  }, [
    t,
    setReceivedColumns,
    setReceivedSortBy,
    toggleReceivedOrder,
    receivedSortBy,
    receivedOrder,
    navigate,
  ]);

  const customerDetailsColumns: ColumnDef[] = [
    {
      header: t("customer"),
      accessorKey: t("customer"),
      cell: ({ row }) => (
        <p>
          {row.firstName} {row.lastName}
        </p>
      ),
    },
    {
      header: t("email"),
      accessorKey: t("email"),
      cell: ({ row }) => <p>{row.email}</p>,
    },
    {
      header: t("phoneNumber"),
      accessorKey: t("phoneNumber"),
      cell: ({ row }) => <p>{row.phoneNumber}</p>,
    },
    {
      header: t("address"),
      accessorKey: t("address"),
      cell: ({ row }) => <p>{row.address}</p>,
    },
    {
      header: t("gender"),
      accessorKey: t("gender"),
      cell: ({ row }) => (
        <Badge variant="outline">
          {t("genderCategory." + row.gender.toLowerCase())}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <Header />
      {!loading ? (
        <main className="flex flex-col justify-start items-stretch gap-4 md:gap-14 m-2 overflow-x-hidden">
          <div className="flex justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/customers")}
            >
              <ArrowLeftSquare className="text-primary" size={20} />
            </Button>
            <div className="flex justify-center items-center">
              <Badge variant="outline">
                {t("customerId")}: {customerStore.customer?.id}
              </Badge>
            </div>
            <DialogWrapper
              title={t("deleteCustomer")}
              trigger={
                <Button variant="ghost" size="icon">
                  <Trash size={20} className="text-destructive" />
                </Button>
              }
              footer={
                <Button
                  onClick={() => {
                    if (
                      verifyName.trim() ===
                      `${customerStore.customer?.firstName?.trim()} ${customerStore.customer?.lastName?.trim()}`
                    ) {
                      deleteCustomer(customerStore.customer?.id!, {
                        onSuccess: () => {
                          toast({
                            title: t("customerDeleted"),
                            description: t("customerDeletedSuccessfully"),
                          });
                          navigate("/customers");
                        },
                        onError: () => {
                          toast({
                            title: t("error"),
                            description: t("failedToDeleteCustomer"),
                            variant: "destructive",
                          });
                        },
                      });
                    } else {
                      toast({
                        title: t("error"),
                        description: t("verifyCustomerName"),
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  {t("delete")}
                </Button>
              }
            >
              <div className="flex flex-col gap-3">
                <p>
                  {t("confirmDeleteCustomer1")}
                  <code className="bg-muted rounded-md p-1">
                    {customerStore.customer?.firstName}{" "}
                    {customerStore.customer?.lastName}
                  </code>
                  ?
                </p>
                <Input
                  placeholder={t("typeCustomerName")}
                  onChange={(e) => setVerifyName(e.target.value)}
                />
              </div>
            </DialogWrapper>
          </div>
          <div className="flex md:flex-row flex-col justify-evenly md:items-center gap-3">
            <div className="flex justify-center items-center flex-col gap-2 animate-fade-right">
              <Badge variant="outline">{t("createdAt")}:</Badge>
              <p className="text-sm font-light">
                {customerStore.customer?.createdAt}
              </p>
            </div>
            <TitleWrapper
              title={t("customerDetails")}
              className="md:translate-y-5 min-h-fit md:order-2 order-3 animate-fade-down"
              modalNumber={2}
              optype="update"
            >
              <div className="md:block hidden">
                <Listing
                  columns={customerDetailsColumns}
                  data={[customerStore.customer]}
                />
              </div>
              <div className="md:hidden block">
                <VerticalListing
                  columns={customerDetailsColumns}
                  data={customerStore.customer}
                />
              </div>
            </TitleWrapper>
            <div className="flex justify-center items-center flex-col gap-2 md:order-3 order-2 animate-fade-left">
              <Badge variant="outline">{t("updatedAt")}:</Badge>
              <p className="text-sm font-light">
                {customerStore.customer?.updatedAt}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-stretch gap-3">
            <TitleWrapper
              title={t("sentCargo")}
              className="flex-1 animate-fade-right"
            >
              <DataTable
                loading={loading || sentLoading}
                refetching={isFetchingSent}
                columns={sentColumns}
                tableData={sentTableData?.content ?? []}
                headerShown
                pagination={{
                  currentPage: sentCurrentPage,
                  totalPages: sentTotalPages,
                  totalElements: sentTotalElements,
                  perPage: sentPerPage,
                  order: sentOrder,
                  sortBy: sentSortBy,
                }}
                setPerPage={setSentPerPage}
                setSearchCriteria={setSentSearchCriteria}
                setPageNo={setSentPageNo}
                resetPageNo={resetSentPageNo}
                createLink={`/cargo/${customerStore.customer?.id}/create`}
              />
            </TitleWrapper>
            <TitleWrapper
              title={t("receivedCargo")}
              className="flex-1 animate-fade-left fade-in-90"
            >
              <DataTable
                loading={loading || receivedLoading}
                refetching={isFetchingReceived}
                columns={receivedColumns}
                tableData={receivedTableData?.content ?? []}
                headerShown
                pagination={{
                  currentPage: receivedCurrentPage,
                  totalPages: receivedTotalPages,
                  totalElements: receivedTotalElements,
                  perPage: receivedPerPage,
                  order: receivedOrder,
                  sortBy: receivedSortBy,
                }}
                setPerPage={setReceivedPerPage}
                setSearchCriteria={setReceivedSearchCriteria}
                setPageNo={setReceivedPageNo}
                resetPageNo={resetReceivedPageNo}
              />
            </TitleWrapper>
          </div>
        </main>
      ) : (
        ""
      )}
    </>
  );
};
