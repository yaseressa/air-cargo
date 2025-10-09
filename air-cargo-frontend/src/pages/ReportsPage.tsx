import DataTable from "@/components/data-table";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCargoTypeDistributionReport,
  useCargos,
  useCustomers,
  useExpenseCurrencySummaryReport,
  useExpenseMonthlyTrendReport,
  usePickupRevenueReport,
} from "@/services/calls/queries";
import {
  useCargoReportsStore,
  useCargoTypeDistributionReportStore,
  useCustomerReportsStore,
  useExpenseCurrencySummaryStore,
  useExpenseMonthlyTrendStore,
  usePickupRevenueReportStore,
} from "@/utils/store";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ReportsPage = () => {
  const { t } = useTranslation();

  const reportOptions = useMemo(
    () => [
      {
        value: "customers",
        label: t("customers"),
        component: <CustomersReportSection />,
      },
      {
        value: "cargos",
        label: t("cargo"),
        component: <CargosReportSection />,
      },
      {
        value: "pickupRevenue",
        label: t("pickupRevenue"),
        component: <PickupRevenueReportSection />,
      },
      {
        value: "cargoTypes",
        label: t("cargoTypeDistribution"),
        component: <CargoTypeDistributionSection />,
      },
      {
        value: "expenseCurrency",
        label: t("expenseCurrencyBreakdown"),
        component: <ExpenseCurrencySummarySection />,
      },
      {
        value: "expenseTrend",
        label: t("expenseMonthlyTrend"),
        component: <ExpenseMonthlyTrendSection />,
      },
    ],
    [t]
  );

  const [selectedReport, setSelectedReport] = useState(
    reportOptions[0]?.value ?? "customers"
  );

  const activeReport =
    reportOptions.find((option) => option.value === selectedReport) ??
    reportOptions[0];

  return (
    <>
      <Header />
      <main className="flex flex-col gap-6 m-2 sm:py-0 md:gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center ">
          <div className="md:w-72">
            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger aria-label={t("selectReport") ?? "Select report"}>
                <SelectValue placeholder={t("selectReport") ?? ""} />
              </SelectTrigger>
              <SelectContent>
                {reportOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="min-h-[400px]">{activeReport?.component}</div>
      </main>
    </>
  );
};

const CustomersReportSection = () => {
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
        header: () => (
          <Button
            variant="ghost"
            onClick={() => {
              setSortBy("phoneNumber");
              setOrder();
            }}
            className="flex items-center gap-2"
          >
            <span>{t("phoneNumber")}</span>
            {sortBy === "phoneNumber" ? (
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

const CargosReportSection = () => {
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
          <Link
            to={`/customers/${row.original.sender?.id}`}
            className="text-primary"
          >
            {row.original.sender?.firstName} {row.original.sender?.lastName}
          </Link>
        ),
      },
      {
        header: t("receiver"),
        accessorKey: "receiver",
        cell: ({ row }) => (
          <Link
            to={`/customers/${row.original.receiver?.id}`}
            className="text-primary"
          >
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

const PickupRevenueReportSection = () => {
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
  } = usePickupRevenueReport(fromDate, toDate, searchCriteria);

  useEffect(() => {
    if (revenueRows) {
      put(revenueRows);
    }
  }, [revenueRows, put]);

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
        cell: ({ row }) => (
          <p>
            {new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: "USD",
            }).format(row.original.totalRevenue ?? 0)}
          </p>
        ),
      },
    ]);
  }, [t, setColumns]);

  return (
    <DataTable
      loading={isLoading}
      refetching={isFetching}
      columns={columns}
      tableData={data ?? []}
      setSearchCriteria={setSearchCriteria}
      setFromDate={setFromDate}
      setToDate={setToDate}
      searchCriteria={searchCriteria}
      headerShown
      paginationVisible={false}
      report="cargos/pickup-city-revenue"
    />
  );
};

