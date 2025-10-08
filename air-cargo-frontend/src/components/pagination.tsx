import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export default ({
  table,
  setPageNo,
  resetPageNo,
  setPerPage,
  pageInfo,
}: {
  table: any;
  setPageNo: Function;
  resetPageNo: Function;
  setPerPage: Function;
  pageInfo: {
    pageNo: number;
    perPage: number;
    totalPages: number;
    totalElements: number;
    last: boolean;
    first: boolean;
  };
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center ">
        <div className="flex items-center">
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value: string) => {
              table.setPageSize(Number(value));
              setPerPage(Number(value));
              resetPageNo();
            }}
          >
            <SelectTrigger className="h-8 w-[70px] text-primary">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 15].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-xs font-medium w-[80px] flex justify-center items-center">
          {t("pagination.pageInfo", {
            current: pageInfo?.pageNo,
            total: pageInfo?.totalPages,
          })}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setPageNo(-1)}
            disabled={pageInfo.first}
          >
            <span className="sr-only">{t("pagination.previousPage")}</span>
            <ChevronLeftIcon className="h-4 w-4 text-primary" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setPageNo(1)}
            disabled={pageInfo.last}
          >
            <span className="sr-only">{t("pagination.nextPage")}</span>
            <ChevronRightIcon className="h-4 w-4 text-primary" />
          </Button>
        </div>
      </div>
    </div>
  );
};
