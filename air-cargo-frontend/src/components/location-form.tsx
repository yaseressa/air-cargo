import {
  useRegisterLocation,
  useUpdateLocation,
} from "@/services/calls/mutators";
import { FC, useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "./ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError, Location } from "@/utils/types";
import { AxiosError } from "axios";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogTitle } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Button } from "./ui/button";
import Loader from "./loader";
import {
  useLocationsStore,
  useLocationStore,
  useModalNumber,
} from "@/utils/store";
import { FloatingLabelInput } from "./re/input";
import { useTranslation } from "react-i18next";

type LocationFormProps = {
  action: "create" | "update";
  trigger?: React.ReactNode;
};

export const LocationForm: FC<LocationFormProps> = ({ action, trigger }) => {
  const { t } = useTranslation();
  const [locationStore, locationsStore] = [
    useLocationStore(),
    useLocationsStore(),
  ];
  const modalNumber = useModalNumber();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(!trigger);
  const [{ mutate: registerLocation }, { mutate: updateLocation }] = [
    useRegisterLocation(),
    useUpdateLocation(),
  ];

  const FormSchema = z.object({
    name: z.string(),
    country: z.string(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const handleOpenChange = () => {
    setOpen((prev) => !prev);
    if (open && modalNumber.type == "create") locationStore.setLocation({});
    if (!trigger) modalNumber.setModalNumberAndType(0);
  };

  useEffect(() => {
    form.reset(locationStore.location);
  }, [locationStore.location]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    if (action === "create") {
      registerLocation(
        { ...(data as Location) },
        {
          onSuccess: (data) => {
            setLoading(false);
            locationsStore.addLocation(data);
            handleOpenChange();
            toast({
              title: t("locationModal.createdSuccess"),
              description: t("locationModal.createdDescription", {
                name: data.name,
              }),
            });
          },
          onError: (error) => {
            setLoading(false);
            let description =
              (error as AxiosError<ApiError>).response?.data?.detail ??
              t("errorOccurred");
            if ((error as AxiosError).response?.status === 400) {
              description = t("requestCannotComplete");
            }
            toast({
              title: t("locationModal.createError"),
              variant: "destructive",
              description,
            });
          },
        }
      );
    } else {
      updateLocation(
        {
          id: locationStore.location?.id!,
          ...locationStore.location,
          ...data,
        },
        {
          onSuccess: (data) => {
            setLoading(false);
            handleOpenChange();
            toast({
              title: t("locationModal.updatedSuccess"),
              description: t("locationModal.updatedDescription", {
                name: data.name,
              }),
            });
          },
          onError: (error) => {
            setLoading(false);
            let description =
              (error as AxiosError<ApiError>).response?.data?.detail ??
              t("errorOccurred");
            if ((error as AxiosError).response?.status === 400) {
              description = t("requestCannotComplete");
            }
            toast({
              title: t("locationModal.updateError"),
              variant: "destructive",
              description,
            });
          },
        }
      );
    }
  }

  return (
    <>
      <div onClick={handleOpenChange}>{trigger}</div>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="md:w-fit w-[300px]">
          <DialogTitle>{t("locationModal.details")}</DialogTitle>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid md:grid-cols-2 gap-3 py-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput
                          label={t("locationModal.name")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput
                          label={t("locationModal.country")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {action == "create" && !loading ? (
                    t("locationModal.createButton")
                  ) : action == "update" && !loading ? (
                    t("locationModal.updateButton")
                  ) : (
                    <Loader className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