const CargoTypeDistributionSection = () => {
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
    data: distributionRows,
    isLoading,
    isFetching,
  } = useCargoTypeDistributionReport(fromDate, toDate, searchCriteria);

  useEffect(() => {
    if (distributionRows) {
      put(distributionRows);
    }
  }, [distributionRows, put]);

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
        cell: ({ row }) => (
          <p>
            {new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: "USD",
            }).format(row.original.totalRevenue ?? 0)}
          </p>
        ),
      },
    ]);
  }, [t, setColumns]);

  return (
    <DataTable
      loading={isLoading}
      refetching={isFetching}
      columns={columns}
      tableData={data ?? []}
      setSearchCriteria={setSearchCriteria}
      setFromDate={setFromDate}
      setToDate={setToDate}
      searchCriteria={searchCriteria}
      headerShown
      paginationVisible={false}
      report="cargos/type-distribution"
    />
  );
};

const ExpenseCurrencySummarySection = () => {
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
  } = useExpenseCurrencySummaryStore();

  const {
    data: summaryRows,
    isLoading,
    isFetching,
  } = useExpenseCurrencySummaryReport(fromDate, toDate, searchCriteria);

  useEffect(() => {
    if (summaryRows) {
      put(summaryRows);
    }
  }, [summaryRows, put]);

  useEffect(() => {
    setColumns([
      {
        header: t("expenseCurrency"),
        accessorKey: "currencyCode",
        cell: ({ row }) => (
          <p className="uppercase font-medium">{row.original.currencyCode}</p>
        ),
      },
      {
        header: t("totalAmount"),
        accessorKey: "totalAmount",
        cell: ({ row }) => (
          <p>
            {new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: row.original.currencyCode ?? "USD",
            }).format(row.original.totalAmount ?? 0)}
          </p>
        ),
      },
      {
        header: t("expenseEntries"),
        accessorKey: "expenseCount",
        cell: ({ row }) => <p>{row.original.expenseCount}</p>,
      },
    ]);
  }, [t, setColumns]);

  return (
    <DataTable
      loading={isLoading}
      refetching={isFetching}
      columns={columns}
      tableData={data ?? []}
      setSearchCriteria={setSearchCriteria}
      setFromDate={setFromDate}
      setToDate={setToDate}
      searchCriteria={searchCriteria}
      headerShown
      paginationVisible={false}
      columnsShown={false}
      report="expenses/currency-breakdown"
    />
  );
};

const ExpenseMonthlyTrendSection = () => {
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
  } = useExpenseMonthlyTrendStore();

  const {
    data: trendRows,
    isLoading,
    isFetching,
  } = useExpenseMonthlyTrendReport(fromDate, toDate, searchCriteria);

  useEffect(() => {
    if (trendRows) {
      put(trendRows);
    }
  }, [trendRows, put]);

  useEffect(() => {
    setColumns([
      {
        header: t("period"),
        accessorKey: "period",
        cell: ({ row }) => <p>{row.original.period}</p>,
      },
      {
        header: t("expenseCurrency"),
        accessorKey: "currencyCode",
        cell: ({ row }) => (
          <p className="uppercase font-medium">{row.original.currencyCode}</p>
        ),
      },
      {
        header: t("totalAmount"),
        accessorKey: "totalAmount",
        cell: ({ row }) => (
          <p>
            {new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: row.original.currencyCode ?? "USD",
            }).format(row.original.totalAmount ?? 0)}
          </p>
        ),
      },
    ]);
  }, [t, setColumns]);

  return (
    <DataTable
      loading={isLoading}
      refetching={isFetching}
      columns={columns}
      tableData={data ?? []}
      setSearchCriteria={setSearchCriteria}
      setFromDate={setFromDate}
      setToDate={setToDate}
      searchCriteria={searchCriteria}
      headerShown
      paginationVisible={false}
      columnsShown={false}
      report="expenses/monthly-trend"
    />
  );
};

export default ReportsPage;
