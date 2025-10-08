import {
  useRegisterCustomer,
  useUpdateCustomer,
} from "@/services/calls/mutators";
import {
  useCustomersStore,
  useModalNumber,
  useSelectedCustomerStore,
} from "@/utils/store";
import { FC, useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "./ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError, Customer } from "@/utils/types";
import { AxiosError } from "axios";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogTitle } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import Loader from "./loader";
import { PhoneInput } from "./ui/phone-input";
import { useTranslation } from "react-i18next";

type CustomerFormProps = {
  action: "create" | "update";
  trigger?: React.ReactNode;
};

export const CustomerForm: FC<CustomerFormProps> = ({ action, trigger }) => {
  const { t } = useTranslation();
  const [customerStore, customersStore] = [
    useSelectedCustomerStore(),
    useCustomersStore(),
  ];
  const modalNumber = useModalNumber();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(!trigger);
  const [{ mutate: registerCustomer }, { mutate: updateCustomer }] = [
    useRegisterCustomer(),
    useUpdateCustomer(),
  ];

  const FormSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(t("validation.invalidEmail")),
    address: z.string(),
    phoneNumber: z.string(),
    gender: z.enum(["MALE", "FEMALE"]),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const handleOpenChange = async () => {
    await setOpen((prev) => !prev);
    if (open && modalNumber.modalNumber != 2) customerStore.setCustomer({});
    if (!trigger) modalNumber.setModalNumberAndType(0);
  };

  useEffect(() => {
    form.reset(customerStore.customer);
    if (action === "create") form.reset({});
  }, [customerStore.customer]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    if (action === "create") {
      registerCustomer(
        { ...(data as Customer) },
        {
          onSuccess: (data) => {
            setLoading(false);
            customersStore.addCustomer(data);
            handleOpenChange();
            toast({
              title: t("customerModal.createdSuccess"),
              description: t("customerModal.createdDescription", {
                name: data.firstName,
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
              title: t("customerModal.createError"),
              variant: "destructive",
              description,
            });
          },
        }
      );
    } else {
      updateCustomer(
        {
          ...data,
          id: customerStore.customer?.id!,
        },
        {
          onSuccess: (data) => {
            customersStore.updateCustomer(data);
            customerStore.setCustomer(data);
            setLoading(false);
            handleOpenChange();
            toast({
              title: t("customerModal.updatedSuccess"),
              description: t("customerModal.updatedDescription", {
                name: data.firstName,
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
              title: t("customerModal.updateError"),
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
          <DialogTitle>{t("customerModal.details")}</DialogTitle>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid md:grid-cols-2 gap-3 py-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={t("customerModal.firstName")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={t("customerModal.lastName")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={t("customerModal.email")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={t("customerModal.address")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <PhoneInput
                          placeholder={t("customerModal.phoneNumber")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("customerModal.selectGender")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MALE">
                            {t("genderCategory.male")}
                          </SelectItem>
                          <SelectItem value="FEMALE">
                            {t("genderCategory.female")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {action == "create" && !loading ? (
                    t("customerModal.createButton")
                  ) : action == "update" && !loading ? (
                    t("customerModal.updateButton")
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
