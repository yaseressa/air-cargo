import DataTable from "@/components/data-table";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCargos,
  useCustomers,
  useCargoTypeDistributionReport,
  usePickupRevenueReport,
} from "@/services/calls/queries";
import {
  useCargoReportsStore,
  useCargoTypeDistributionReportStore,
  useCustomerReportsStore,
  usePickupRevenueReportStore,
} from "@/utils/store";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ReportsPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Header />
      <main className="flex flex-col justify-start items-stretch gap-4 m-2 p-4 sm:px-6 sm:py-0 md:gap-14 my-2">
        <Tabs defaultValue="customers" className="w-full">
          <TabsList className="grid md:w-[600px] grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="customers">{t("customers")}</TabsTrigger>
            <TabsTrigger value="cargos">{t("cargo")}</TabsTrigger>
            <TabsTrigger value="pickupRevenue">{t("pickupRevenue")}</TabsTrigger>
            <TabsTrigger value="cargoTypes">{t("cargoTypeDistribution")}</TabsTrigger>
          </TabsList>
          <TabsContent value="customers">
            <CustomersReportTab />
          </TabsContent>
          <TabsContent value="cargos">
            <CargosReportTab />
          </TabsContent>
          <TabsContent value="pickupRevenue">
            <PickupRevenueReportTab />
          </TabsContent>
          <TabsContent value="cargoTypes">
            <CargoTypeDistributionTab />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
};

