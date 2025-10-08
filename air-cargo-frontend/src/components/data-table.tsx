import * as React from "react";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import {
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Filter, Plus, Search } from "lucide-react";
import Pagination from "@/components/pagination";
import { addYears, format } from "date-fns";
import { PaginationType } from "@/utils/types";
import { Skeleton } from "./ui/skeleton";
import { useModalNumber } from "@/utils/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { FilteredReportGenerator } from "./report-generators";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export type ColumnDef = {
  header: ((column: any) => React.ReactNode) | string;
  accessorKey: string;
  cell?: (row: any) => React.ReactNode;
};
export type DateRange = {
  from?: Date | string | undefined;
  to?: Date | string | undefined;
};

export default ({
  pagination,
  tableData,
  columns,
  setPageNo,
  setPerPage,
  resetPageNo,
  loading,
  refetching,
  setFromDate,
  setToDate,
  setSearchCriteria,
  create,
  headerShown = true,
  paginationVisible = true,
  report = "",
  selectValues,
  setSelected,
  statuses,
  setStatus,
  searchCriteria,
  setFilter,
  columnsShown = true,
  createLink,
  selectables,
}: {
  pagination?: PaginationType;
  tableData: any[];
  columns: ColumnDef[];
  setPageNo?: Function;
  setPerPage?: Function;
  resetPageNo?: Function;
  setSearchCriteria?: Function;
  loading: boolean;
  refetching: boolean;
  setFromDate?: Function;
  setToDate?: Function;
  create?: number;
  headerShown?: boolean;
  paginationVisible?: boolean;
  report?: string;
  selectValues?: string[];
  setSelected?: Function;
  statuses?: {
    label: string;
    value: string;
  }[];
  setStatus?: Function;
  searchCriteria?: string;
  setFilter?: Function;
  columnsShown?: boolean;
  createLink?: string;
  selectables?: React.ReactElement;
}) => {
  return (
    <>
      {!loading && tableData ? (
        <DataTableCore
          pagination={pagination}
          tableData={tableData}
          columns={columns}
          setPageNo={setPageNo}
          setPerPage={setPerPage}
          create={create}
          setFromDate={setFromDate}
          setToDate={setToDate}
          setSearchCriteria={setSearchCriteria}
          headerShown={headerShown}
          paginationVisible={paginationVisible}
          refetching={refetching}
          report={report}
          selectValues={selectValues}
          resetPageNo={resetPageNo}
          setSelected={setSelected}
          statuses={statuses}
          setStatus={setStatus}
          searchCriteria={searchCriteria}
          setFilter={setFilter}
          columnsShown={columnsShown}
          createLink={createLink}
          selectables={selectables}
        />
      ) : (
        <DataTableSkeleton />
      )}
    </>
  );
};

