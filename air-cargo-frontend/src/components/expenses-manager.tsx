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
import { useExpenses, useSupportedCurrencies } from "@/services/calls/queries";
import { useCreateExpense } from "@/services/calls/mutators";
import { useLoggedUserStore } from "@/utils/store";
import { useQueryClient } from "react-query";
import { toast } from "@/components/ui/use-toast";
import { buildFileUrl } from "@/utils";
import SecureImage from "@/components/secure-image";
import { Loader2, Paperclip } from "lucide-react";
import type { Expense } from "@/utils/types";

export type ExpenseFormValues = {
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

const ExpensesManager = () => {
  const { t } = useTranslation();
  const loggedUser = useLoggedUserStore();
  const queryClient = useQueryClient();
  const { data: expenses, isLoading: isExpensesLoading } = useExpenses();
  const { data: supportedCurrencies, isLoading: isCurrencyLoading } = useSupportedCurrencies();
  const { mutate: createExpense, isLoading: isCreating } = useCreateExpense();
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
      incurredAt: values.incurredAt ? new Date(values.incurredAt).toISOString() : null,
    };

    createExpense(
      { data: payload, file: receiptFile },
      {
        onSuccess: () => {
          toast({
            title: t("success"),
            description: t("expenseCreated"),
          });
          queryClient.invalidateQueries(["expenses"]);
          resetForm(values.currencyCode);
        },
        onError: (error) => {
          toast({
            title: t("error"),
            description: error instanceof Error ? error.message : t("expenseCreationFailed"),
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
                    <FormLabel>{t("currency")}</FormLabel>
                    <SelectWrapper
                      data={supportedCurrencies?.map(
                        (currency: string): Item => ({
                          label: currency,
                          value: currency,
                        })
                      )}
                      placeholder={
                        isCurrencyLoading ? t("loading") : t("selectCurrencyPlaceholder")
                      }
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isCurrencyLoading}
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
                  <FormLabel>{t("incurredAt")}</FormLabel>
                  <Input
                    type="date"
                    value={field.value}
                    onChange={field.onChange}
                    className="rounded"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>{t("receiptOptional")}</FormLabel>
              <label className="flex items-center gap-2 cursor-pointer rounded border px-3 py-2 text-sm">
                <Paperclip className="h-4 w-4" />
                <span>{receiptFile ? receiptFile.name : t("attachReceipt")}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              {receiptPreview && (
                <div className="h-32 w-full overflow-hidden rounded border">
                  <img src={receiptPreview} alt={t("receiptPreview") ?? ""} className="h-full w-full object-cover" />
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
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-32 w-full" />
              ))}
            </div>
          ) : expenses && expenses.length > 0 ? (
            <div className="grid gap-4">
              {expenses.map((expense: Expense) => (
                <Card key={expense.id} className="border rounded-lg">
                  <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr,160px]">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{expense.description}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("incurredOn", {
                          date: expense.incurredAt
                            ? new Date(expense.incurredAt).toLocaleDateString()
                            : t("notAvailable"),
                        })}
                      </p>
                      <p className="font-medium text-primary">
                        {formatAmount(expense.amount)}
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-3">
                      {expense.receipt?.fileUrl ? (
                        <div className="h-32 w-full overflow-hidden rounded border bg-muted/30">
                          <SecureImage
                            fileURL={expense.receipt.fileUrl}
                            fileName={expense.receipt.fileName ?? "receipt"}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center">
                          {t("noReceiptAttached")}
                        </p>
                      )}
                      {expense.receipt?.fileUrl && (
                        <a
                          href={buildFileUrl(expense.receipt.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary underline"
                        >
                          {t("viewReceipt")}
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded border p-6">
              <p className="text-muted-foreground">{t("noExpensesYet")}</p>
            </div>
          )}
        </div>
      </div>
    </TitleWrapper>
  );
};

export default ExpensesManager;