const CustomersReportTab = () => {
  const { t } = useTranslation();
  const {
    data,
    columns,
    currentPage,
    perPage,
    totalElements,
    totalPages,
    sortBy,
    order,
    searchCriteria,
    fromDate,
    toDate,
    setColumns,
    setPageNo,
    resetPageNo,
    setPerPage,
    setTotalElements,
    setTotalPages,
    setSearchCriteria,
    setSortBy,
    setOrder,
    setFromDate,
    setToDate,
    put,
  } = useCustomerReportsStore();

  const {
    data: customersPage,
    isLoading,
    isFetching,
    refetch,
  } = useCustomers(
    currentPage,
    perPage,
    sortBy,
    order,
    searchCriteria,
    fromDate,
    toDate
  );

  useEffect(() => {
    if (customersPage) {
      put(customersPage);
      setTotalPages(customersPage.totalPages ?? 0);
      setTotalElements(customersPage.totalElements ?? 0);
    }
  }, [customersPage, put, setTotalElements, setTotalPages]);

  useEffect(() => {
    refetch();
  }, [
    currentPage,
    perPage,
    sortBy,
    order,
    searchCriteria,
    fromDate,
    toDate,
    refetch,
  ]);

  useEffect(() => {
    setColumns([
      {
        header: () => (
          <Button
            variant="ghost"
            onClick={() => {
              setSortBy("createdAt");
              setOrder();
            }}
            className="flex items-center gap-2"
          >
            <span>{t("createdAt")}</span>
            {sortBy === "createdAt" ? (
              order === "asc" ? (
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
        header: t("customer"),
        accessorKey: "customer",
        cell: ({ row }) => (
          <Link to={`/customers/${row.original.id}`} className="text-primary">
            {row.original.firstName} {row.original.lastName}
          </Link>
        ),
      },
      {
        header: t("phoneNumber"),
        accessorKey: "phoneNumber",
        cell: ({ row }) => <p>{row.original.phoneNumber}</p>,
      },
      {
        header: t("email"),
        accessorKey: "email",
        cell: ({ row }) => <p>{row.original.email}</p>,
      },
    ]);
  }, [t, setColumns, setSortBy, setOrder, sortBy, order]);

  return (
    <DataTable
      loading={isLoading}
      refetching={isFetching}
      columns={columns}
      tableData={data?.content ?? []}
      pagination={{
        currentPage,
        totalPages,
        totalElements,
        perPage,
        order,
        sortBy,
      }}
      setPerPage={setPerPage}
      setSearchCriteria={setSearchCriteria}
      setPageNo={setPageNo}
      resetPageNo={resetPageNo}
      setFromDate={setFromDate}
      setToDate={setToDate}
      report="customers"
    />
  );
};

const CargosReportTab = () => {
  const { t } = useTranslation();
  const {
    data,
    columns,
    currentPage,
    perPage,
    totalElements,
    totalPages,
    sortBy,
    order,
    searchCriteria,
    fromDate,
    toDate,
    setColumns,
    setPageNo,
    resetPageNo,
    setPerPage,
    setTotalElements,
    setTotalPages,
    setSearchCriteria,
    setSortBy,
    setOrder,
    setFromDate,
    setToDate,
    put,
  } = useCargoReportsStore();

  const {
    data: cargosPage,
    isLoading,
    isFetching,
    refetch,
  } = useCargos(
    currentPage,
    perPage,
    sortBy,
    order,
    searchCriteria,
    fromDate,
    toDate,
    "",
    ""
  );

  useEffect(() => {
    if (cargosPage) {
      put(cargosPage);
      setTotalPages(cargosPage.totalPages ?? 0);
      setTotalElements(cargosPage.totalElements ?? 0);
    }
  }, [cargosPage, put, setTotalElements, setTotalPages]);

  useEffect(() => {
    refetch();
  }, [
    currentPage,
    perPage,
    sortBy,
    order,
    searchCriteria,
    fromDate,
    toDate,
    refetch,
  ]);

  useEffect(() => {
    setColumns([
      {
        header: () => (
          <Button
            variant="ghost"
            onClick={() => {
              setSortBy("createdAt");
              setOrder();
            }}
            className="flex items-center gap-2"
          >
            <span>{t("createdAt")}</span>
            {sortBy === "createdAt" ? (
              order === "asc" ? (
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
          <Link to={`/customers/${row.original.sender?.id}`} className="text-primary">
            {row.original.sender?.firstName} {row.original.sender?.lastName}
          </Link>
        ),
      },
      {
        header: t("receiver"),
        accessorKey: "receiver",
        cell: ({ row }) => (
          <Link to={`/customers/${row.original.receiver?.id}`} className="text-primary">
            {row.original.receiver?.firstName} {row.original.receiver?.lastName}
          </Link>
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
        header: () => (
          <Button
            variant="ghost"
            onClick={() => {
              setSortBy("quantity");
              setOrder();
            }}
            className="flex items-center gap-2"
          >
            <span>{t("quantity")}</span>
            {sortBy === "quantity" ? (
              order === "asc" ? (
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
    ]);
  }, [t, setColumns, setSortBy, setOrder, sortBy, order]);

  return (
    <DataTable
      loading={isLoading}
      refetching={isFetching}
      columns={columns}
      tableData={data?.content ?? []}
      pagination={{
        currentPage,
        totalPages,
        totalElements,
        perPage,
        order,
        sortBy,
      }}
      setPerPage={setPerPage}
      setSearchCriteria={setSearchCriteria}
      setPageNo={setPageNo}
      resetPageNo={resetPageNo}
      setFromDate={setFromDate}
      setToDate={setToDate}
      report="cargos"
    />
  );
};

const PickupRevenueReportTab = () => {
  const { t } = useTranslation();
  const {
    data,
    columns,
    searchCriteria,
    fromDate,
    toDate,
    setColumns,
    setSearchCriteria,
    setFromDate,
    setToDate,
    put,
  } = usePickupRevenueReportStore();

  const {
    data: revenueRows,
    isLoading,
    isFetching,
    refetch,
  } = usePickupRevenueReport(fromDate, toDate, searchCriteria);

  useEffect(() => {
    if (revenueRows) {
      put(revenueRows);
    }
  }, [revenueRows, put]);

  useEffect(() => {
    refetch();
  }, [fromDate, toDate, searchCriteria, refetch]);

  useEffect(() => {
    setColumns([
      {
        header: t("pickupLocation"),
        accessorKey: "pickupLocation",
        cell: ({ row }) => <p>{row.original.pickupLocation}</p>,
      },
      {
        header: t("totalRevenue"),
        accessorKey: "totalRevenue",
        cell: ({ row }) => <p>{row.original.totalRevenue.toFixed(2)}</p>,
      },
    ]);
  }, [t, setColumns]);

  return (
    <DataTable
      loading={isLoading}
      refetching={isFetching}
      columns={columns}
      tableData={data ?? []}
      pagination={{
        currentPage: 0,
        totalPages: 1,
        totalElements: data?.length ?? 0,
        perPage: data?.length ?? 0,
        order: "asc",
        sortBy: "pickupLocation",
      }}
      setPerPage={() => undefined}
      setSearchCriteria={setSearchCriteria}
      setPageNo={() => undefined}
      resetPageNo={() => undefined}
      setFromDate={setFromDate}
      setToDate={setToDate}
      paginationVisible={false}
      report="cargos/pickup-city-revenue"
    />
  );
};

const CargoTypeDistributionTab = () => {
  const { t } = useTranslation();
  const {
    data,
    columns,
    searchCriteria,
    fromDate,
    toDate,
    setColumns,
    setSearchCriteria,
    setFromDate,
    setToDate,
    put,
  } = useCargoTypeDistributionReportStore();

  const {
    data: typeRows,
    isLoading,
    isFetching,
    refetch,
  } = useCargoTypeDistributionReport(fromDate, toDate, searchCriteria);

  useEffect(() => {
    if (typeRows) {
      put(typeRows);
    }
  }, [typeRows, put]);

  useEffect(() => {
    refetch();
  }, [fromDate, toDate, searchCriteria, refetch]);

  useEffect(() => {
    setColumns([
      {
        header: t("cargoType"),
        accessorKey: "cargoType",
        cell: ({ row }) => <p>{row.original.cargoType}</p>,
      },
      {
        header: t("totalShipments"),
        accessorKey: "totalShipments",
        cell: ({ row }) => <p>{row.original.totalShipments}</p>,
      },
      {
        header: t("totalRevenue"),
        accessorKey: "totalRevenue",
        cell: ({ row }) => <p>{row.original.totalRevenue.toFixed(2)}</p>,
      },
    ]);
  }, [t, setColumns]);

  return (
    <DataTable
      loading={isLoading}
      refetching={isFetching}
      columns={columns}
      tableData={data ?? []}
      pagination={{
        currentPage: 0,
        totalPages: 1,
        totalElements: data?.length ?? 0,
        perPage: data?.length ?? 0,
        order: "asc",
        sortBy: "cargoType",
      }}
      setPerPage={() => undefined}
      setSearchCriteria={setSearchCriteria}
      setPageNo={() => undefined}
      resetPageNo={() => undefined}
      setFromDate={setFromDate}
      setToDate={setToDate}
      paginationVisible={false}
      report="cargos/type-distribution"
    />
  );
};

export default ReportsPage;
