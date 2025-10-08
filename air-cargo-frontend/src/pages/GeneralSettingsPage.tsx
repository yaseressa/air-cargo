import { AccessControl } from "@/components/access-control";
import { ColumnDef } from "@/components/data-table";
import FxRatesListing from "@/components/fx-rates-listing";
import { Listing } from "@/components/listing";
import { LocationForm } from "@/components/location-form";
import DialogWrapper from "@/components/re/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { TitleWrapper } from "@/components/wrapper";
import { useDeleteLocation } from "@/services/calls/mutators";
import { useLocations } from "@/services/calls/queries";
import { useLocationsStore, useLocationStore } from "@/utils/store";
import { PenBox, Trash } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const GeneralSettingsPage = () => {
  return (
    <>
      <LocationArea />
    </>
  );
};

export default GeneralSettingsPage;

const LocationArea = () => {
  const { t } = useTranslation();
  const { data: locationData, isLoading: isLocationLoading } = useLocations();
  const { mutate: deleteLocation } = useDeleteLocation();

  const locationsStore = useLocationsStore();
  const locationStore = useLocationStore();

  const locationColumns: ColumnDef[] = [
    {
      header: t("location"),
      accessorKey: "name",
    },
    {
      header: t("country"),
      accessorKey: "country",
    },
    {
      header: t("actions"),
      accessorKey: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex">
            <DialogWrapper
              key={row?.id}
              title={t("deleteLocation")}
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
                    deleteLocation(row.id, {
                      onSuccess: () => {
                        locationsStore.deleteLocation(row.id);
                        toast({
                          title: t("locationDeleted"),
                          description: t("locationDeletedSuccessfully"),
                        });
                      },
                      onError: () => {
                        toast({
                          title: t("error"),
                          description: t("failedToDeleteLocation"),
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
                {t("confirmDeleteLocation")} {row.name} ?
              </p>
            </DialogWrapper>

            <LocationForm
              action="update"
              trigger={
                <Button
                  variant="ghost"
                  className="p-2"
                  onClick={() => locationStore.setLocation(row)}
                >
                  <PenBox
                    onClick={() => {
                      locationStore.setLocation(row);
                    }}
                    className="text-primary cursor-pointer"
                    size={16}
                  />
                </Button>
              }
            />
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (!isLocationLoading) {
      locationsStore.put(locationData);
      locationsStore.setColumns(locationColumns);
    }
  }, [isLocationLoading]);

  return (
    <div className="flex flex-col items-stretch gap-5">
      <AccessControl roles={["ADMIN"]}>
        <TitleWrapper title={t("fx")} optype="create" modalNumber={14}>
          <FxRatesListing />
        </TitleWrapper>
      </AccessControl>
      <AccessControl roles={["ADMIN"]}>
        <TitleWrapper title={t("locations")} optype="create" modalNumber={5}>
          <Listing
            columns={locationsStore.columns}
            data={locationsStore.data}
            isLoading={isLocationLoading}
          />
        </TitleWrapper>
      </AccessControl>
    </div>
  );
};





