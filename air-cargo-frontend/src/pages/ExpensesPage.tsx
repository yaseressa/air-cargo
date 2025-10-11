import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import { useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";

import DataTable, { ColumnDef } from "@/components/data-table";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useCreateExpense } from "@/services/calls/mutators";
import { useExpenses, useSupportedCurrencies } from "@/services/calls/queries";
import type { Expense } from "@/utils/types";

type ExpenseFormValues = {
  description: string;
  amount: string;
  currencyCode: string;
  incurredAt: string;
};

const formatAmount = (expense?: Expense) => {
  if (!expense?.amount?.amount) return "";

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: expense.amount.currencyCode || "USD",
      minimumFractionDigits: 2,
    }).format(Number(expense.amount.amount));
  } catch (error) {
    return `${expense.amount.amount} ${
      expense.amount.currencyCode ?? ""
    }`.trim();
  }
};

const ExpensesPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: expenses = [], isLoading, isFetching } = useExpenses();
  const { data: supportedCurrencies = [], isLoading: loadingCurrencies } =
    useSupportedCurrencies();
  const { mutate: createExpense, isLoading: isCreating } = useCreateExpense();

  const [searchCriteria, setSearchCriteria] = useState("");
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();
  const [receiptFile, setReceiptFile] = useState<globalThis.File | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const formSchema = useMemo(
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
        incurredAt: z.string().min(1, t("validation.required")),
      }),
    [t]
  );

  const today = format(new Date(), "yyyy-MM-dd");

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      currencyCode: "",
      incurredAt: today,
    },
  });

  useEffect(() => {
    if (supportedCurrencies?.length && !form.getValues("currencyCode")) {
      form.setValue("currencyCode", supportedCurrencies[0]);
    }
  }, [form, supportedCurrencies]);

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const resetForm = () => {
    const preferredCurrency =
      form.getValues("currencyCode") || supportedCurrencies?.[0] || "";
    form.reset({
      description: "",
      amount: "",
      currencyCode: preferredCurrency,
      incurredAt: today,
    });
    setReceiptFile(undefined);
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
      { data: payload, file: receiptFile },
      {
        onSuccess: () => {
          toast({
            title: t("success"),
            description: t("expenseCreated"),
          });
          queryClient.invalidateQueries(["expenses"]);
          handleDialogChange(false);
        },
        onError: (error) => {
          toast({
            title: t("error"),
            description:
              error instanceof Error
                ? error.message
                : t("expenseCreationFailed"),
            variant: "destructive",
          });
        },
      }
    );
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch = searchCriteria
        ? [
            expense.description,
            expense.amount?.currencyCode,
            expense.amount?.amount?.toString(),
          ]
            .filter(Boolean)
            .some((value) =>
              value!
                .toString()
                .toLowerCase()
                .includes(searchCriteria.toLowerCase())
            )
        : true;

      const incurredDate = expense.incurredAt
        ? new Date(expense.incurredAt)
        : undefined;
      const from = fromDate ? new Date(fromDate) : undefined;
      const to = toDate ? new Date(toDate) : undefined;

      const afterFrom = from
        ? incurredDate
          ? incurredDate >= from
          : false
        : true;
      const beforeTo = to ? (incurredDate ? incurredDate <= to : false) : true;

      return matchesSearch && afterFrom && beforeTo;
    });
  }, [expenses, fromDate, searchCriteria, toDate]);

  const totalsByCurrency = useMemo(() => {
    return filteredExpenses.reduce<Record<string, number>>((acc, expense) => {
      const currency = expense.amount?.currencyCode ?? "";
      const value = Number(expense.amount?.amount ?? 0);
      if (!currency) return acc;
      acc[currency] = (acc[currency] ?? 0) + value;
      return acc;
    }, {});
  }, [filteredExpenses]);

  const columns = useMemo<ColumnDef[]>(
    () => [
      {
        header: t("expenseDescription"),
        accessorKey: "description",
        cell: ({ row }) => (
          <span className="font-medium text-primary">
            {row.original.description}
          </span>
        ),
      },
      {
        header: t("amount"),
        accessorKey: "amount",
        cell: ({ row }) => <span>{formatAmount(row.original)}</span>,
      },
      {
        header: t("expenseCurrency"),
        accessorKey: "currencyCode",
        cell: ({ row }) => (
          <Badge variant="outline" className="uppercase">
            {row.original.amount?.currencyCode ?? ""}
          </Badge>
        ),
      },
      {
        header: t("expenseDate"),
        accessorKey: "incurredAt",
        cell: ({ row }) =>
          row.original.incurredAt
            ? format(new Date(row.original.incurredAt), "PP")
            : t("nA"),
      },
      {
        header: t("createdAt"),
        accessorKey: "createdAt",
        cell: ({ row }) =>
          row.original.createdAt
            ? format(new Date(row.original.createdAt), "PP")
            : t("nA"),
      },
      {
        header: t("expenseReceipt"),
        accessorKey: "receipt",
        cell: ({ row }) =>
          row.original.receipt?.fileUrl ? (
            <Button variant="ghost" size="sm" asChild>
              <a
                href={row.original.receipt.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {t("viewReceipt")}
              </a>
            </Button>
          ) : (
            <span className="text-muted-foreground">
              {t("noReceiptAttached")}
            </span>
          ),
      },
    ],
    [t]
  );

  return (
    <>
      <Header />
      <main className="flex flex-col gap-6 m-2">
        <div className="px-2 flex flex-col gap-2">
          <div className="flex flex-wrap gap-4">
            {Object.entries(totalsByCurrency).map(([currency, total]) => (
              <Card key={currency} className="min-w-[180px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
                    {t("totalExpensesIn", { currency })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">
                    {new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency,
                    }).format(total)}
                  </p>
                </CardContent>
              </Card>
            ))}
            {!Object.keys(totalsByCurrency).length && (
              <Card className="min-w-[180px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("noExpensesYet")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-muted-foreground">
                    {t("startByRecordingExpense")}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
          <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{t("addExpense")}</DialogTitle>
                <DialogDescription>
                  {t("recordNewExpenseDescription")}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  className="space-y-4"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("expenseDescription")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("expenseDescriptionPlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("expenseAmount")}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
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
                          <Select
                            disabled={loadingCurrencies}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t("selectCurrency")}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {supportedCurrencies?.map((currency) => (
                                <SelectItem
                                  key={currency}
                                  value={currency}
                                  className="uppercase"
                                >
                                  {currency}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          <Input type="date" max={today} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <FormLabel>{t("expenseReceipt")}</FormLabel>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        setReceiptFile(file ?? undefined);
                      }}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? t("saving") : t("save")}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <DataTable
          loading={isLoading}
          refetching={isFetching}
          columns={columns}
          tableData={filteredExpenses}
          setSearchCriteria={(value: string) => setSearchCriteria(value)}
          setFromDate={(value: string) => setFromDate(value)}
          setToDate={(value: string) => setToDate(value)}
          searchCriteria={searchCriteria}
          headerShown
          paginationVisible={false}
          columnsShown={false}
          report="expenses"
          onCreateClick={() => handleDialogChange(true)}
        />
      </main>
    </>
  );
};

export default ExpensesPage;
