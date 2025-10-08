import {
  useGlobalLoadingStore,
  useLoggedUserStore,
  useReceiverStore,
  useSelectedCargoStore,
  useSenderStore,
  useToggleCreateStore,
} from "@/utils/store";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "./ui/form";
import { FloatingLabelInput } from "./re/input";
import { Button } from "./ui/button";
import Loader from "./loader";
import {
  useCustomerByPhone,
  useLocations,
  useSupportedCurrencies,
} from "@/services/calls/queries";
import { Skeleton } from "./ui/skeleton";
import { Item, SelectWrapper } from "./re/select";
import { Location } from "@/utils/types";
import { TitleWrapper } from "./wrapper";
import { Search } from "lucide-react";
import { toast } from "./ui/use-toast";
import { useRegisterCargo, useUpdateCargo } from "@/services/calls/mutators";
import { useNavigate } from "react-router-dom";
import { PhoneInput } from "./ui/phone-input";
import { useTranslation } from "react-i18next";

export const CargoForm = () => {
  const { t } = useTranslation();
  const [receiverPhone, setReceiverPhone] = useState("");
  const { data: locations, isLoading: isLocationLoading } = useLocations();
  const { data: supportedCurrencies, isLoading: isCurrencyLoading } =
    useSupportedCurrencies();
  const {
    data: customerData,
    isLoading: isCustomerLoading,
    isError: isCustomerError,
  } = useCustomerByPhone(receiverPhone);

  const [searchLoading, setSearchLoading] = useState(false);
  const receiver = useReceiverStore();
  const sender = useSenderStore();
  const cargo = useSelectedCargoStore();
  const toggle = useToggleCreateStore();
  const loggedUser = useLoggedUserStore();
  const navigate = useNavigate();
  const globalLoading = useGlobalLoadingStore();

  const { mutate: registerCargo, isLoading: isRegistering } =
    useRegisterCargo();
  const { mutate: updateCargo, isLoading: isUpdating } = useUpdateCargo();

  const FormSchema = z.object({
    senderPhone: z.string(),
    senderFirstName: z.string(),
    senderLastName: z.string(),
    receiverPhone: z.string(),
    receiverFirstName: z.string(),
    receiverLastName: z.string(),
    cargoType: z.string(),
    quantity: z.string().refine((val) => {
      return !isNaN(Number(val));
    }, t("validation.quantityNumber")),
    weight: z.string().refine((val) => {
      return !isNaN(Number(val));
    }, t("validation.weightNumber")),
    pickupLocation: z.string(),
    destination: z.string(),
    description: z.string().optional(),
    price: z.coerce.number(),
    currencyCode: z.string().min(1, t("validation.required")),
  });

  useEffect(() => {
    setSearchLoading(isCustomerLoading);
    if (!isCustomerLoading && customerData) {
      setSearchLoading(false);
      receiver.setCustomer(customerData);
      form.setValue("receiverFirstName", customerData?.firstName!);
      form.setValue("receiverLastName", customerData?.lastName!);
      form.setValue("receiverPhone", receiverPhone);
    }

    if (receiverPhone && isCustomerError) {
      setSearchLoading(false);
      toast({
        title: t("error"),
        description: t("receiverNotFound"),
      });
      receiver.setCustomer({
        firstName: "",
        lastName: "",
        phoneNumber: "",
      });
    }
  }, [isCustomerLoading, customerData]);

  useEffect(() => {
    if (toggle.create) {
      receiver.resetCustomer();
      cargo.resetCargo();
    }
  }, [toggle.create]);

  useEffect(() => {
    form.reset({
      ...cargo.cargo,
      weight: cargo.cargo?.weight!.toString(),
      quantity: cargo.cargo?.quantity!.toString(),
      senderPhone: sender.customer?.phoneNumber,
      senderFirstName: sender.customer?.firstName,
      senderLastName: sender.customer?.lastName,
      receiverFirstName: cargo.cargo?.receiver?.firstName,
      receiverLastName: cargo.cargo?.receiver?.lastName,
      receiverPhone: cargo.cargo?.receiver?.phoneNumber,
      price: cargo.cargo?.price?.amount,
      currencyCode:
        cargo.cargo?.price?.currencyCode ||
        loggedUser.user.preferredCurrencyCode ||
        supportedCurrencies?.[0] ||
        "",
    });
  }, [
    cargo.cargo,
    sender.customer,
    loggedUser.user.preferredCurrencyCode,
    supportedCurrencies,
  ]);

  useEffect(() => {
    if (!receiver.customer) return;
    form.setValue("receiverFirstName", receiver.customer?.firstName!);
    form.setValue("receiverLastName", receiver.customer?.lastName!);
  }, [receiver.customer]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {},
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    globalLoading.setGlobalLoading(true);

    if (toggle.create) {
      registerCargo(
        {
          ...data,
          weight: Number(data.weight),
          quantity: Number(data.quantity),
          sender: {
            firstName: sender.customer?.firstName,
            lastName: sender.customer?.lastName,
            phoneNumber: sender.customer?.phoneNumber,
          },
          receiver: {
            firstName: data.receiverFirstName,
            lastName: data.receiverLastName,
            phoneNumber: data.receiverPhone,
          },
          price: {
            amount: data.price,
            currencyCode: data.currencyCode,
          },
        },
        {
          onSuccess: (returned) => {
            globalLoading.setGlobalLoading(false);
            navigate("/cargo/" + sender.customer?.id + "/" + returned.id);
            cargo.setCargo(returned);
            toggle.setCreate(false);
            toast({
              title: t("success"),
              description: t("cargoRegisteredSuccess"),
            });
          },
          onError: (e) => {
            globalLoading.setGlobalLoading(false);
            toast({
              title: t("error"),
              description: e.message,
            });
          },
        }
      );
    } else {
      updateCargo(
        {
          ...data,
          weight: Number(data.weight),
          quantity: Number(data.quantity),
          receiver: {
            firstName: data.receiverFirstName,
            lastName: data.receiverLastName,
            phoneNumber: data.receiverPhone,
          },
          id: cargo.cargo?.id!,
          price: {
            amount: data.price,
            currencyCode: data.currencyCode,
          },
        },
        {
          onSuccess: () => {
            globalLoading.setGlobalLoading(false);
            toast({
              title: t("success"),
              description: t("cargoUpdatedSuccess"),
            });
          },
          onError: () => {
            globalLoading.setGlobalLoading(false);
            toast({
              title: t("error"),
              description: t("errorOccurred"),
            });
          },
        }
      );
    }
  }

  const searchCustomer = () => {
    setReceiverPhone(form.getValues("receiverPhone"));
  };

  const isSubmitting = isRegistering || isUpdating;

  return (
    <div>
      {!isLocationLoading ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid md:grid-cols-2 md:grid-rows-[260px,_1fr] gap-4 text-sm w-full"
          >
            <TitleWrapper
              title={t("sender")}
              className="h-fit"
              subHeader={t("senderInfoAutoFilled")}
            >
              <div className="grid md:grid-cols-2 md:gap-6 gap-2 p-2">
                <FormField
                  control={form.control}
                  name="senderPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput
                          label={t("senderPhone")}
                          className="p-2 h-10"
                          readOnly
                          disabled
                          onSubmitCapture={searchCustomer}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="senderFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput
                          label={t("senderFirstName")}
                          readOnly
                          disabled
                          className="p-2 h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="senderLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput
                          label={t("senderLastName")}
                          readOnly
                          disabled
                          className="p-2 h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TitleWrapper>
            <TitleWrapper
              title={t("receiver")}
              className="h-fit"
              subHeader={t("enterReceiverInfo")}
            >
              <div className="grid md:grid-cols-2 md:gap-6 gap-2 p-2">
                <div className="flex items-end justify-stretch">
                  <FormField
                    control={form.control}
                    name="receiverPhone"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>{t("receiverPhone")}</FormLabel>
                        <FormControl>
                          <PhoneInput
                            className="h-10 !p-0 !m-0"
                            onSubmitCapture={searchCustomer}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant={"outline"}
                    className="h-10 my-2"
                    disabled={searchLoading}
                    onClick={searchCustomer}
                  >
                    {searchLoading ? (
                      <Loader className="h-5 w-5 border-primary" />
                    ) : (
                      <Search className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name="receiverFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput
                          label={t("receiverFirstName")}
                          className="p-2 h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="receiverLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput
                          label={t("receiverLastName")}
                          className="p-2 h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TitleWrapper>
            <TitleWrapper
              title={t("cargoInformation")}
              subHeader={t("enterCargoInfo")}
              className="md:col-span-2 h-fit"
            >
              <div className="grid md:grid-cols-2 md:gap-6 gap-2 p-2 min-h-full">
                <FormField
                  control={form.control}
                  name="cargoType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput
                          label={t("cargoType")}
                          className="p-2 h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput
                          label={t("quantity")}
                          className="p-2 h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2 grid md:grid-cols-[2fr,1fr] md:gap-6 gap-2">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FloatingLabelInput
                            label={t("price")}
                            className="p-2 h-10"
                            type="number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currencyCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("expenseCurrency")}</FormLabel>
                        <SelectWrapper
                          isForm
                          data={
                            (supportedCurrencies || []).map((currency) => ({
                              label: currency,
                              value: currency,
                            })) as Item[]
                          }
                          readonly={isCurrencyLoading}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder={t("expenseCurrency")}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput
                          label={t("weight")}
                          className="p-2 h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pickupLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("pickupLocation")}</FormLabel>
                      <SelectWrapper
                        data={
                          locations?.map((location: Location) => ({
                            label: location.name,
                            value: location.name,
                          })) as Item[]
                        }
                        onValueChange={field.onChange}
                        value={field.value}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("destination")}</FormLabel>
                      <SelectWrapper
                        data={
                          locations?.map((location: Location) => ({
                            label: location.name,
                            value: location.name,
                          })) as Item[]
                        }
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
                    <FormItem className="md:col-span-2">
                      <FormControl>
                        <FloatingLabelInput
                          label={t("description")}
                          className="p-2 h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TitleWrapper>

            <div className="md:col-span-2 flex justify-end mt-3">
              <Button
                type="submit"
                className="md:w-1/3 h-10"
                // Button is disabled if either mutation is in progress, or the global loading is active
                disabled={isSubmitting || globalLoading.globalLoading}
              >
                {/* Show loader only if one of the mutations is submitting */}
                {!isSubmitting ? t("save") : <Loader className="h-5 w-5" />}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <Skeleton className="h-96" />
      )}
    </div>
  );
};
