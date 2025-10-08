import { CargoForm } from "@/components/cargo-form";
import CargoExpensesSection from "@/components/cargo-expenses-section";
import Header from "@/components/header";
import DialogWrapper from "@/components/re/dialog";
import SecureImage from "@/components/secure-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { TitleWrapper } from "@/components/wrapper";
import { useDeleteCargo, useDeleteFile } from "@/services/calls/mutators";
import {
  useCargo,
  useCargoPhotos,
  useCargoTrackingInformation,
  useCustomer,
  useSendCargoInformation,
} from "@/services/calls/queries";
import {
  useCargoTrackingsStore,
  useFilesStore,
  useModalNumber,
  useSelectedCargoStore,
  useSelectedCargoTabStore,
  useSelectedCargoTrackingStore,
  useSenderStore,
  useToggleCreateStore,
} from "@/utils/store";
import { Cargo, CargoTracking, File } from "@/utils/types";
import { buildFileUrl } from "@/utils";
import {
  AlertCircle,
  ArrowLeftSquare,
  CalendarDays,
  CheckCircle,
  Clock,
  Link,
  Loader2,
  PackageSearch,
  Scroll,
  Send,
  Trash,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Barcode from "react-barcode";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Stepper from "@/components/animated-stepper";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const TicketContent = ({ cargo }: { cargo?: Cargo }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-md mx-auto  shadow-xl rounded-lg overflow-hidden border ">
      <div className="bg-gradient-to-r from-primary to-secondary p-4">
        <div className="flex items-center justify-center">
          <h1 className=" text-2xl font-bold">{t("cargoBoardingPass")}</h1>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="w-1/2">
            <div className="text-xs uppercase tracking-wide">{t("sender")}</div>
            <div className="text-gray-800 font-medium">
              {cargo?.sender?.firstName || t("notAvailable")}{" "}
              {cargo?.sender?.lastName || ""}
            </div>
            <div className="text-gray-800 font-medium">
              {cargo?.sender?.phoneNumber || t("notAvailable")}
            </div>
            <div className="text-xs">
              {cargo?.sender?.email || t("notAvailable")}
            </div>
            <div className="text-xs">
              {cargo?.sender?.address || t("notAvailable")}
            </div>
          </div>
          <div className="w-1/2 text-right">
            <div className="text-xs uppercase tracking-wide">
              {t("receiver")}
            </div>
            <div className="text-gray-800 font-medium">
              {cargo?.receiver?.firstName || t("notAvailable")}{" "}
              {cargo?.receiver?.lastName || ""}
            </div>
            <div className="text-gray-800 font-medium">
              {cargo?.receiver?.phoneNumber || t("notAvailable")}
            </div>
            <div className="text-xs">
              {cargo?.receiver?.email || t("notAvailable")}
            </div>
            <div className="text-xs">
              {cargo?.receiver?.address || t("notAvailable")}
            </div>
          </div>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dashed "></div>
          </div>
          <div className="relative flex justify-center">
            <span className=" px-2 text-xs uppercase">{t("cargoDetails")}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide">
              {t("description")}
            </div>
            <div className="">{cargo?.description || t("notAvailable")}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide">
              {t("quantity")}
            </div>
            <div>{cargo?.quantity || t("notAvailable")}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide">
              {t("unitWeight")}
            </div>
            <div>
              {cargo?.weight || t("notAvailable")} {t("kg")}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide">
              {t("totalWeight")}
            </div>
            <div>
              {cargo?.totalWeight || t("notAvailable")} {t("kg")}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 p-4 flex flex-col justify-between items-center gap-4">
        <div className="flex flex-col items-center">
          {cargo?.id && (
            <Barcode
              value={String(cargo?.id || 0)}
              width={1}
              height={40}
              fontSize={10}
              background="#fff"
            />
          )}
        </div>
        <div className="text-xs flex justify-center gap-5">
          <div>
            {new Date(cargo?.createdAt!).toLocaleString() || t("notAvailable")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default () => {
  const { t } = useTranslation();
  const { customerId, cargoId } = useParams();
  const { data: photos, isLoading: isPhotosLoading } = useCargoPhotos(cargoId!);
  const { mutate: deleteFile } = useDeleteFile();
  const photosStore = useFilesStore();
  const [whatsId, setWhatsId] = useState<string | null>(null);
  const sendWhatsapp = useSendCargoInformation(whatsId!);
  const toggle = useToggleCreateStore();
  const tab = useSelectedCargoTabStore();
  const [verifyName, setVerifyName] = useState("");
  const cargoTrackingStore = useSelectedCargoTrackingStore();
  const modalNumber = useModalNumber();
  const trackingsStore = useCargoTrackingsStore();
  const cargo = useSelectedCargoStore();

  const trackingHistory = useCargoTrackingInformation(cargo.cargo?.id);

  const { mutate: deleteCargo } = useDeleteCargo();
  const [
    { data: cargoData, isLoading: isCargoLoading, isError: isCargoError },
    { data: customerData, isLoading: isCustomerLoading },
  ] = [useCargo(cargoId!), useCustomer(customerId!)];
  const [senderStore, cargoStore] = [useSenderStore(), useSelectedCargoStore()];
  const navigate = useNavigate();

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: t("cargoTicket"),
  });

  useEffect(() => {
    if (!isCargoLoading && !isCargoError) {
      cargoStore.setCargo(cargoData!);
    }
  }, [isCargoLoading]);

  useEffect(() => {
    toggle.setCreate(cargoId === "create");
    return () => {
      tab.setSelectedCargoTab("general");
      cargoTrackingStore.resetCargoTracking();
      cargo.resetCargo();
    };
  }, []);

  useEffect(() => {
    if (trackingHistory.data) {
      trackingsStore.put(trackingHistory.data);
    }
  }, [trackingHistory.isLoading, trackingHistory.data]);

  useEffect(() => {
    if (!isPhotosLoading) {
      photosStore.setFiles(photos!);
    }
  }, [isPhotosLoading]);

  useEffect(() => {
    if (!isCustomerLoading) {
      senderStore.setCustomer(customerData!);
      return;
    }
    senderStore.setCustomer({});
  }, [isCustomerLoading]);

  useEffect(() => {
    if (sendWhatsapp.isSuccess) {
      toast({
        title: t("cargoSent"),
        description: t("cargoSentSuccess"),
      });
      setWhatsId(null);
    }
  }, [sendWhatsapp.isSuccess]);

  return (
    <>
      <Header />
      <main className="flex flex-col gap-4 md:gap-2 m-2">
        <Tabs
          onValueChange={tab.setSelectedCargoTab}
          value={tab.selectedCargoTab}
          className="flex flex-col gap-2"
        >
          <TabsList className="self-start">
            <TabsTrigger value="general">{t("information")}</TabsTrigger>
            <TabsTrigger value="gallery" disabled={toggle.create}>
              {t("gallery")}
            </TabsTrigger>
            <TabsTrigger value="expenses" disabled={toggle.create}>
              {t("expenses")}
            </TabsTrigger>
            <TabsTrigger value="tracking" disabled={toggle.create}>
              {t("tracking")}
            </TabsTrigger>
          </TabsList>
          <div className="flex justify-between">
            <Button
              size={"icon"}
              variant={"outline"}
              onClick={() => navigate("/cargos")}
              aria-label={t("goBack")}
            >
              <ArrowLeftSquare className="text-primary" size={20} />
            </Button>
            <div className="flex items-center">
              {!toggle.create && cargoStore.cargo?.referenceNumber && (
                <Badge variant={"outline"}>
                  {t("cargoId")}: {cargoStore.cargo?.referenceNumber || 0}
                </Badge>
              )}
            </div>
            {!toggle.create && (
              <div className="flex items-center gap-4">
                <DialogWrapper
                  title={t("sendCargo")}
                  trigger={
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label={t("sendCargo")}
                      disabled={sendWhatsapp.isLoading}
                    >
                      {sendWhatsapp.isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="text-primary h-5 w-5" />
                      )}
                    </Button>
                  }
                  footer={
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          if (!cargoStore.cargo) {
                            toast({
                              title: t("error"),
                              description: t("noCargoSelected"),
                              variant: "destructive",
                            });
                            return;
                          }

                          if (
                            !cargoStore.cargo.receiver?.phoneNumber ||
                            !cargoStore.cargo.sender?.phoneNumber
                          ) {
                            toast({
                              title: t("error"),
                              description: t("missingPhoneNumbers"),
                              variant: "destructive",
                            });
                            return;
                          }

                          setWhatsId(cargo.cargo?.id!);
                        }}
                        disabled={sendWhatsapp.isLoading}
                      >
                        {sendWhatsapp.isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("sending")}
                          </>
                        ) : (
                          t("send")
                        )}
                      </Button>
                    </div>
                  }
                >
                  <div className="flex flex-col gap-4">
                    <p>{t("confirmSendWhatsAppDescription")}</p>

                    {cargoStore.cargo && (
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{t("preview")}</h4>
                        <div className="text-sm space-y-1">
                          <p>
                            <strong>{t("sender")}:</strong>{" "}
                            {cargoStore.cargo.sender?.firstName}{" "}
                            {cargoStore.cargo.sender?.lastName}
                          </p>
                          <p>
                            <strong>{t("receiver")}:</strong>{" "}
                            {cargoStore.cargo.receiver?.firstName}{" "}
                            {cargoStore.cargo.receiver?.lastName}
                          </p>
                          <p>
                            <strong>{t("trackingNumber")}:</strong>{" "}
                            {cargoStore.cargo.referenceNumber || 0}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogWrapper>
                <Button
                  size={"icon"}
                  variant={"outline"}
                  onClick={() => handlePrint()}
                  aria-label={t("printTicket")}
                >
                  <Scroll className="text-primary h-5 w-5" />
                </Button>
                <DialogWrapper
                  title={t("deleteCargo")}
                  trigger={
                    <Button
                      variant={"outline"}
                      size={"icon"}
                      aria-label={t("deleteCargo")}
                    >
                      <Trash className="text-destructive h-5 w-5" />
                    </Button>
                  }
                  footer={
                    <Button
                      onClick={() => {
                        if (
                          verifyName.trim() ===
                          cargoStore.cargo?.sender?.firstName!.trim() +
                            " " +
                            cargoStore.cargo?.sender?.lastName!.trim()
                        ) {
                          deleteCargo(cargoStore.cargo?.id!, {
                            onSuccess: () => {
                              toast({
                                title: t("cargoDeleted"),
                                description: t("cargoDeletedSuccess"),
                              });
                              navigate("/customers");
                            },
                            onError: () => {
                              toast({
                                title: t("error"),
                                description: t("deleteCargoFailed"),
                                variant: "destructive",
                              });
                            },
                          });
                        } else {
                          toast({
                            title: t("error"),
                            description: t("verifyCargoName"),
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      {t("delete")}
                    </Button>
                  }
                >
                  <div className="flex flex-col gap-2">
                    <p>
                      {t("confirmDeleteCargo")}{" "}
                      <code className="bg-muted rounded-md p-1">
                        {cargoStore.cargo?.sender?.firstName}{" "}
                        {cargoStore.cargo?.sender?.lastName}
                      </code>
                      ?
                    </p>
                    <Input
                      placeholder={t("typeNameToConfirm")}
                      onChange={(e) => setVerifyName(e.target.value)}
                    />
                  </div>
                </DialogWrapper>
              </div>
            )}
          </div>
          <TabsContent value="general">
            <CargoForm />
          </TabsContent>
          <TabsContent value="gallery">
            {!toggle.create && (
              <TitleWrapper
                title={t("gallery")}
                modalNumber={3}
                optype="create"
              >
                {isPhotosLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-4 w-full h-fit overflow-y-auto">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <Skeleton
                        key={index}
                        className="h-32 w-full rounded-lg"
                      />
                    ))}
                  </div>
                ) : photosStore?.files?.[0] ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-4 w-full h-fit overflow-y-auto">
                    {photosStore?.files.map((file: File, index: number) => (
                      <div
                        key={index}
                        className="group relative aspect-square overflow-hidden rounded-lg border bg-background"
                      >
                        <SecureImage
                          fileURL={file.fileUrl}
                          fileName={file.fileName}
                          className="h-full w-full object-cover transition-all hover:scale-105"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-background/80 p-2 backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium md:block hidden">
                              {file.fileName.slice(0, 20)}
                            </span>
                            <div className="flex gap-2 md:justify-start justify-center w-full md:w-auto">
                              <DialogWrapper
                                title={t("deletePhoto")}
                                key={file.id}
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    aria-label={t("deletePhoto")}
                                  >
                                    <Trash className="h-4 w-4 text-destructive" />
                                  </Button>
                                }
                                footer={
                                  <div className="flex gap-2">
                                    <Button
                                      variant="destructive"
                                      onClick={() => {
                                        deleteFile(file.id, {
                                          onSuccess: () => {
                                            toast({
                                              title: t("imageDeleted"),
                                              description: t(
                                                "imageDeletedSuccess"
                                              ),
                                            });
                                          },
                                          onError: () => {
                                            toast({
                                              title: t("error"),
                                              description:
                                                t("deleteImageFailed"),
                                            });
                                          },
                                        });
                                        photosStore.deleteFile(file.id);
                                      }}
                                    >
                                      {t("delete")}
                                    </Button>
                                  </div>
                                }
                              >
                                <p>
                                  {t("confirmDeletePhoto")} {file.fileName}?
                                </p>
                              </DialogWrapper>
                              <a
                                href={buildFileUrl(file.fileUrl)}
                                target="_blank"
                                download={file.fileName}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  aria-label={t("downloadImage")}
                                >
                                  <Link className="h-4 w-4 text-primary" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center items-center min-h-full w-full">
                    <p>{t("noImagesFound")}</p>
                  </div>
                )}
              </TitleWrapper>
            )}
          </TabsContent>
          <TabsContent value="expenses">
            {!toggle.create && cargoId && cargoId !== "create" && (
              <CargoExpensesSection cargoId={cargoId} />
            )}
          </TabsContent>
          <TabsContent value="tracking">
            {!toggle.create && (
              <TitleWrapper
                title={t("tracking")}
                className="md:col-span-2 p-4 h-fit"
                optype="create"
                modalNumber={12}
              >
                {trackingsStore.data?.length! > 0 ? (
                  <Stepper
                    steps={
                      trackingsStore.data?.map(
                        (history: CargoTracking, idx: number) => {
                          return {
                            number: idx,
                            label: history.location!,
                            date: history.updatedAt!,
                            status: history.history!,
                          };
                        }
                      )!
                    }
                    currentStep={trackingHistory.data?.length! - 1}
                    onStepClick={(stepNumber: any) => {
                      modalNumber.setModalNumberAndType(12, "update");
                      cargoTrackingStore.setCargoTracking(
                        trackingHistory.data![stepNumber]
                      );
                    }}
                  />
                ) : (
                  <div className="flex justify-center items-center min-h-full">
                    <p>{t("noTrackingHistory")}</p>
                  </div>
                )}
              </TitleWrapper>
            )}
          </TabsContent>
        </Tabs>

        {/* Hidden container for printing the flight-style ticket */}
        <div style={{ display: "none" }}>
          <div ref={printRef}>
            <TicketContent cargo={cargoStore.cargo} />
          </div>
        </div>
      </main>
    </>
  );
};
