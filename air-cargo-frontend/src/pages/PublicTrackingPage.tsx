import Stepper from "@/components/animated-stepper";
import SecureImage from "@/components/secure-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TitleWrapper } from "@/components/wrapper";
import {
  useCargoPhotos,
  usePublicCargoTrackingInformation,
} from "@/services/calls/queries";
import { CargoTracking, File } from "@/utils/types";
import { Link, LoaderCircleIcon, Search, Trash } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DialogWrapper from "@/components/re/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/lang-toggle";

export const PublicTrackingPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState(id || "");
  const [input, setInput] = useState(id || "");
  const trackingHistory = usePublicCargoTrackingInformation(search!);
  const { data: photos, isLoading: photosLoading } = useCargoPhotos(search!);

  return (
    <div className="m-6 flex flex-col gap-6">
      <div className="flex justify-between">
        <img src="/logo.png" alt="logo" className="h-12" />
        <form
          className="flex items-center gap-2 w-2/4"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(input);
          }}
        >
          <Input
            placeholder={t("enterTrackingNumber")}
            className="w-full"
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
          <Button type="submit" variant="outline">
            <Search size={16} className="text-primary" />
          </Button>
        </form>
        <ThemeToggle />
        <LanguageToggle />
      </div>
      {!trackingHistory.isLoading ? (
        <>
          <TitleWrapper title={t("gallery")}>
            {photosLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-4 w-full h-fit overflow-y-auto">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            ) : photos[0] ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-4 w-full h-fit overflow-y-auto">
                {photos?.map((file: File, index: number) => (
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
                          >
                            <p>
                              {t("confirmDeletePhoto")} {file.fileName}?
                            </p>
                          </DialogWrapper>
                          <a
                            href={file.fileUrl}
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
          <TitleWrapper
            title={t("tracking")}
            className="md:col-span-2 p-4 h-fit"
          >
            {trackingHistory.data?.length! > 0 ? (
              <Stepper
                steps={
                  trackingHistory.data?.map((history: CargoTracking, idx) => {
                    return {
                      number: idx,
                      label: history.location!,
                      date: history.updatedAt!,
                      status: history.history!,
                    };
                  })!
                }
                currentStep={trackingHistory.data?.length!}
              />
            ) : (
              <div className="flex justify-center items-center min-h-full">
                <p>{t("noTrackingHistory")}</p>
              </div>
            )}
          </TitleWrapper>
        </>
      ) : (
        <div className="flex justify-center mt-10">
          <LoaderCircleIcon className="w-12 h-12 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};
