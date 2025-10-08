import { useMemo } from "react";
import { ColumnDef } from "./data-table";
import { Skeleton } from "./ui/skeleton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "./ui/table";

export const Listing = ({
  data,
  columns,
  isLoading,
  headerShown = true,
  rowStyle,
  cellStyle,
}: {
  data: any;
  columns: ColumnDef[];
  isLoading?: boolean;
  headerShown?: boolean;
  rowStyle?: string;
  cellStyle?: string;
}) => {
  return (
    <>
      {!isLoading ? (
        <>
          {data?.length === 0 ? (
            <div className="flex justify-center items-center p-10">No data</div>
          ) : !data ? (
            <Skeleton className="w-full h-[200px]" />
          ) : (
            <Table>
              {headerShown && (
                <TableHeader>
                  <TableRow className={rowStyle}>
                    {columns.map((column) => (
                      <TableCell
                        key={column.header as string}
                        className={cellStyle}
                      >
                        {column.header as string}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
              )}
              <TableBody>
                {data.map((row: any, i: number) => (
                  <TableRow key={i} className={rowStyle}>
                    {columns.map((column) => (
                      <TableCell
                        key={column.header as string}
                        className={cellStyle}
                      >
                        {column.cell
                          ? column.cell({ row })
                          : row[column.accessorKey]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      ) : (
        <Skeleton className="w-full h-[200px]" />
      )}
    </>
  );
};

export const VerticalListing = ({
  data,
  columns,
  className,
  isLoading,
}: {
  data: any;
  columns: ColumnDef[];
  className?: string;
  isLoading?: boolean;
}) => {
  const hasData = useMemo(() => {
    return data && Object.keys(data).length > 0;
  }, [data]);

  if (isLoading) {
    return <Skeleton className="w-full h-[200px]" />;
  }

  if (!data) {
    return <Skeleton className="w-full h-[200px]" />;
  }

  if (!hasData) {
    return <div className="flex justify-center items-center p-10">No data</div>;
  }
  return (
    <>
      {!isLoading ? (
        <>
          {Object.keys(data)?.length === 0 ? (
            <div className="flex justify-center items-center p-10">No data</div>
          ) : !data ? (
            <Skeleton className="w-full h-[200px]" />
          ) : (
            <Table>
              <TableBody>
                {columns.map((column) => (
                  <TableRow key={column.header as string} className={className}>
                    <TableCell className="font-semibold">
                      {column.header as string}
                    </TableCell>
                    <TableCell>
                      {column.cell
                        ? column.cell?.({
                            row: data,
                          })
                        : getNestedValue(data, column.accessorKey) || "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      ) : (
        <Skeleton className="w-full h-[200px]" />
      )}
    </>
  );
};

const getNestedValue = (obj: Record<string, any>, path: string): any => {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
};
