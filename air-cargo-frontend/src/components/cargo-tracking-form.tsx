import {
  useRegisterCargoTracking,
  useUpdateCargoTracking,
} from "@/services/calls/mutators";
import {
  useCargoTrackingsStore,
  useLoggedUserStore,
  useModalNumber,
  useSelectedCargoStore,
  useSelectedCargoTrackingStore,
} from "@/utils/store";
import { FC, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "./ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ApiError,
  Location,
  LuggageStatus,
  LuggageStatusEnum,
} from "@/utils/types";
import { AxiosError } from "axios";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Loader from "./loader";
import { useLocations } from "@/services/calls/queries";
import { SelectWrapper } from "./re/select";
import { CheckboxWrapper } from "./re/checkbox";
import { useTranslation } from "react-i18next";

type CargoTrackingFormProps = {
  action: "create" | "update";
  trigger?: React.ReactNode;
};

export const CargoTrackingForm: FC<CargoTrackingFormProps> = ({
  action,
  trigger,
}) => {
  const { t } = useTranslation();
  const { data: locations } = useLocations();
  const user = useLoggedUserStore();
  const [cargoTrackingStore, cargoTrackingsStore, cargoStore] = [
    useSelectedCargoTrackingStore(),
    useCargoTrackingsStore(),
    useSelectedCargoStore(),
  ];
  const modalNumber = useModalNumber();
  const [open, setOpen] = useState(!trigger);
  const registerCargoTracking = useRegisterCargoTracking();
  const updateCargoTracking = useUpdateCargoTracking();

  const statusOptions = useMemo(
    () =>
      [
        { label: t("statusCategory.checkedIn"), value: "CHECKED_IN" },
        { label: t("statusCategory.inTransit"), value: "IN_TRANSIT" },
        { label: t("statusCategory.arrived"), value: "ARRIVED" },
        { label: t("statusCategory.lost"), value: "LOST" },
        { label: t("statusCategory.delivered"), value: "DELIVERED" },
        { label: t("statusCategory.pending"), value: "PENDING" },
        { label: t("statusCategory.damaged"), value: "DAMAGED" },
        { label: t("statusCategory.retrieved"), value: "RETRIEVED" },
        { label: t("statusCategory.onHold"), value: "ON_HOLD" },
        { label: t("statusCategory.customsCheck"), value: "CUSTOMS_CHECK" },
        { label: t("statusCategory.inOffice"), value: "IN_OFFICE" },
      ] as const,
    [t]
  );

  const FormSchema = z.object({
    location: z.string().optional(),
    description: z.string(),
    history: z.array(z.string()).min(1, t("validation.atLeastOneStatus")),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      history: [],
    },
  });

  const handleOpenChange = (nextOpen?: boolean) => {
    const newOpen = typeof nextOpen === "boolean" ? nextOpen : !open;
    setOpen(newOpen);
    if (!newOpen && modalNumber.modalNumber != 2) {
      cargoTrackingStore.setCargoTracking({} as any);
    }
    if (!trigger) modalNumber.setModalNumberAndType(0);
  };

  useEffect(() => {
    const initialData = cargoTrackingStore.cargoTracking;
    if (initialData) {
      form.reset({
        ...initialData,
        history:
          initialData.history?.map((history) => history?.status?.toString()) ??
          [],
      });
    } else if (action === "create") {
      form.reset({ history: [] });
    }
  }, [cargoTrackingStore.cargoTracking]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const payload = {
      ...data,
      cargo: { id: cargoStore.cargo?.id },
      createdBy: { id: user.user?.id },
    };

    const toHistory = (history: string[]) =>
      history.map((status) => ({
        status: status as unknown as LuggageStatusEnum,
      })) as LuggageStatus[];

    if (action === "create") {
      registerCargoTracking.mutate(
        {
          ...payload,
          history: toHistory(payload.history),
        },
        {
          onSuccess: (data) => {
            cargoTrackingsStore.addCargoTracking(data);
            handleOpenChange();
            toast({
              title: t("cargoTracking.createdSuccess"),
              description: t("cargoTracking.createdDescription", {
                description: data.cargo?.description,
              }),
            });
          },
          onError: (error) => {
            let description =
              (error as AxiosError<ApiError>).response?.data?.detail ??
              t("errorOccurred");
            if ((error as AxiosError).response?.status === 400) {
              description = t("requestCannotComplete");
            }
            toast({
              title: t("cargoTracking.createError"),
              variant: "destructive",
              description,
            });
          },
        }
      );
    } else {
      updateCargoTracking.mutate(
        {
          ...payload,
          id: cargoTrackingStore.cargoTracking?.id,
          history: toHistory(payload.history),
        },
        {
          onSuccess: (data) => {
            cargoTrackingsStore.updateCargoTracking(data);
            cargoTrackingStore.setCargoTracking(data);
            handleOpenChange();
            toast({
              title: t("cargoTracking.updatedSuccess"),
              description: t("cargoTracking.updatedDescription", {
                description: data.cargo?.description,
              }),
            });
          },
          onError: (error) => {
            let description =
              (error as AxiosError<ApiError>).response?.data?.detail ??
              t("errorOccurred");
            if ((error as AxiosError).response?.status === 400) {
              description = t("requestCannotComplete");
            }
            toast({
              title: t("cargoTracking.updateError"),
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
      {trigger ? (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>{trigger as any}</DialogTrigger>
          <DialogContent>
            <DialogTitle>{t("cargoTracking.details")}</DialogTitle>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid md:grid-cols-2 gap-3 py-3">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("destination")}</FormLabel>
                        <SelectWrapper
                          readonly={action === "update"}
                          data={locations?.map((location: Location) => ({
                            label: location.name,
                            value: location.name,
                          }))}
                          onValueChange={field.onChange}
                          value={field.value}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder={t("description")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="history"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>{t("status.label")}</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {statusOptions.map((option) => (
                            <CheckboxWrapper
                              key={option.value}
                              label={option.label}
                              disabled={
                                field.value.length >= 3 &&
                                !field.value.includes(option.value)
                              }
                              checked={field.value.includes(option.value)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value;
                                if (checked) {
                                  field.onChange([
                                    ...currentValues,
                                    option.value,
                                  ]);
                                } else {
                                  field.onChange(
                                    currentValues.filter(
                                      (v) => v !== option.value
                                    )
                                  );
                                }
                              }}
                              className="items-center"
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      registerCargoTracking.isLoading ||
                      updateCargoTracking.isLoading
                    }
                  >
                    {action == "create" &&
                    !(
                      registerCargoTracking.isLoading ||
                      updateCargoTracking.isLoading
                    ) ? (
                      t("cargoTracking.createButton")
                    ) : action == "update" &&
                      !(
                        registerCargoTracking.isLoading ||
                        updateCargoTracking.isLoading
                      ) ? (
                      t("cargoTracking.updateButton")
                    ) : (
                      <Loader className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      ) : (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent>
            <DialogTitle>{t("cargoTracking.details")}</DialogTitle>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid md:grid-cols-2 gap-3 py-3">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("destination")}</FormLabel>
                        <SelectWrapper
                          readonly={action === "update"}
                          data={locations?.map((location: Location) => ({
                            label: location.name,
                            value: location.name,
                          }))}
                          onValueChange={field.onChange}
                          value={field.value}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder={t("description")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="history"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>{t("status.label")}</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {statusOptions.map((option) => (
                            <CheckboxWrapper
                              key={option.value}
                              label={option.label}
                              disabled={
                                field.value.length >= 3 &&
                                !field.value.includes(option.value)
                              }
                              checked={field.value.includes(option.value)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value;
                                if (checked) {
                                  field.onChange([
                                    ...currentValues,
                                    option.value,
                                  ]);
                                } else {
                                  field.onChange(
                                    currentValues.filter(
                                      (v) => v !== option.value
                                    )
                                  );
                                }
                              }}
                              className="items-center"
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      registerCargoTracking.isLoading ||
                      updateCargoTracking.isLoading
                    }
                  >
                    {action == "create" &&
                    !(
                      registerCargoTracking.isLoading ||
                      updateCargoTracking.isLoading
                    ) ? (
                      t("cargoTracking.createButton")
                    ) : action == "update" &&
                      !(
                        registerCargoTracking.isLoading ||
                        updateCargoTracking.isLoading
                      ) ? (
                      t("cargoTracking.updateButton")
                    ) : (
                      <Loader className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
