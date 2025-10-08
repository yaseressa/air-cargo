import { ColumnDef } from "@/components/data-table";
import Header from "@/components/header";
import { Listing, VerticalListing } from "@/components/listing";
import DialogWrapper from "@/components/re/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { TitleWrapper } from "@/components/wrapper";
import {
  useDeleteCargo,
  useDeleteCustomer,
  useDeleteFile,
} from "@/services/calls/mutators";
import { useCustomer } from "@/services/calls/queries";
import {
  useReceivedCargoStore,
  useSelectedCustomerStore,
  useSentCargoStore,
} from "@/utils/store";
import {
  ArrowLeftSquare,
  PlusSquareIcon,
  SquarePen,
  Trash,
} from "lucide-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { mutate: deleteCargo } = useDeleteCargo();
  const customerStore = useSelectedCustomerStore();
  const [receivedCargoStore, sentCargoStore] = [
    useReceivedCargoStore(),
    useSentCargoStore(),
  ];
  const { data, isLoading: customerLoading } = useCustomer(id!);
  const [{ mutate: deleteCustomer }] = [useDeleteFile(), useDeleteCustomer()];
  const [verifyName, setVerifyName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 5;
  const [sentPage, setSentPage] = useState(0);
  const [receivedPage, setReceivedPage] = useState(0);

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
      cell: ({ row }) => {
        return (
          <Badge variant={"outline"}>
            {t("genderCategory." + row.gender.toLowerCase())}
          </Badge>
        );
      },
    },
  ];

  const sentCargoDetailsColumns: ColumnDef[] = [
    {
      header: t("createdAt"),
      accessorKey: t("createdAt"),
      cell: ({ row }) => <p>{row.createdAt}</p>,
    },
    {
      header: t("receiver"),
      accessorKey: t("receiver"),
      cell: ({ row }) => (
        <Button variant={"link"}>
          <Link to={"/customers/" + row.receiver.id}>
            {row.receiver.firstName} {row.receiver.lastName}
          </Link>
        </Button>
      ),
    },
    {
      header: t("pickupLocation"),
      accessorKey: t("pickupLocation"),
      cell: ({ row }) => <p>{row.pickupLocation}</p>,
    },
    {
      header: t("destination"),
      accessorKey: t("destination"),
      cell: ({ row }) => <p>{row.destination}</p>,
    },
    {
      header: t("cargoType"),
      accessorKey: t("cargoType"),
      cell: ({ row }) => <p>{row.cargoType}</p>,
    },
    {
      header: t("weight"),
      accessorKey: t("weight"),
      cell: ({ row }) => <p>{row.weight}</p>,
    },
    {
      header: t("quantity"),
      accessorKey: t("quantity"),
      cell: ({ row }) => <p>{row.quantity}</p>,
    },
    {
      header: t("totalWeight"),
      accessorKey: t("totalWeight"),
      cell: ({ row }) => <p>{row.weight}</p>,
    },
    {
      header: t("actions"),
      accessorKey: t("actions"),
      cell: ({ row }) => (
        <div className="flex gap-3">
          <Button
            variant={"ghost"}
            onClick={() =>
              navigate("/cargo/" + customerStore.customer?.id + "/" + row.id)
            }
          >
            <SquarePen size={16} className="text-primary" />
          </Button>
          <DialogWrapper
            title={t("deleteCargo")}
            key={row.id}
            trigger={
              <Button variant={"ghost"}>
                <Trash size={16} className="text-destructive" />
              </Button>
            }
            footer={
              <Button
                onClick={() => {
                  deleteCargo(row.id, {
                    onSuccess: () => {
                      sentCargoStore.deleteCargo(row.id);
                      navigate("/customers/" + row.sender.id);
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
  ];

  const receivedCargoDetailsColumns: ColumnDef[] = [
    {
      header: t("createdAt"),
      accessorKey: t("createdAt"),
      cell: ({ row }) => <p>{row.createdAt}</p>,
    },
    {
      header: t("sender"),
      accessorKey: t("sender"),
      cell: ({ row }) => (
        <Button variant={"link"}>
          <Link to={"/customers/" + row.sender.id}>
            {row.sender.firstName} {row.sender.lastName}
          </Link>
        </Button>
      ),
    },
    {
      header: t("pickupLocation"),
      accessorKey: t("pickupLocation"),
      cell: ({ row }) => <p>{row.pickupLocation}</p>,
    },
    {
      header: t("destination"),
      accessorKey: t("destination"),
      cell: ({ row }) => <p>{row.destination}</p>,
    },
    {
      header: t("cargoType"),
      accessorKey: t("cargoType"),
      cell: ({ row }) => <p>{row.cargoType}</p>,
    },
    {
      header: t("weight"),
      accessorKey: t("weight"),
      cell: ({ row }) => <p>{row.weight}</p>,
    },
    {
      header: t("quantity"),
      accessorKey: t("quantity"),
      cell: ({ row }) => <p>{row.quantity}</p>,
    },
    {
      header: t("totalWeight"),
      accessorKey: t("totalWeight"),
      cell: ({ row }) => <p>{row.weight}</p>,
    },
    {
      header: t("actions"),
      accessorKey: t("actions"),
      cell: ({ row }) => (
        <div className="flex gap-3">
          <Button
            variant={"ghost"}
            onClick={() => navigate("/cargo/" + row.sender.id + "/" + row.id)}
          >
            <SquarePen size={16} className="text-primary" />
          </Button>
        </div>
      ),
    },
  ];

  const totalSentPages = Math.ceil(
    (sentCargoStore.data?.length ?? 0) / ITEMS_PER_PAGE
  );
  const totalReceivedPages = Math.ceil(
    (receivedCargoStore.data?.length ?? 0) / ITEMS_PER_PAGE
  );

  const paginatedSentCargos = useMemo(() => {
    const start = sentPage * ITEMS_PER_PAGE;
    return (sentCargoStore.data ?? []).slice(start, start + ITEMS_PER_PAGE);
  }, [sentCargoStore.data, sentPage]);

  const paginatedReceivedCargos = useMemo(() => {
    const start = receivedPage * ITEMS_PER_PAGE;
    return (receivedCargoStore.data ?? []).slice(start, start + ITEMS_PER_PAGE);
  }, [receivedCargoStore.data, receivedPage]);

  useEffect(() => {
    const total = Math.ceil(
      (sentCargoStore.data?.length ?? 0) / ITEMS_PER_PAGE
    );
    if (sentPage > 0 && (total === 0 || sentPage >= total)) {
      setSentPage(Math.max(total - 1, 0));
    }
  }, [sentCargoStore.data, sentPage]);

  useEffect(() => {
    const total = Math.ceil(
      (receivedCargoStore.data?.length ?? 0) / ITEMS_PER_PAGE
    );
    if (receivedPage > 0 && (total === 0 || receivedPage >= total)) {
      setReceivedPage(Math.max(total - 1, 0));
    }
  }, [receivedCargoStore.data, receivedPage]);

  useEffect(() => {
    if (!customerLoading) {
      customerStore.setCustomer(data!);
      receivedCargoStore.put(data?.receivedCargo!);
      sentCargoStore.put(data?.sentCargo!);
      setLoading(false);
    }
  }, [customerLoading]);

  useEffect(() => {}, [customerStore.customer]);

  return (
    <>
      <Header />
      {!loading ? (
        <main className="flex flex-col justify-start items-stretch gap-4 md:gap-14 m-2 overflow-x-hidden">
          <div className="flex justify-between">
            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={() => navigate("/customers")}
            >
              <ArrowLeftSquare className="text-primary" size={20} />
            </Button>
            <div className="flex justify-center items-center">
              <Badge variant={"outline"}>
                {t("customerId")}: {customerStore.customer?.id!}
              </Badge>
            </div>
            <DialogWrapper
              title={t("deleteCustomer")}
              trigger={
                <Button variant={"ghost"} size={"icon"}>
                  <Trash size={20} className="text-destructive" />
                </Button>
              }
              footer={
                <Button
                  onClick={() => {
                    if (
                      verifyName.trim() ===
                      customerStore.customer?.firstName!.trim() +
                        " " +
                        customerStore.customer?.lastName!.trim()
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
              <Badge variant={"outline"}>{t("createdAt")}:</Badge>
              <p className="text-sm font-light">
                {customerStore.customer?.createdAt!}
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
              <Badge variant={"outline"}>{t("updatedAt")}:</Badge>
              <p className="text-sm font-light">
                {customerStore.customer?.updatedAt!}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-stretch gap-3">
            <TitleWrapper
              title={t("sentCargo")}
              modalNumber={0}
              optype="create"
              className="flex-1 animate-fade-right"
              trigger={
                <PlusSquareIcon
                  className="cursor-pointer"
                  size={16}
                  onClick={() =>
                    navigate("/cargo/" + customerStore.customer?.id + "/create")
                  }
                />
              }
            >
              <Listing
                columns={sentCargoDetailsColumns}
                data={paginatedSentCargos}
              />
              <div className="mt-3 flex items-center justify-end gap-2">
                <span className="text-xs text-muted-foreground">
                  {totalSentPages > 0
                    ? `${sentPage + 1} / ${totalSentPages}`
                    : "0 / 0"}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={sentPage === 0 || totalSentPages === 0}
                  onClick={() => setSentPage((prev) => Math.max(prev - 1, 0))}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  <span className="sr-only">
                    {t("pagination.previousPage")}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={
                    totalSentPages === 0 || sentPage >= totalSentPages - 1
                  }
                  onClick={() =>
                    setSentPage((prev) =>
                      Math.min(prev + 1, Math.max(totalSentPages - 1, 0))
                    )
                  }
                >
                  <ChevronRightIcon className="h-4 w-4" />
                  <span className="sr-only">{t("pagination.nextPage")}</span>
                </Button>
              </div>
            </TitleWrapper>
            <TitleWrapper
              title={t("receivedCargo")}
              modalNumber={4}
              className="flex-1 animate-fade-left fade-in-90"
            >
              <Listing
                columns={receivedCargoDetailsColumns}
                data={paginatedReceivedCargos}
              />
              <div className="mt-3 flex items-center justify-end gap-2">
                <span className="text-xs text-muted-foreground">
                  {totalReceivedPages > 0
                    ? `${receivedPage + 1} / ${totalReceivedPages}`
                    : "0 / 0"}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={receivedPage === 0 || totalReceivedPages === 0}
                  onClick={() =>
                    setReceivedPage((prev) => Math.max(prev - 1, 0))
                  }
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  <span className="sr-only">
                    {t("pagination.previousPage")}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={
                    totalReceivedPages === 0 ||
                    receivedPage >= totalReceivedPages - 1
                  }
                  onClick={() =>
                    setReceivedPage((prev) =>
                      Math.min(prev + 1, Math.max(totalReceivedPages - 1, 0))
                    )
                  }
                >
                  <ChevronRightIcon className="h-4 w-4" />
                  <span className="sr-only">{t("pagination.nextPage")}</span>
                </Button>
              </div>
            </TitleWrapper>
          </div>
        </main>
      ) : (
        ""
      )}
    </>
  );
};