const DataTableCore = ({
  pagination,
  tableData,
  columns,
  setPageNo,
  setPerPage,
  resetPageNo,
  refetching,
  setFromDate,
  setToDate,
  setSearchCriteria,
  create,
  headerShown = true,
  paginationVisible = true,
  report,
  selectValues,
  setSelected,
  statuses,
  setStatus,
  searchCriteria,
  setFilter,
  columnsShown = true,
  createLink,
  selectables,
}: {
  pagination?: PaginationType;
  tableData: any[];
  columns: ColumnDef[];
  setPageNo?: Function;
  setPerPage?: Function;
  resetPageNo?: Function;
  setSearchCriteria?: Function;
  refetching: boolean;
  setFromDate?: Function;
  setToDate?: Function;
  create?: number;
  headerShown?: boolean;
  paginationVisible?: boolean;
  report?: string;
  selectValues?: string[];
  setSelected?: Function;
  statuses?: {
    label: string;
    value: string;
  }[];
  setStatus?: Function;
  searchCriteria?: string;
  setFilter?: Function;
  columnsShown?: boolean;
  createLink?: string;
  selectables?: React.ReactElement;
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const modalNumber = useModalNumber();
  const [currStatus, setCurrStatus] = React.useState<string>("");
  const [select, setSelect] = React.useState<string>("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>(
    searchCriteria || ""
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: format(addYears(new Date(), -1), "yyyy-MM-dd'T'HH:mm"),
    to: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });

  const table = useReactTable({
    data: tableData,
    columns: columns,
    onSortingChange: setSorting,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
  });

  const search = () => {
    setSearchCriteria!(globalFilter);
    setSelect(" ");
    if (setFromDate && setToDate) {
      setFromDate(new Date(dateRange.from!).toISOString());
      setToDate(new Date(dateRange.to!).toISOString());
    }
  };

  React.useEffect(() => {
    if (table && pagination) {
      table.setPageIndex(pagination.currentPage || 0);
      table.setPageSize(pagination.perPage || 10);
    }
  }, [table, pagination]);

  React.useEffect(() => {
    return () => {
      setSearchCriteria!("");
    };
  }, []);

  return (
    <div className="px-4 py-2  duration-300 border rounded bg-background">
      <div className="animate-fade-up !border-none">
        {headerShown && (
          <div className="flex md:flex-row flex-col md:items-stretch items-stretch md:gap-0 gap-2 py-4 font-semibold">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex md:flex-row md:justify-stretch md:items-center flex-col gap-1 w-full"
            >
              <Input
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className={`${
                  columnsShown ? "md:w-[300px]" : "md:flex-1"
                } rounded placeholder:text-primary/40`}
                placeholder={t("searchPlaceholder")}
                onSubmitCapture={search}
              />
              {setToDate && (
                <div className="flex gap-1 items-center flex-row ">
                  <Input
                    type="datetime-local"
                    value={dateRange.from! as string}
                    className="md:w-[230px] rounded placeholder:text-primary/40 text-primary/90"
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
                    className="md:w-[230px] rounded placeholder:text-primary/40 text-primary/90"
                    onChange={(e) =>
                      setDateRange((v) => ({
                        ...v,
                        to: e.target.value,
                      }))
                    }
                  />
                </div>
              )}
              {selectables && selectables}
              <Button
                variant={"outline"}
                className="shadow-none p-2"
                onClick={search}
              >
                <Search className="text-primary" />
              </Button>
            </form>
            <div
              className={cn("flex flex-row gap-2 xl:flex-nowrap ", {
                "flex-wrap ": report,
              })}
            >
              {(create || createLink) && (
                <Button
                  variant={"outline"}
                  className="shadow-none md:p-2 flex-1 lg:w-auto"
                  onClick={() => {
                    if (create) {
                      setSelected?.({});
                      modalNumber.setModalNumberAndType(create, "create");
                    } else {
                      navigate(createLink!);
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              {selectValues && (
                <Select
                  value={select}
                  onValueChange={(value) => {
                    setFilter?.(value.trim());
                    setSelect(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={<Filter className="h-3 w-3" />} />
                  </SelectTrigger>
                  <SelectContent>
                    <>
                      <SelectItem value=" ">{t("all")}</SelectItem>
                      {selectValues.map((value) => (
                        <SelectItem key={value} value={value.toLowerCase()}>
                          {value}
                        </SelectItem>
                      ))}
                    </>
                  </SelectContent>
                </Select>
              )}
              {columnsShown && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      {t("columns")} <ChevronDownIcon className="h-2 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                            }
                          >
                            {column.id}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {report && (
                <FilteredReportGenerator
                  reportPath={report}
                  dateRange={{
                    from: new Date(dateRange.from as string),
                    to: new Date(dateRange.to as string),
                  }}
                  searchCriteria={globalFilter}
                />
              )}
            </div>
          </div>
        )}
        <div className="w-full overflow-x-scroll">
          {statuses && setStatus && (
            <div className="flex flex-row gap-2 mb-4">
              {statuses.map((status) => {
                if (status.value.toLowerCase() === "all")
                  return (
                    <Badge
                      key={status.value}
                      variant={currStatus === "" ? "default" : "outline"}
                      className="shadow-none p-2 cursor-pointer"
                      onClick={() => {
                        setStatus("");
                        setCurrStatus("");
                        resetPageNo!();
                      }}
                    >
                      {t(status.label)}
                    </Badge>
                  );
                return (
                  <Badge
                    key={status.value}
                    variant={
                      status.value === currStatus ? "default" : "outline"
                    }
                    className="shadow-none p-2 cursor-pointer"
                    onClick={() => {
                      setStatus(
                        status.value.toUpperCase() == "ALL"
                          ? ""
                          : status.value.toUpperCase()
                      );
                      setCurrStatus(status.value);
                      resetPageNo!();
                    }}
                  >
                    {t(status.label.toLowerCase())}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
        <div className="rounded border md:text-base text-sm overflow-hidden">
          <Table
            aria-disabled={refetching}
            className={`transition-all duration-300 mb-5 ${
              refetching ? "opacity-50" : "opacity-100"
            }`}
          >
            <TableHeader className="border-b-2 border-primary">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="text-primary h-[50px]"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table?.getRowModel()?.rows?.length ? (
                table.getRowModel().rows.map((row, idx: number) => (
                  <TableRow
                    key={row.id}
                    className={`animate-fade-up transition-all duration-300 delay-${
                      idx * 100 + "ms"
                    } ${row.getIsSelected() ? "bg-primary" : ""}`}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {t("noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <Separator className="bg-input" />
        <div className="flex items-center justify-end py-4">
          <div>
            {paginationVisible && (
              <Pagination
                table={table}
                setPageNo={setPageNo!}
                resetPageNo={resetPageNo!}
                setPerPage={setPerPage!}
                pageInfo={{
                  totalPages: pagination?.totalPages!,
                  pageNo: pagination?.currentPage! + 1,
                  perPage: pagination?.perPage!,
                  totalElements: pagination?.totalElements!,
                  last:
                    isNaN(pagination?.currentPage!) ||
                    pagination?.currentPage! + 1 === pagination?.totalPages,
                  first:
                    isNaN(pagination?.currentPage!) ||
                    pagination?.currentPage! === 0,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DataTableSkeleton = () => {
  return (
    <div className="px-4 py-2 w-full animate-fade-down duration-300 border rounded overflow-hidden">
      <div className="w-full animate-fade-up !border-none">
        {/* Header Section Skeleton */}
        <div className="flex md:flex-row flex-col md:items-center items-stretch md:gap-0 gap-2 py-4 font-semibold">
          <div className="flex flex-1">
            <div className="flex md:flex-row flex-col gap-1 w-full">
              <Skeleton className="md:w-[300px] h-10 rounded" />
              <div className="flex gap-1 items-center flex-row">
                <Skeleton className="md:w-[230px] h-10 rounded" />
                <Skeleton className="md:w-[230px] h-10 rounded" />
              </div>
              <Skeleton className="h-10 w-10 rounded" />
            </div>
          </div>
          <div className="flex flex-row gap-2 xl:flex-nowrap flex-wrap">
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-10 w-24 rounded" />
            <Skeleton className="h-10 w-24 rounded" />
          </div>
        </div>

        {/* Table Section Skeleton */}
        <div className="mb-5">
          <div className="border-b-2 border-primary">
            <Skeleton className="h-[50px] w-full" />
          </div>
          <div className="space-y-2 mt-2">
            {[...Array(5)].map((_, idx) => (
              <Skeleton key={idx} className="h-12 w-full" />
            ))}
          </div>
        </div>

        {/* Pagination Section Skeleton */}
        <div className="flex items-center justify-end py-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded" />
            <Skeleton className="h-10 w-24 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};
