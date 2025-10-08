import { useCreateFxRate, useUpdateFxRate } from "@/services/calls/mutators";
import {
  useFxRateStore,
  useModalNumber,
  useSelectedFxRateStore,
} from "@/utils/store";
import { FC, useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "./ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError, FXRate } from "@/utils/types";
import { AxiosError } from "axios";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogTitle } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";

import { Button } from "./ui/button";
import Loader from "./loader";
import { useTranslation } from "react-i18next";

type FxRateFormProps = {
  action: "create" | "update";
  trigger?: React.ReactNode;
};

export const FxRateForm: FC<FxRateFormProps> = ({ action, trigger }) => {
  const { t } = useTranslation();
  const [fxRateStore, fxRatesStore] = [
    useSelectedFxRateStore(),
    useFxRateStore(),
  ];
  const modalNumber = useModalNumber();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(!trigger);
  const [{ mutate: registerFxRate }, { mutate: updateFxRate }] = [
    useCreateFxRate(),
    useUpdateFxRate(),
  ];

  const FormSchema = z.object({
    destinationCurrency: z.string(),
    rate: z.coerce.number(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const handleOpenChange = async () => {
    await setOpen((prev) => !prev);
    if (open && modalNumber.modalNumber != 2) fxRateStore.setFxRate({});
    if (!trigger) modalNumber.setModalNumberAndType(0);
  };

  useEffect(() => {
    form.reset(fxRateStore?.fxRate!);
    if (action === "create") form.reset({});
  }, [fxRateStore.fxRate]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    if (action === "create") {
      registerFxRate(
        { ...(data as FXRate) },
        {
          onSuccess: (data) => {
            setLoading(false);
            fxRatesStore.addFxRates(data);
            handleOpenChange();
            toast({
              title: t("fxRateModal.createdSuccess"),
              description: t("fxRateModal.createdDescription", {
                name: data.destinationCurrency,
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
              title: t("fxRateModal.createError"),
              variant: "destructive",
              description,
            });
          },
        }
      );
    } else {
      updateFxRate(
        {
          ...data,
          id: fxRateStore.fxRate?.id!,
        },
        {
          onSuccess: (data) => {
            fxRatesStore.updateFxRates(data);
            fxRateStore.setFxRate(data);
            setLoading(false);
            handleOpenChange();
            toast({
              title: t("fxRateModal.updatedSuccess"),
              description: t("fxRateModal.updatedDescription", {
                name: data.destinationCurrency,
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
              title: t("fxRateModal.updateError"),
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
        <DialogContent>
          <DialogTitle>{t("fxRateModal.details")}</DialogTitle>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid md:grid-cols-2 gap-3 py-3">
                <FormField
                  control={form.control}
                  name="destinationCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={t("fxRateModal.currency")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={t("fxRateModal.rate")}
                          type="number"
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
                    t("fxRateModal.createButton")
                  ) : action == "update" && !loading ? (
                    t("fxRateModal.updateButton")
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
