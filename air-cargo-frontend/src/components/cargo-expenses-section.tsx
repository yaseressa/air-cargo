import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FloatingLabelInput } from "@/components/re/input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Item, SelectWrapper } from "@/components/re/select";
import { TitleWrapper } from "@/components/wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCargoExpenses, useSupportedCurrencies } from "@/services/calls/queries";
import { useCreateCargoExpense } from "@/services/calls/mutators";
import { useLoggedUserStore } from "@/utils/store";
import { useQueryClient } from "react-query";
import { toast } from "@/components/ui/use-toast";
import { buildFileUrl } from "@/utils";
import SecureImage from "@/components/secure-image";
import { Loader2, Paperclip } from "lucide-react";

interface CargoExpensesSectionProps {
  cargoId: string;
}

type ExpenseFormValues = {
  description: string;
  amount: string;
  currencyCode: string;
  incurredAt?: string;
};

const formatAmount = (amount?: { amount?: number; currencyCode?: string }) => {
  if (!amount?.amount) return "";

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: amount.currencyCode || "USD",
    }).format(amount.amount);
  } catch (error) {
    return `${amount.amount} ${amount.currencyCode ?? ""}`.trim();
  }
};

export const CargoExpensesSection = ({ cargoId }: CargoExpensesSectionProps) => {
  const { t } = useTranslation();
  const loggedUser = useLoggedUserStore();
  const queryClient = useQueryClient();
  const { data: expenses, isLoading: isExpensesLoading } = useCargoExpenses(cargoId);
  const { data: supportedCurrencies, isLoading: isCurrencyLoading } = useSupportedCurrencies();
  const { mutate: createExpense, isLoading: isCreating } = useCreateCargoExpense();
  const [receiptFile, setReceiptFile] = useState<globalThis.File | undefined>();
  const [receiptPreview, setReceiptPreview] = useState<string | undefined>();

  const expenseSchema = useMemo(
    () =>
      z.object({
        description: z.string().min(1, t("validation.required")),
        amount: z
          .string()
          .min(1, t("validation.required"))
          .refine((value) => {
            const parsed = Number(value);
            return !Number.isNaN(parsed) && parsed > 0;
          }, t("validation.positiveNumber")),
        currencyCode: z.string().min(1, t("validation.required")),
        incurredAt: z.string().optional(),
      }),
    [t]
  );

  const today = new Date().toISOString().slice(0, 10);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: "",
      currencyCode: "",
      incurredAt: today,
    },
  });

  useEffect(() => {
    const preferred =
      form.getValues("currencyCode") ||
      loggedUser.user.preferredCurrencyCode ||
      supportedCurrencies?.[0] ||
      "";

    if (preferred) {
      form.setValue("currencyCode", preferred);
    }
  }, [form, loggedUser.user.preferredCurrencyCode, supportedCurrencies]);

  useEffect(() => {
    return () => {
      if (receiptPreview) {
        URL.revokeObjectURL(receiptPreview);
      }
    };
  }, [receiptPreview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];

    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
      setReceiptPreview(undefined);
    }

    if (selected) {
      setReceiptFile(selected);
      setReceiptPreview(URL.createObjectURL(selected));
    } else {
      setReceiptFile(undefined);
    }
  };

  const resetForm = (currencyCode: string) => {
    form.reset({
      description: "",
      amount: "",
      currencyCode,
      incurredAt: today,
    });
    setReceiptFile(undefined);
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
      setReceiptPreview(undefined);
    }
  };

  const onSubmit = (values: ExpenseFormValues) => {
    const payload = {
      description: values.description,
      amount: Number(values.amount),
      currencyCode: values.currencyCode,
      incurredAt: values.incurredAt
        ? new Date(values.incurredAt).toISOString()
        : null,
    };

    createExpense(
      { cargoId, data: payload, file: receiptFile },
      {
        onSuccess: () => {
          toast({
            title: t("success"),
            description: t("expenseCreated"),
          });
          queryClient.invalidateQueries(["cargoExpenses", cargoId]);
          resetForm(values.currencyCode);
        },
        onError: (error) => {
          toast({
            title: t("error"),
            description:
              error instanceof Error ? error.message : t("expenseCreationFailed"),
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <TitleWrapper
      title={t("expensesSectionTitle")}
      subHeader={t("expensesSectionSubtitle")}
      className="h-fit"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px),1fr] p-2">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingLabelInput
                      label={t("expenseDescription")}
                      className="p-2 h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-2 md:grid-cols-[2fr,1fr]">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingLabelInput
                        label={t("expenseAmount")}
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
              name="incurredAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("expenseDate")}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>{t("expenseReceipt")}</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                aria-label={t("expenseReceipt")}
              />
              {receiptPreview && (
                <div className="h-24 w-24 overflow-hidden rounded-md border">
                  <img
                    src={receiptPreview}
                    alt={t("receiptPreview")}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                t("addExpense")
              )}
            </Button>
          </form>
        </Form>

        <div className="space-y-4">
          {isExpensesLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-28 w-full" />
              ))}
            </div>
          ) : expenses && expenses.length > 0 ? (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <Card key={expense.id}>
                  <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatAmount(expense.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {expense.incurredAt
                          ? new Date(expense.incurredAt).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                    {expense.receipt?.fileUrl ? (
                      <a
                        href={buildFileUrl(expense.receipt.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Paperclip className="h-4 w-4" />
                        {t("viewReceipt")}
                      </a>
                    ) : null}
                    {expense.receipt?.fileUrl && (
                      <div className="h-16 w-16 overflow-hidden rounded-md border">
                        <SecureImage
                          fileURL={expense.receipt.fileUrl}
                          fileName={expense.receipt.fileName ?? "receipt"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-[7rem] items-center justify-center rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground">{t("noExpenses")}</p>
            </div>
          )}
        </div>
      </div>
    </TitleWrapper>
  );
};

export default CargoExpensesSection;
